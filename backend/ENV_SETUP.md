# 环境变量配置说明

## 创建 .env 文件

在 `backend` 目录下创建 `.env` 文件，并添加以下配置：

```env
# MongoDB数据库配置
MONGODB_URI=mongodb://localhost:27017/zero_code_planet

# 应用配置
PORT=3000
NODE_ENV=development

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here
```

## MongoDB 安装和配置

### 本地 MongoDB

1. 安装 MongoDB：

   ```bash
   # macOS (使用 Homebrew)
   brew install mongodb-community

   # 启动 MongoDB 服务
   brew services start mongodb-community
   ```

2. 或者使用 Docker：
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

### MongoDB Atlas (云数据库)

如果你想使用 MongoDB Atlas，将 `MONGODB_URI` 替换为：

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zero_code_planet
```

## 启动应用

配置好环境变量后，运行：

```bash
npm run dev
```

## 常见问题

1. **MongoDB 连接失败**：确保 MongoDB 服务正在运行
2. **端口被占用**：修改 `PORT` 环境变量
3. **权限问题**：确保有足够的权限访问 MongoDB
