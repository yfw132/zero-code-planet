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
      index: true,
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
        },
      ],
      default: [],
    },
    // 关联的应用ID
    appid: {
      type: String,
      required: [true, "应用ID是必需的"],
      index: true,
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

// Pre-save钩子：确保datasourceid唯一性
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

module.exports = mongoose.model("DataSource", dataSourceSchema);
