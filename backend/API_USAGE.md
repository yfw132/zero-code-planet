# 应用管理 API 文档

## 关于动态数据结构处理的回答

对于没有明确数据结构的 MongoDB 集合，有几种处理方式：

### 1. 使用 Mixed 类型 (当前采用)

```javascript
const flexibleSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed, // 可以存储任意JSON结构
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});
```

### 2. 关闭严格模式

```javascript
const dynamicSchema = new mongoose.Schema({}, { strict: false });
// 允许存储任何字段，不受Schema限制
```

### 3. 使用原生 MongoDB 驱动

```javascript
const { MongoClient } = require("mongodb");
// 直接操作MongoDB，完全动态
```

---

## 环境配置

请创建 `.env` 文件并配置以下参数：

```env
# MongoDB数据库配置
MONGODB_URI=mongodb://localhost:27017/your_database_name
# 或者使用MongoDB Atlas：
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# 应用配置
PORT=3000
NODE_ENV=development

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here
```

---

## API 接口文档

**重要更新**:

- ✅ **数据库结构优化**: pages 和 dataSource 现在是独立的表，使用引用关系
- ✅ **ID 自动生成**: appid、pageid、datasourceid 都会自动生成，确保全局唯一
- ✅ **模块化管理**: 分别提供应用、页面、数据源的独立管理接口

---

## 应用管理 API

**基础 URL**: `http://localhost:3000/api/appManage`

### 1. 获取应用列表

```http
GET /appManage
```

**查询参数**:

- `status`: 应用状态 (draft/published/archived)
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `search`: 搜索关键词

**响应示例**:

```json
{
  "success": true,
  "data": {
    "apps": [...],
    "pagination": {
      "current": 1,
      "pageSize": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 2. 获取应用基本信息

```http
GET /api/appManage/:appid
```

### 3. 获取应用完整数据

```http
GET /api/appManage/:appid/full
```

**说明**: 返回应用基本信息 + 关联的页面和数据源详细数据

### 3. 创建新应用

```http
POST /appManage
Content-Type: application/json
```

**请求体示例**:

```json
{
  "appName": "数据管理平台",
  "description": "企业级数据管理解决方案",
  "pages": [
    {
      "pageName": "主页",
      "pageid": "pageid1",
      "description": "应用主页",
      "components": [
        {
          "componentName": "DataManage",
          "dataSourceId": "ds1",
          "config": {}
        }
      ]
    }
  ],
  "dataSource": [
    {
      "id": "ds1",
      "title": "用户数据源",
      "description": "用户信息管理",
      "dataSource": [
        {
          "name": "username",
          "type": "string",
          "label": "用户名",
          "control": "input",
          "validation": {
            "required": true,
            "minLength": 3
          }
        }
      ]
    }
  ]
}
```

### 4. 更新应用

```http
PUT /appManage/:appid
Content-Type: application/json
```

### 5. 发布应用

```http
POST /appManage/:appid/publish
```

### 6. 归档应用

```http
POST /appManage/:appid/archive
```

### 7. 删除应用

```http
DELETE /appManage/:appid
```

### 8. 复制应用

```http
POST /appManage/:appid/clone
Content-Type: application/json

{
  "newAppName": "新应用名称"
}
```

---

## 数据模型说明

### App Schema

```javascript
{
  appName: String,        // 应用名称
  appid: String,          // 应用ID (唯一, 自动生成)
  description: String,    // 应用描述
  pages: Mixed,          // 页面配置数组
  dataSource: Mixed,     // 数据源配置数组
  version: String,       // 版本号
  status: String,        // 状态: draft/published/archived
  creator: String,       // 创建者
  tags: [String],        // 标签
  createdAt: Date,       // 创建时间
  updatedAt: Date        // 更新时间
}
```

### 错误响应格式

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误描述"
}
```

---

## 启动项目

1. 安装依赖：`npm install`
2. 配置 `.env` 文件
3. 启动 MongoDB 服务
4. 运行项目：`npm start`
5. 测试 API：访问 `http://localhost:3000/api/test-db`

---

## 测试示例

使用 curl 测试创建应用：

````bash
curl -X POST http://localhost:3000/api/appManage \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "测试应用",
    "description": "这是一个测试应用"
  }'

---

## 页面管理 API

**基础 URL**: `http://localhost:3000/api/pageManage`

### 1. 获取应用的所有页面
```http
GET /api/pageManage/app/:appid?status=published
````

### 2. 获取页面详情

```http
GET /api/pageManage/:pageid
```

### 3. 创建新页面

```http
POST /api/pageManage
Content-Type: application/json

{
  "pageName": "首页",
  "description": "应用首页",
  "appid": "app_4f3d2a1b8c9e",
  "components": [
    {
      "componentName": "DataManage",
      "dataSourceId": "ds_1a2b3c4d5e6f",
      "config": {}
    }
  ],
  "order": 1
}
```

### 4. 更新页面

```http
PUT /api/pageManage/:pageid
```

### 5. 发布/归档/删除页面

```http
POST /api/pageManage/:pageid/publish
POST /api/pageManage/:pageid/archive
DELETE /api/pageManage/:pageid
```

### 6. 页面排序

```http
PUT /api/pageManage/app/:appid/reorder
Content-Type: application/json

{
  "pageOrders": [
    { "pageid": "page_1", "order": 1 },
    { "pageid": "page_2", "order": 2 }
  ]
}
```

---

## 数据源管理 API

**基础 URL**: `http://localhost:3000/api/dataSourceManage`

### 1. 获取应用的所有数据源

```http
GET /api/dataSourceManage/app/:appid?status=published&category=form
```

### 2. 获取数据源详情

```http
GET /api/dataSourceManage/:datasourceid
```

### 3. 创建新数据源

```http
POST /api/dataSourceManage
Content-Type: application/json

{
  "title": "用户信息表单",
  "description": "用户注册信息收集",
  "appid": "app_4f3d2a1b8c9e",
  "category": "form",
  "dataSource": [
    {
      "name": "username",
      "type": "string",
      "label": "用户名",
      "control": "input",
      "validation": {
        "required": true,
        "minLength": 3
      }
    },
    {
      "name": "email",
      "type": "string",
      "label": "邮箱",
      "control": "email",
      "validation": {
        "required": true
      }
    }
  ]
}
```

### 4. 更新数据源

```http
PUT /api/dataSourceManage/:datasourceid
```

### 5. 发布/归档/删除数据源

```http
POST /api/dataSourceManage/:datasourceid/publish
POST /api/dataSourceManage/:datasourceid/archive
DELETE /api/dataSourceManage/:datasourceid
```

### 6. 复制数据源

```http
POST /api/dataSourceManage/:datasourceid/clone
Content-Type: application/json

{
  "newTitle": "用户信息表单 v2",
  "targetAppid": "app_另一个应用ID" // 可选，不填默认复制到同一应用
}
```

### 7. 获取数据源字段定义

```http
GET /api/dataSourceManage/:datasourceid/fields
```

---

## 数据模型关系

### 新的数据结构

```javascript
// App 应用模型
{
  appid: "app_xxxxxxxxxx",     // 自动生成
  appName: "应用名称",
  pages: ["page_xxx", "page_yyy"],        // 页面ID引用数组
  dataSource: ["ds_xxx", "ds_yyy"]        // 数据源ID引用数组
}

// Page 页面模型
{
  pageid: "page_xxxxxxxxxx",   // 自动生成
  pageName: "页面名称",
  appid: "app_xxxxxxxxxx",     // 关联应用ID
  components: [...],           // 组件配置
  order: 1                     // 排序
}

// DataSource 数据源模型
{
  datasourceid: "ds_xxxxxxxxxx", // 自动生成
  title: "数据源标题",
  appid: "app_xxxxxxxxxx",        // 关联应用ID
  dataSource: [...],              // 字段定义
  category: "form"                // 分类
}
```

### ID 生成格式

- **appid**: `app_` + 12 位随机字符
- **pageid**: `page_` + 12 位随机字符
- **datasourceid**: `ds_` + 12 位随机字符
