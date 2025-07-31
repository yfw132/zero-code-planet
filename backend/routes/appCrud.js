const express = require("express");
const router = express.Router();
const DataSource = require("../models/DataSource");
const mongoose = require("mongoose");

/**
 * 动态CRUD接口生成器
 * 基于数据源配置自动生成增删改查接口
 */

// 模型缓存
const modelCache = new Map();

// 清理模型缓存
function clearModelCache(datasourceid = null) {
  if (datasourceid) {
    const modelName = `Data_${datasourceid}`;
    modelCache.delete(modelName);
    // 注意：这里不能删除mongoose.models中的模型，因为Mongoose不允许删除已编译的模型
  } else {
    modelCache.clear();
  }
}

// 动态创建集合模型
function createDynamicModel(dataSourceConfig) {
  const modelName = `Data_${dataSourceConfig.datasourceid}`;

  // 检查缓存中是否已存在该模型
  if (modelCache.has(modelName)) {
    return modelCache.get(modelName);
  }

  // 检查Mongoose是否已经编译过该模型
  if (mongoose.models[modelName]) {
    const model = mongoose.models[modelName];
    modelCache.set(modelName, model);
    return model;
  }

  const schemaFields = {};

  // 遍历数据源字段配置
  dataSourceConfig.dataSource.forEach((field) => {
    const fieldConfig = {
      type: getMongooseType(field.type),
      required: field.validation?.required || false,
      trim: field.type === "string",
      default: field.config?.default,
    };

    // 添加验证规则
    if (field.validation) {
      if (field.validation.minLength) {
        fieldConfig.minlength = field.validation.minLength;
      }
      if (field.validation.maxLength) {
        fieldConfig.maxlength = field.validation.maxLength;
      }
      if (field.validation.min !== undefined) {
        fieldConfig.min = field.validation.min;
      }
      if (field.validation.max !== undefined) {
        fieldConfig.max = field.validation.max;
      }
      if (field.validation.pattern) {
        fieldConfig.match = new RegExp(field.validation.pattern);
      }
    }

    schemaFields[field.name] = fieldConfig;
  });

  // 添加通用字段
  schemaFields.appid = { type: String, required: true };
  schemaFields.datasourceid = { type: String, required: true };
  schemaFields.createdAt = { type: Date, default: Date.now };
  schemaFields.updatedAt = { type: Date, default: Date.now };

  const schema = new mongoose.Schema(schemaFields, {
    timestamps: true,
    collection: `data_${dataSourceConfig.datasourceid}`, // 使用数据源ID作为集合名
  });

  // 添加索引
  schema.index({ appid: 1 });
  schema.index({ datasourceid: 1 });

  // 为每个字段添加索引（可选）
  dataSourceConfig.dataSource.forEach((field) => {
    if (field.validation?.required) {
      schema.index({ [field.name]: 1 });
    }
  });

  // 创建模型并缓存
  const model = mongoose.model(modelName, schema);
  modelCache.set(modelName, model);

  return model;
}

// 获取Mongoose数据类型
function getMongooseType(fieldType) {
  const typeMap = {
    string: String,
    number: Number,
    boolean: Boolean,
    date: Date,
    array: [String], // 默认数组类型为字符串数组
  };
  return typeMap[fieldType] || String;
}

// 数据验证函数
function validateData(data, dataSourceConfig) {
  const errors = [];

  dataSourceConfig.dataSource.forEach((field) => {
    const value = data[field.name];

    // 必填验证
    if (field.validation?.required && (!value || value === "")) {
      errors.push(`${field.label}是必填项`);
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      // 类型验证
      if (field.type === "number" && isNaN(Number(value))) {
        errors.push(`${field.label}必须是数字类型`);
      }

      // 长度验证
      if (field.type === "string") {
        if (
          field.validation?.minLength &&
          value.length < field.validation.minLength
        ) {
          errors.push(
            `${field.label}最少需要${field.validation.minLength}个字符`
          );
        }
        if (
          field.validation?.maxLength &&
          value.length > field.validation.maxLength
        ) {
          errors.push(`${field.label}最多${field.validation.maxLength}个字符`);
        }
      }

      // 数值范围验证
      if (field.type === "number") {
        const numValue = Number(value);
        if (
          field.validation?.min !== undefined &&
          numValue < field.validation.min
        ) {
          errors.push(`${field.label}不能小于${field.validation.min}`);
        }
        if (
          field.validation?.max !== undefined &&
          numValue > field.validation.max
        ) {
          errors.push(`${field.label}不能大于${field.validation.max}`);
        }
      }

      // 正则验证
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors.push(`${field.label}格式不正确`);
        }
      }
    }
  });

  return errors;
}

// 构建查询条件
function buildQueryConditions(query, dataSourceConfig) {
  const conditions = {};

  // 基础查询条件
  if (query.appid) {
    conditions.appid = query.appid;
  }
  if (query.datasourceid) {
    conditions.datasourceid = query.datasourceid;
  }

  // 动态字段查询
  dataSourceConfig.dataSource.forEach((field) => {
    if (query[field.name]) {
      if (field.type === "string") {
        // 字符串字段支持模糊查询
        conditions[field.name] = new RegExp(query[field.name], "i");
      } else {
        conditions[field.name] = query[field.name];
      }
    }
  });

  return conditions;
}

// 构建排序条件
function buildSortConditions(sort, dataSourceConfig) {
  if (!sort) return { createdAt: -1 };

  const sortFields = {};
  const [field, order] = sort.split(":");

  // 验证字段是否存在
  const validFields = [
    "createdAt",
    "updatedAt",
    ...dataSourceConfig.dataSource.map((f) => f.name),
  ];
  if (validFields.includes(field)) {
    sortFields[field] = order === "asc" ? 1 : -1;
  } else {
    sortFields.createdAt = -1;
  }

  return sortFields;
}

/**
 * 通用CRUD接口
 */

// 获取数据源配置
router.get("/datasource/:datasourceid/config", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const dataSource = await DataSource.findOne({ datasourceid });

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    res.json({
      success: true,
      data: dataSource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取数据源配置失败",
      error: error.message,
    });
  }
});

// 创建记录
router.post("/:datasourceid", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const data = req.body;

    // 获取数据源配置
    const dataSource = await DataSource.findOne({ datasourceid });
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 数据验证
    const validationErrors = validateData(data, dataSource);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "数据验证失败",
        details: validationErrors,
      });
    }

    // 创建动态模型
    const DynamicModel = createDynamicModel(dataSource);

    // 准备数据
    const recordData = {
      ...data,
      appid: dataSource.appid,
      datasourceid: dataSource.datasourceid,
    };

    // 创建记录
    const record = new DynamicModel(recordData);
    await record.save();

    res.status(201).json({
      success: true,
      data: {
        message: "记录创建成功",
        record,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "创建记录失败",
      error: error.message,
    });
  }
});

// 获取记录列表
router.get("/:datasourceid", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const { page = 1, limit = 10, sort, ...query } = req.query;

    // 获取数据源配置
    const dataSource = await DataSource.findOne({ datasourceid });
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 创建动态模型
    const DynamicModel = createDynamicModel(dataSource);

    // 构建查询条件
    const conditions = buildQueryConditions(query, dataSource);
    conditions.datasourceid = datasourceid;

    // 构建排序条件
    const sortConditions = buildSortConditions(sort, dataSource);

    // 执行查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const records = await DynamicModel.find(conditions)
      .sort(sortConditions)
      .skip(skip)
      .limit(parseInt(limit));

    // 获取总数
    const total = await DynamicModel.countDocuments(conditions);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取记录列表失败",
      error: error.message,
    });
  }
});

// 获取单条记录
router.get("/:datasourceid/:id", async (req, res) => {
  try {
    const { datasourceid, id } = req.params;

    // 获取数据源配置
    const dataSource = await DataSource.findOne({ datasourceid });
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 创建动态模型
    const DynamicModel = createDynamicModel(dataSource);

    // 查询记录
    const record = await DynamicModel.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "记录不存在",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取记录详情失败",
      error: error.message,
    });
  }
});

// 更新记录
router.put("/:datasourceid/:id", async (req, res) => {
  try {
    const { datasourceid, id } = req.params;
    const data = req.body;

    // 获取数据源配置
    const dataSource = await DataSource.findOne({ datasourceid });
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 数据验证
    const validationErrors = validateData(data, dataSource);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "数据验证失败",
        details: validationErrors,
      });
    }

    // 创建动态模型
    const DynamicModel = createDynamicModel(dataSource);

    // 更新记录
    const record = await DynamicModel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "记录不存在",
      });
    }

    res.json({
      success: true,
      data: {
        message: "记录更新成功",
        record,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "更新记录失败",
      error: error.message,
    });
  }
});

// 删除记录
router.delete("/:datasourceid/:id", async (req, res) => {
  try {
    const { datasourceid, id } = req.params;

    // 获取数据源配置
    const dataSource = await DataSource.findOne({ datasourceid });
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 创建动态模型
    const DynamicModel = createDynamicModel(dataSource);

    // 删除记录
    const record = await DynamicModel.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "记录不存在",
      });
    }

    res.json({
      success: true,
      data: {
        message: "记录删除成功",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "删除记录失败",
      error: error.message,
    });
  }
});

// 批量删除记录
router.delete("/:datasourceid", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "请提供要删除的记录ID数组",
      });
    }

    // 获取数据源配置
    const dataSource = await DataSource.findOne({ datasourceid });
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 创建动态模型
    const DynamicModel = createDynamicModel(dataSource);

    // 批量删除
    const result = await DynamicModel.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      data: {
        message: `成功删除${result.deletedCount}条记录`,
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "批量删除记录失败",
      error: error.message,
    });
  }
});

// 获取数据统计
router.get("/:datasourceid/stats", async (req, res) => {
  try {
    const { datasourceid } = req.params;

    // 获取数据源配置
    const dataSource = await DataSource.findOne({ datasourceid });
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 创建动态模型
    const DynamicModel = createDynamicModel(dataSource);

    // 基础统计
    const totalCount = await DynamicModel.countDocuments({ datasourceid });
    const todayCount = await DynamicModel.countDocuments({
      datasourceid,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    // 字段统计（针对枚举字段）
    const fieldStats = {};
    for (const field of dataSource.dataSource) {
      if (field.config?.options) {
        const stats = await DynamicModel.aggregate([
          { $match: { datasourceid } },
          { $group: { _id: `$${field.name}`, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);
        fieldStats[field.name] = stats;
      }
    }

    res.json({
      success: true,
      data: {
        totalCount,
        todayCount,
        fieldStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取数据统计失败",
      error: error.message,
    });
  }
});

// 调试接口：查看模型缓存状态
router.get("/debug/models", (req, res) => {
  try {
    const cacheInfo = {
      cacheSize: modelCache.size,
      cachedModels: Array.from(modelCache.keys()),
      mongooseModels: Object.keys(mongoose.models).filter((name) =>
        name.startsWith("Data_")
      ),
    };

    res.json({
      success: true,
      data: cacheInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取模型缓存状态失败",
      error: error.message,
    });
  }
});

// 调试接口：清理模型缓存
router.post("/debug/clear-cache", (req, res) => {
  try {
    const { datasourceid } = req.body;
    clearModelCache(datasourceid);

    res.json({
      success: true,
      data: {
        message: datasourceid
          ? `已清理数据源 ${datasourceid} 的缓存`
          : "已清理所有缓存",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "清理模型缓存失败",
      error: error.message,
    });
  }
});

module.exports = router;
