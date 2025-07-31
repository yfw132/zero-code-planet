# 动态 CRUD API 设计文档

## 概述

基于数据源配置动态生成增删改查业务接口的系统，支持根据数据源字段配置自动创建 MongoDB 集合和相应的 RESTful API 接口。

## 核心特性

### 1. 动态模型生成

- 根据数据源配置自动创建 Mongoose Schema
- 支持多种数据类型：string、number、boolean、date、array
- 自动添加验证规则和索引
- 使用数据源 ID 作为集合名称，确保唯一性

### 2. 智能数据验证

- 必填字段验证
- 数据类型验证
- 长度限制验证
- 数值范围验证
- 正则表达式验证

### 3. 灵活的查询功能

- 支持分页查询
- 动态字段过滤
- 字符串模糊查询
- 多字段排序
- 聚合统计

## API 接口设计

### 基础路径

```
/api/crud/{datasourceid}
```

### 1. 获取数据源配置

```
GET /api/crud/datasource/{datasourceid}/config
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "_id": "687ba6e69dbdae184426ace8",
    "title": "客户基本信息",
    "description": "存储客户的基本联系信息和分类数据",
    "dataSource": [
      {
        "name": "customerName",
        "type": "string",
        "label": "客户名称",
        "control": "input",
        "validation": {
          "required": true,
          "minLength": 2
        }
      }
    ],
    "datasourceid": "ds_01a163360039"
  }
}
```

### 2. 创建记录

```
POST /api/crud/{datasourceid}
```

**请求体示例（客户基本信息）：**

```json
{
  "customerName": "张三",
  "contactPerson": "李四",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "customerType": "vip",
  "address": "北京市朝阳区xxx街道"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "记录创建成功",
  "data": {
    "_id": "687ba6739dbdae184426ace5",
    "customerName": "张三",
    "contactPerson": "李四",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "customerType": "vip",
    "address": "北京市朝阳区xxx街道",
    "appid": "app_546da0474625",
    "datasourceid": "ds_01a163360039",
    "createdAt": "2025-07-19T14:30:00.000Z",
    "updatedAt": "2025-07-19T14:30:00.000Z"
  }
}
```

### 3. 获取记录列表

```
GET /api/crud/{datasourceid}?page=1&limit=10&sort=customerName:asc&customerType=vip
```

**查询参数：**

- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 10）
- `sort`: 排序字段（格式：字段名:排序方向）
- 其他参数：动态字段过滤

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "_id": "687ba6739dbdae184426ace5",
      "customerName": "张三",
      "contactPerson": "李四",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "customerType": "vip",
      "address": "北京市朝阳区xxx街道",
      "createdAt": "2025-07-19T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 4. 获取单条记录

```
GET /api/crud/{datasourceid}/{id}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "_id": "687ba6739dbdae184426ace5",
    "customerName": "张三",
    "contactPerson": "李四",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "customerType": "vip",
    "address": "北京市朝阳区xxx街道",
    "createdAt": "2025-07-19T14:30:00.000Z",
    "updatedAt": "2025-07-19T14:30:00.000Z"
  }
}
```

### 5. 更新记录

```
PUT /api/crud/{datasourceid}/{id}
```

**请求体示例：**

```json
{
  "customerName": "张三（已更新）",
  "phone": "13900139000"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "记录更新成功",
  "data": {
    "_id": "687ba6739dbdae184426ace5",
    "customerName": "张三（已更新）",
    "contactPerson": "李四",
    "phone": "13900139000",
    "email": "zhangsan@example.com",
    "customerType": "vip",
    "address": "北京市朝阳区xxx街道",
    "updatedAt": "2025-07-19T14:35:00.000Z"
  }
}
```

### 6. 删除记录

```
DELETE /api/crud/{datasourceid}/{id}
```

**响应示例：**

```json
{
  "success": true,
  "message": "记录删除成功"
}
```

### 7. 批量删除记录

```
DELETE /api/crud/{datasourceid}
```

**请求体示例：**

```json
{
  "ids": ["687ba6739dbdae184426ace5", "687ba6739dbdae184426ace6"]
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "成功删除2条记录",
  "deletedCount": 2
}
```

### 8. 获取数据统计

```
GET /api/crud/{datasourceid}/stats
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "totalCount": 25,
    "todayCount": 3,
    "fieldStats": {
      "customerType": [
        { "_id": "vip", "count": 10 },
        { "_id": "normal", "count": 12 },
        { "_id": "agent", "count": 3 }
      ]
    }
  }
}
```

## 数据验证规则

### 1. 必填验证

```javascript
{
  "validation": {
    "required": true
  }
}
```

### 2. 长度验证

```javascript
{
  "validation": {
    "minLength": 2,
    "maxLength": 50
  }
}
```

### 3. 数值范围验证

```javascript
{
  "validation": {
    "min": 0,
    "max": 100
  }
}
```

### 4. 正则验证

```javascript
{
  "validation": {
    "pattern": "^1[3-9]\\d{9}$"
  }
}
```

## 错误处理

### 1. 数据验证错误

```json
{
  "error": "数据验证失败",
  "details": ["客户名称是必填项", "联系电话格式不正确"]
}
```

### 2. 资源不存在

```json
{
  "error": "数据源不存在"
}
```

### 3. 服务器错误

```json
{
  "error": "内部服务器错误"
}
```

## 使用示例

### 客户基本信息管理

**1. 创建客户**

```bash
curl -X POST http://localhost:3000/api/crud/ds_01a163360039 \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "张三",
    "contactPerson": "李四",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "customerType": "vip",
    "address": "北京市朝阳区xxx街道"
  }'
```

**2. 查询客户列表**

```bash
curl "http://localhost:3000/api/crud/ds_01a163360039?page=1&limit=10&customerType=vip&sort=customerName:asc"
```

**3. 更新客户信息**

```bash
curl -X PUT http://localhost:3000/api/crud/ds_01a163360039/687ba6739dbdae184426ace5 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900139000",
    "customerType": "normal"
  }'
```

**4. 删除客户**

```bash
curl -X DELETE http://localhost:3000/api/crud/ds_01a163360039/687ba6739dbdae184426ace5
```

## 数据库设计

### 集合命名规则

- 格式：`data_{datasourceid}`
- 示例：`data_ds_01a163360039`

### 通用字段

- `appid`: 应用 ID
- `datasourceid`: 数据源 ID
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 索引策略

- 复合索引：`{appid: 1, datasourceid: 1}`
- 必填字段索引：自动为必填字段创建索引
- 查询优化：根据常用查询字段创建索引

## 性能优化

### 1. 索引优化

- 为常用查询字段创建索引
- 复合索引优化多字段查询
- 定期分析查询性能

### 2. 查询优化

- 分页查询避免大量数据返回
- 字段投影减少数据传输
- 聚合查询优化统计功能

### 3. 缓存策略

- 数据源配置缓存
- 查询结果缓存
- 统计结果缓存

## 安全考虑

### 1. 输入验证

- 严格的类型检查
- SQL 注入防护
- XSS 攻击防护

### 2. 权限控制

- 应用级别的数据隔离
- 用户权限验证
- API 访问频率限制

### 3. 数据保护

- 敏感数据加密
- 数据备份策略
- 审计日志记录

## 扩展功能

### 1. 数据导入导出

- CSV/Excel 文件导入
- 数据导出功能
- 批量操作支持

### 2. 数据同步

- 实时数据同步
- 增量更新
- 冲突解决

### 3. 高级查询

- 全文搜索
- 地理位置查询
- 复杂聚合查询

## 部署说明

### 1. 环境要求

- Node.js >= 14.0.0
- MongoDB >= 4.4.0
- Express >= 4.17.0

### 2. 安装依赖

```bash
npm install express mongoose uuid
```

### 3. 配置数据库

```javascript
// config/database.js
mongoose.connect("mongodb://localhost:27017/your_database", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

### 4. 路由注册

```javascript
// app.js
const crudRouter = require("./routes/appCurd");
app.use("/api/crud", crudRouter);
```

## 总结

这个动态 CRUD 系统提供了完整的增删改查功能，具有以下优势：

1. **灵活性**：根据数据源配置自动生成接口
2. **可扩展性**：支持多种数据类型和验证规则
3. **高性能**：优化的查询和索引策略
4. **易用性**：RESTful API 设计，易于集成
5. **安全性**：完善的数据验证和权限控制

通过这个系统，可以快速为任何数据源生成完整的业务接口，大大提高了开发效率。
