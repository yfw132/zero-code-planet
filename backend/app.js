var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

// 导入数据库连接
const connectDB = require("./config/database");

var indexRouter = require("./routes/index");
var appManageRouter = require("./routes/appManage");
var pageManageRouter = require("./routes/pageManage");
var dataSourceManageRouter = require("./routes/dataSourceManage");

var app = express();

// 连接数据库
connectDB();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/appManage", appManageRouter);
app.use("/api/pageManage", pageManageRouter);
app.use("/api/dataSourceManage", dataSourceManageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
