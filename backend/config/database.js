const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB连接成功: ${conn.connection.host}`);

    // 监听连接事件
    mongoose.connection.on("connected", () => {
      console.log("Mongoose连接到MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose连接错误:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose断开连接");
    });
  } catch (error) {
    console.error("数据库连接失败:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
