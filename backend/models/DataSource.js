const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// 生成唯一的datasourceid
function generateDataSourceId() {
  return "ds_" + uuidv4().replace(/-/g, "").substring(0, 12);
}

// 数据源模型
const dataSourceSchema = new mongoose.Schema(
  {
    datasourceid: {
      type: String,
      unique: true,
      trim: true,
      default: generateDataSourceId,
    },
    title: {
      type: String,
      required: [true, "数据源标题是必需的"],
      trim: true,
      maxlength: [100, "标题最多100个字符"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "描述最多500个字符"],
    },
    // 字段定义数组
    dataSource: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            required: true,
            enum: ["string", "number", "boolean", "date", "array"],
          },
          label: {
            type: String,
            required: true,
          },
          control: {
            type: String,
            required: true,
            enum: [
              "input",
              "number",
              "email",
              "tel",
              "textarea",
              "select",
              "radio",
              "checkbox",
              "date",
              "switch",
            ],
          },
          config: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
          },
          validation: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
          },
          dependencies: [
            {
              type: String,
            },
          ],
          conditional: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
          },
          // 新增：关联配置
          relation: {
            type: {
              type: String,
              enum: ["foreign", "lookup", "cascade"],
              default: null,
            },
            // 关联的数据源ID
            targetDataSourceId: {
              type: String,
              default: null,
            },
            // 关联的字段名（用于显示）
            targetField: {
              type: String,
              default: null,
            },
            // 关联的字段名（用于值）
            targetValueField: {
              type: String,
              default: null,
            },
            // 过滤条件
            filter: {
              type: mongoose.Schema.Types.Mixed,
              default: null,
            },
            // 排序条件
            sort: {
              type: mongoose.Schema.Types.Mixed,
              default: null,
            },
            // 是否支持搜索
            searchable: {
              type: Boolean,
              default: false,
            },
            // 搜索字段
            searchFields: [
              {
                type: String,
              },
            ],
            // 是否支持分页
            paginated: {
              type: Boolean,
              default: false,
            },
            // 每页数量
            pageSize: {
              type: Number,
              default: 20,
            },
          },
        },
      ],
      default: [],
    },
    // 关联的应用ID
    appid: {
      type: String,
      required: [true, "应用ID是必需的"],
    },
    // 数据源版本
    version: {
      type: String,
      default: "1.0.0",
    },
    // 数据源状态
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    // 数据源类型
    category: {
      type: String,
      enum: ["form", "table", "chart", "custom"],
      default: "form",
    },
    // 创建者
    creator: {
      type: String,
      default: "system",
    },
    // 标签
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: "__v",
  }
);

// 索引优化
dataSourceSchema.index({ datasourceid: 1 });
dataSourceSchema.index({ appid: 1 });
dataSourceSchema.index({ status: 1 });
dataSourceSchema.index({ category: 1 });
dataSourceSchema.index({ title: 1 });

// Pre-save钩子：确保datasourceid唯一性，并处理relation字段
dataSourceSchema.pre("save", async function (next) {
  if (this.datasourceid && !this.isNew) {
    return next();
  }

  if (this.isNew && !this.datasourceid) {
    this.datasourceid = generateDataSourceId();
  }

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const existingDataSource = await mongoose.model("DataSource").findOne({
        datasourceid: this.datasourceid,
        _id: { $ne: this._id },
      });

      if (!existingDataSource) {
        break;
      }

      this.datasourceid = generateDataSourceId();
      attempts++;
    } catch (error) {
      return next(error);
    }
  }

  if (attempts >= maxAttempts) {
    return next(new Error("无法生成唯一的数据源ID，请重试"));
  }

  // 处理relation字段：如果relation为空或未定义，则不存储
  if (this.dataSource && Array.isArray(this.dataSource)) {
    this.dataSource.forEach((field) => {
      if (field.relation) {
        // 检查relation对象是否为空或所有属性都为null/undefined
        const hasValidRelation = Object.values(field.relation).some((value) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== null && value !== undefined && value !== "";
        });

        if (!hasValidRelation) {
          delete field.relation;
        }
      }
    });
  }

  next();
});

// 实例方法
dataSourceSchema.methods.publish = function () {
  this.status = "published";
  return this.save();
};

dataSourceSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// 静态方法 - 根据应用ID查找数据源
dataSourceSchema.statics.findByAppId = function (appid) {
  return this.find({ appid });
};

// 静态方法 - 根据分类查找数据源
dataSourceSchema.statics.findByCategory = function (category) {
  return this.find({ category, status: "published" });
};

// 静态方法 - 根据数据源ID查找数据源
dataSourceSchema.statics.findByDataSourceId = function (datasourceid) {
  return this.findOne({ datasourceid });
};

// 静态方法 - 验证关联配置
dataSourceSchema.statics.validateRelation = async function (relation) {
  if (!relation || !relation.targetDataSourceId) {
    return { valid: false, error: "关联配置不完整" };
  }

  try {
    const targetDataSource = await this.findOne({
      datasourceid: relation.targetDataSourceId,
    });

    if (!targetDataSource) {
      return {
        valid: false,
        error: `目标数据源 ${relation.targetDataSourceId} 不存在`,
      };
    }

    // 验证字段是否存在
    if (relation.targetField) {
      const fieldExists = targetDataSource.dataSource.some(
        (field) => field.name === relation.targetField
      );
      if (!fieldExists) {
        return {
          valid: false,
          error: `目标字段 ${relation.targetField} 不存在`,
        };
      }
    }

    if (relation.targetValueField) {
      const valueFieldExists = targetDataSource.dataSource.some(
        (field) => field.name === relation.targetValueField
      );
      if (!valueFieldExists) {
        return {
          valid: false,
          error: `目标值字段 ${relation.targetValueField} 不存在`,
        };
      }
    }

    return { valid: true, targetDataSource };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

module.exports = mongoose.model("DataSource", dataSourceSchema);
