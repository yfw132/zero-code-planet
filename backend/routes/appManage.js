var express = require("express");
var router = express.Router();
const App = require("../models/App");

// ==================== 应用管理API ====================

// 获取所有应用列表
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    // 构建查询条件
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { appName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 分页查询
    const skip = (page - 1) * limit;
    const apps = await App.find(query)
      .select("-pages -dataSource") // 列表页不返回详细配置
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await App.countDocuments(query);

    res.json({
      success: true,
      data: {
        apps,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取应用列表失败",
      error: error.message,
    });
  }
});

// 根据ID获取应用基本信息
router.get("/:appid", async (req, res) => {
  try {
    const { appid } = req.params;
    const app = await App.findOne({ appid });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "应用不存在",
      });
    }

    res.json({
      success: true,
      data: app,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取应用详情失败",
      error: error.message,
    });
  }
});

// 获取应用完整数据（包含关联的pages和dataSources）
router.get("/:appid/full", async (req, res) => {
  try {
    const { appid } = req.params;
    const app = await App.findOne({ appid });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "应用不存在",
      });
    }

    // 获取完整数据
    const fullData = await app.getFullData();

    res.json({
      success: true,
      data: fullData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取应用完整数据失败",
      error: error.message,
    });
  }
});

// 创建新应用
router.post("/", async (req, res) => {
  try {
    const { appName, description, pages = [], dataSource = [] } = req.body;

    // appid 将自动生成，无需手动检查或指定

    const app = new App({
      appName,
      // appid 将由 pre-save 钩子自动生成
      description,
      pages,
      dataSource,
      creator: req.user?.username || "system", // 如果有用户认证的话
    });

    await app.save();

    res.status(201).json({
      success: true,
      message: "应用创建成功",
      data: app,
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
        message: "创建应用失败",
        error: error.message,
      });
    }
  }
});

// 更新应用
router.put("/:appid", async (req, res) => {
  try {
    const { appid } = req.params;
    const updateData = req.body;

    // 不允许更新appid
    delete updateData.appid;

    const app = await App.findOneAndUpdate({ appid }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "应用不存在",
      });
    }

    res.json({
      success: true,
      message: "应用更新成功",
      data: app,
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
        message: "更新应用失败",
        error: error.message,
      });
    }
  }
});

// 发布应用
router.post("/:appid/publish", async (req, res) => {
  try {
    const { appid } = req.params;
    const app = await App.findOne({ appid });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "应用不存在",
      });
    }

    await app.publish();

    res.json({
      success: true,
      message: "应用发布成功",
      data: app,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "发布应用失败",
      error: error.message,
    });
  }
});

// 归档应用
router.post("/:appid/archive", async (req, res) => {
  try {
    const { appid } = req.params;
    const app = await App.findOne({ appid });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "应用不存在",
      });
    }

    await app.archive();

    res.json({
      success: true,
      message: "应用归档成功",
      data: app,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "归档应用失败",
      error: error.message,
    });
  }
});

// 删除应用
router.delete("/:appid", async (req, res) => {
  try {
    const { appid } = req.params;
    const app = await App.findOneAndDelete({ appid });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "应用不存在",
      });
    }

    res.json({
      success: true,
      message: "应用删除成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "删除应用失败",
      error: error.message,
    });
  }
});

// 复制应用
router.post("/:appid/clone", async (req, res) => {
  try {
    const { appid } = req.params;
    const { newAppName } = req.body;

    if (!newAppName) {
      return res.status(400).json({
        success: false,
        message: "新应用名称是必需的",
      });
    }

    // 查找原应用
    const originalApp = await App.findOne({ appid });
    if (!originalApp) {
      return res.status(404).json({
        success: false,
        message: "原应用不存在",
      });
    }

    // 创建副本（appid将自动生成）
    const clonedApp = new App({
      appName: newAppName,
      // appid 将自动生成
      description: `${originalApp.description} (副本)`,
      pages: originalApp.pages,
      dataSource: originalApp.dataSource,
      status: "draft",
      creator: req.user?.username || "system",
    });

    await clonedApp.save();

    res.status(201).json({
      success: true,
      message: "应用复制成功",
      data: clonedApp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "复制应用失败",
      error: error.message,
    });
  }
});

module.exports = router;
