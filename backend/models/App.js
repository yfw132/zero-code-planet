const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// 生成唯一的appid
function generateAppId() {
  // 方式1: 使用UUID (短版本)
  return "app_" + uuidv4().replace(/-/g, "").substring(0, 12);

  // 方式2: 使用时间戳+随机数
  // const timestamp = Date.now().toString(36);
  // const random = Math.random().toString(36).substring(2, 8);
  // return `app_${timestamp}${random}`;
}

// App应用模型
const appSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      required: [true, "应用名称是必需的"],
      trim: true,
      maxlength: [100, "应用名称最多100个字符"],
    },
    appid: {
      type: String,
      unique: true,
      trim: true,
      default: generateAppId, // 自动生成唯一ID
      index: true, // 添加索引以提高查询性能
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "描述最多500个字符"],
    },
    // 页面ID引用数组
    pages: [
      {
        type: String, // 存储pageid
        ref: "Page",
      },
    ],
    // 数据源ID引用数组
    dataSource: [
      {
        type: String, // 存储datasourceid
        ref: "DataSource",
      },
    ],
    // 应用版本
    version: {
      type: String,
      default: "1.0.0",
    },
    // 应用状态
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
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
    timestamps: true, // 自动添加createdAt和updatedAt
    versionKey: "__v", // 使用默认的版本字段名
  }
);

// 索引优化
appSchema.index({ appid: 1 });
appSchema.index({ appName: 1 });
appSchema.index({ status: 1 });
appSchema.index({ createdAt: -1 });

// 实例方法 - 发布应用
appSchema.methods.publish = function () {
  this.status = "published";
  return this.save();
};

// 实例方法 - 归档应用
appSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// 静态方法 - 查找已发布的应用
appSchema.statics.findPublished = function () {
  return this.find({ status: "published" });
};

// 添加便利方法来获取完整的应用数据（包含关联的pages和dataSources）
appSchema.methods.getFullData = async function () {
  const Page = mongoose.model("Page");
  const DataSource = mongoose.model("DataSource");

  const pages = await Page.find({ pageid: { $in: this.pages } }).sort({
    order: 1,
  });
  const dataSources = await DataSource.find({
    datasourceid: { $in: this.dataSource },
  });

  return {
    ...this.toObject(),
    pages: pages,
    dataSource: dataSources,
  };
};

// Pre-save钩子：确保appid唯一性
appSchema.pre("save", async function (next) {
  // 如果appid已经存在，跳过
  if (this.appid && !this.isNew) {
    return next();
  }

  // 如果是新文档但没有appid，生成一个
  if (this.isNew && !this.appid) {
    this.appid = generateAppId();
  }

  // 检查appid唯一性（虽然UUID重复概率极低，但保险起见）
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const existingApp = await mongoose.model("App").findOne({
        appid: this.appid,
        _id: { $ne: this._id },
      });

      if (!existingApp) {
        // appid唯一，可以保存
        break;
      }

      // appid重复，重新生成
      this.appid = generateAppId();
      attempts++;
    } catch (error) {
      return next(error);
    }
  }

  if (attempts >= maxAttempts) {
    return next(new Error("无法生成唯一的应用ID，请重试"));
  }

  next();
});

module.exports = mongoose.model("App", appSchema);
