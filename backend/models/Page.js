const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// 生成唯一的pageid
function generatePageId() {
  return "page_" + uuidv4().replace(/-/g, "").substring(0, 12);
}

// 页面模型
const pageSchema = new mongoose.Schema(
  {
    pageid: {
      type: String,
      unique: true,
      trim: true,
      default: generatePageId,
    },
    pageName: {
      type: String,
      required: [true, "页面名称是必需的"],
      trim: true,
      maxlength: [100, "页面名称最多100个字符"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "描述最多500个字符"],
    },
    // 组件配置数组
    components: {
      type: [
        {
          componentName: {
            type: String,
            required: true,
            enum: ["DataManage", "DataVisual", "DataCard"],
          },
          dataSourceId: {
            type: String,
            required: true,
          },
          config: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
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
    // 页面状态
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    // 排序字段
    order: {
      type: Number,
      default: 0,
    },
    // 创建者
    creator: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
    versionKey: "__v",
  }
);

// 索引优化
pageSchema.index({ pageid: 1 });
pageSchema.index({ appid: 1 });
pageSchema.index({ status: 1 });
pageSchema.index({ appid: 1, order: 1 });

// Pre-save钩子：确保pageid唯一性
pageSchema.pre("save", async function (next) {
  if (this.pageid && !this.isNew) {
    return next();
  }

  if (this.isNew && !this.pageid) {
    this.pageid = generatePageId();
  }

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const existingPage = await mongoose.model("Page").findOne({
        pageid: this.pageid,
        _id: { $ne: this._id },
      });

      if (!existingPage) {
        break;
      }

      this.pageid = generatePageId();
      attempts++;
    } catch (error) {
      return next(error);
    }
  }

  if (attempts >= maxAttempts) {
    return next(new Error("无法生成唯一的页面ID，请重试"));
  }

  next();
});

// 实例方法
pageSchema.methods.publish = function () {
  this.status = "published";
  return this.save();
};

pageSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// 静态方法 - 根据应用ID查找页面
pageSchema.statics.findByAppId = function (appid) {
  return this.find({ appid }).sort({ order: 1 });
};

module.exports = mongoose.model("Page", pageSchema);
