var express = require("express");
var router = express.Router();
const Page = require("../models/Page");
const App = require("../models/App");

// ==================== 页面管理API ====================

// 获取应用的所有页面
router.get("/app/:appid", async (req, res) => {
  try {
    const { appid } = req.params;
    const { status } = req.query;

    // 构建查询条件
    let query = { appid };
    if (status) query.status = status;

    const pages = await Page.find(query).sort({ order: 1 });

    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取页面列表失败",
      error: error.message,
    });
  }
});

// 根据ID获取页面详情
router.get("/:pageid", async (req, res) => {
  try {
    const { pageid } = req.params;
    const page = await Page.findOne({ pageid });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "页面不存在",
      });
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取页面详情失败",
      error: error.message,
    });
  }
});

// 创建新页面
router.post("/", async (req, res) => {
  try {
    const {
      pageName,
      description,
      components = [],
      appid,
      order = 0,
    } = req.body;

    // 验证应用是否存在
    const app = await App.findOne({ appid });
    if (!app) {
      return res.status(404).json({
        success: false,
        message: "应用不存在",
      });
    }

    const page = new Page({
      pageName,
      description,
      components,
      appid,
      order,
      creator: req.user?.username || "system",
    });

    await page.save();

    // 将页面ID添加到应用的pages数组中
    await App.findOneAndUpdate(
      { appid },
      { $addToSet: { pages: page.pageid } }
    );

    res.status(201).json({
      success: true,
      message: "页面创建成功",
      data: page,
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
        message: "创建页面失败",
        error: error.message,
      });
    }
  }
});

// 更新页面
router.put("/:pageid", async (req, res) => {
  try {
    const { pageid } = req.params;
    const updateData = req.body;

    // 不允许更新pageid和appid
    delete updateData.pageid;
    delete updateData.appid;

    const page = await Page.findOneAndUpdate({ pageid }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "页面不存在",
      });
    }

    res.json({
      success: true,
      message: "页面更新成功",
      data: page,
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
        message: "更新页面失败",
        error: error.message,
      });
    }
  }
});

// 发布页面
router.post("/:pageid/publish", async (req, res) => {
  try {
    const { pageid } = req.params;
    const page = await Page.findOne({ pageid });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "页面不存在",
      });
    }

    await page.publish();

    res.json({
      success: true,
      message: "页面发布成功",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "发布页面失败",
      error: error.message,
    });
  }
});

// 归档页面
router.post("/:pageid/archive", async (req, res) => {
  try {
    const { pageid } = req.params;
    const page = await Page.findOne({ pageid });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "页面不存在",
      });
    }

    await page.archive();

    res.json({
      success: true,
      message: "页面归档成功",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "归档页面失败",
      error: error.message,
    });
  }
});

// 删除页面
router.delete("/:pageid", async (req, res) => {
  try {
    const { pageid } = req.params;
    const page = await Page.findOneAndDelete({ pageid });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "页面不存在",
      });
    }

    // 从应用的pages数组中移除页面ID
    await App.findOneAndUpdate(
      { appid: page.appid },
      { $pull: { pages: pageid } }
    );

    res.json({
      success: true,
      message: "页面删除成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "删除页面失败",
      error: error.message,
    });
  }
});

// 批量更新页面排序
router.put("/app/:appid/reorder", async (req, res) => {
  try {
    const { appid } = req.params;
    const { pageOrders } = req.body; // [{ pageid: 'xxx', order: 1 }, ...]

    if (!Array.isArray(pageOrders)) {
      return res.status(400).json({
        success: false,
        message: "页面排序数据格式错误",
      });
    }

    // 批量更新页面排序
    const updatePromises = pageOrders.map(({ pageid, order }) =>
      Page.findOneAndUpdate({ pageid, appid }, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "页面排序更新成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "更新页面排序失败",
      error: error.message,
    });
  }
});

module.exports = router;
