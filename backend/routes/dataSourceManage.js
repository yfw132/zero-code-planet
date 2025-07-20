var express = require("express");
var router = express.Router();
const DataSource = require("../models/DataSource");
const App = require("../models/App");

// ==================== 数据源管理API ====================

// 获取应用的所有数据源
router.get("/app/:appid", async (req, res) => {
  try {
    const { appid } = req.params;
    const { status, category } = req.query;

    // 构建查询条件
    let query = { appid };
    if (status) query.status = status;
    if (category) query.category = category;

    const dataSources = await DataSource.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: dataSources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取数据源列表失败",
      error: error.message,
    });
  }
});

// 根据ID获取数据源详情
router.get("/:datasourceid", async (req, res) => {
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
      message: "获取数据源详情失败",
      error: error.message,
    });
  }
});

// 创建新数据源
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      dataSource = [],
      appid,
      category = "form",
      tags = [],
    } = req.body;

    // 验证应用是否存在
    const app = await App.findOne({ appid });
    if (!app) {
      return res.status(404).json({
        success: false,
        message: "应用不存在",
      });
    }

    const ds = new DataSource({
      title,
      description,
      dataSource,
      appid,
      category,
      tags,
      creator: req.user?.username || "system",
    });

    await ds.save();

    // 将数据源ID添加到应用的dataSource数组中
    await App.findOneAndUpdate(
      { appid },
      { $addToSet: { dataSource: ds.datasourceid } }
    );

    res.status(201).json({
      success: true,
      message: "数据源创建成功",
      data: ds,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "数据验证失败",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    } else {
      res.status(500).json({
        success: false,
        message: "创建数据源失败",
        error: error.message,
      });
    }
  }
});

// 更新数据源
router.put("/:datasourceid", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const updateData = req.body;

    // 不允许更新datasourceid和appid
    delete updateData.datasourceid;
    delete updateData.appid;

    const dataSource = await DataSource.findOneAndUpdate(
      { datasourceid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    res.json({
      success: true,
      message: "数据源更新成功",
      data: dataSource,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "数据验证失败",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    } else {
      res.status(500).json({
        success: false,
        message: "更新数据源失败",
        error: error.message,
      });
    }
  }
});

// 更新数据源的关联配置
router.put("/:datasourceid/relations", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const { relations } = req.body;

    if (!Array.isArray(relations)) {
      return res.status(400).json({
        success: false,
        message: "关联配置格式错误",
      });
    }

    // 查找数据源
    const dataSource = await DataSource.findOne({ datasourceid });
    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 验证所有关联配置
    const validationResults = await Promise.all(
      relations.map(async (relation) => {
        const validation = await DataSource.validateRelation(relation.relation);
        return {
          fieldName: relation.fieldName,
          validation,
        };
      })
    );

    // 检查是否有无效的关联配置
    const invalidRelations = validationResults.filter(
      (result) => !result.validation.valid
    );

    if (invalidRelations.length > 0) {
      return res.status(400).json({
        success: false,
        message: "关联配置验证失败",
        errors: invalidRelations.map((result) => ({
          fieldName: result.fieldName,
          error: result.validation.error,
        })),
      });
    }

    // 更新字段的关联配置
    const updatedDataSource = dataSource.dataSource.map((field) => {
      const relationConfig = relations.find((r) => r.fieldName === field.name);
      if (relationConfig) {
        return {
          ...field,
          relation: relationConfig.relation,
        };
      }
      return field;
    });

    // 保存更新
    dataSource.dataSource = updatedDataSource;
    await dataSource.save();

    res.json({
      success: true,
      message: "关联配置更新成功",
      data: dataSource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "更新关联配置失败",
      error: error.message,
    });
  }
});

// 发布数据源
router.post("/:datasourceid/publish", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const dataSource = await DataSource.findOne({ datasourceid });

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    await dataSource.publish();

    res.json({
      success: true,
      message: "数据源发布成功",
      data: dataSource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "发布数据源失败",
      error: error.message,
    });
  }
});

// 归档数据源
router.post("/:datasourceid/archive", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const dataSource = await DataSource.findOne({ datasourceid });

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    await dataSource.archive();

    res.json({
      success: true,
      message: "数据源归档成功",
      data: dataSource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "归档数据源失败",
      error: error.message,
    });
  }
});

// 删除数据源
router.delete("/:datasourceid", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const dataSource = await DataSource.findOneAndDelete({ datasourceid });

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    // 从应用的dataSource数组中移除数据源ID
    await App.findOneAndUpdate(
      { appid: dataSource.appid },
      { $pull: { dataSource: datasourceid } }
    );

    res.json({
      success: true,
      message: "数据源删除成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "删除数据源失败",
      error: error.message,
    });
  }
});

// 复制数据源
router.post("/:datasourceid/clone", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const { newTitle, targetAppid } = req.body;

    if (!newTitle) {
      return res.status(400).json({
        success: false,
        message: "新数据源标题是必需的",
      });
    }

    // 查找原数据源
    const originalDataSource = await DataSource.findOne({ datasourceid });
    if (!originalDataSource) {
      return res.status(404).json({
        success: false,
        message: "原数据源不存在",
      });
    }

    // 验证目标应用（如果指定了的话）
    const appid = targetAppid || originalDataSource.appid;
    const app = await App.findOne({ appid });
    if (!app) {
      return res.status(404).json({
        success: false,
        message: "目标应用不存在",
      });
    }

    // 创建副本（datasourceid将自动生成）
    const clonedDataSource = new DataSource({
      title: newTitle,
      description: `${originalDataSource.description} (副本)`,
      dataSource: originalDataSource.dataSource,
      appid: appid,
      category: originalDataSource.category,
      tags: [...originalDataSource.tags, "cloned"],
      status: "draft",
      creator: req.user?.username || "system",
    });

    await clonedDataSource.save();

    // 将数据源ID添加到目标应用的dataSource数组中
    await App.findOneAndUpdate(
      { appid },
      { $addToSet: { dataSource: clonedDataSource.datasourceid } }
    );

    res.status(201).json({
      success: true,
      message: "数据源复制成功",
      data: clonedDataSource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "复制数据源失败",
      error: error.message,
    });
  }
});

// 获取数据源的字段定义（用于组件配置）
router.get("/:datasourceid/fields", async (req, res) => {
  try {
    const { datasourceid } = req.params;
    const dataSource = await DataSource.findOne({ datasourceid }).select(
      "dataSource title"
    );

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: "数据源不存在",
      });
    }

    res.json({
      success: true,
      data: {
        datasourceid,
        title: dataSource.title,
        fields: dataSource.dataSource,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取数据源字段失败",
      error: error.message,
    });
  }
});

// 获取关联数据源的选项
router.get("/relation/options/:targetDataSourceId", async (req, res) => {
  try {
    const { targetDataSourceId } = req.params;
    const {
      targetField = "title",
      targetValueField = "_id",
      filter = {},
      sort = {},
      search = "",
      searchFields = [],
      page = 1,
      pageSize = 20,
      limit = null,
    } = req.query;

    // 解析JSON参数
    const parsedFilter =
      typeof filter === "string" ? JSON.parse(filter) : filter;
    const parsedSort = typeof sort === "string" ? JSON.parse(sort) : sort;
    const parsedSearchFields =
      typeof searchFields === "string"
        ? JSON.parse(searchFields)
        : searchFields;

    const options = {
      targetField,
      targetValueField,
      filter: parsedFilter,
      sort: parsedSort,
      search,
      searchFields: parsedSearchFields,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      limit: limit ? parseInt(limit) : null,
    };

    const result = await DataSource.getRelationOptions(
      targetDataSourceId,
      options
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取关联选项失败",
      error: error.message,
    });
  }
});

// 验证关联配置
router.post("/relation/validate", async (req, res) => {
  try {
    const { relation } = req.body;

    if (!relation) {
      return res.status(400).json({
        success: false,
        message: "关联配置是必需的",
      });
    }

    const validation = await DataSource.validateRelation(relation);

    res.json({
      success: validation.valid,
      data: validation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "验证关联配置失败",
      error: error.message,
    });
  }
});

module.exports = router;
