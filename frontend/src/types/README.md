# 类型系统重构说明

## 🎯 重构目标

将所有类型定义统一迁移到 `types` 文件夹下，按照功能和使用场景进行分层组织：

- **基础类型** (`types/base/`)：核心业务类型，不包含任何特定环境的字段
- **API 类型** (`types/api/`)：API 接口返回的类型，基于基础类型的扩展
- **前端类型** (`types/frontend/`)：前端业务逻辑特有的类型

## 📁 新的目录结构

```
frontend/src/types/
├── base/                          # 🔥 基础类型定义
│   ├── common.ts                  # 通用基础类型
│   ├── dataSource.ts             # 数据源基础类型
│   ├── page.ts                   # 页面基础类型
│   └── index.ts                  # 基础类型统一导出
├── api/                          # 🌐 API相关类型
│   ├── dataSource.ts             # 数据源API类型
│   ├── page.ts                   # 页面API类型
│   ├── crud.ts                   # CRUD API类型
│   └── index.ts                  # API类型统一导出
├── frontend/                     # 💻 前端特有类型
│   ├── dataSource.ts             # 数据源前端类型
│   ├── page.ts                   # 页面前端类型
│   └── index.ts                  # 前端类型统一导出
├── index.ts                      # 总导出文件
└── README.md                     # 本说明文档
```

## 🔄 类型关系图

```
基础类型 (base/)              API类型 (api/)               前端类型 (frontend/)
┌─────────────────┐           ┌──────────────────┐          ┌─────────────────────┐
│ DataSourceCore  │──────────▶│ ApiDataSourceItem│          │ DataSourceItem      │
│ - datasourceid  │           │ (extends Core +  │          │ (extends Core +     │
│ - title         │           │  BaseEntity)     │          │  optional fields)   │
│ - description   │           │ + appid          │          │ + createdAt?        │
│ - dataSource    │           │ + status         │          │ + updatedAt?        │
│ - version       │           │ + category       │          │                     │
└─────────────────┘           │ + tags           │          │ + FormState         │
                              │ + creator        │          │ + Filter            │
┌─────────────────┐           │ + createdAt      │          │ + Sort              │
│ PageCore        │           │ + updatedAt      │          └─────────────────────┘
│ - pageName      │           ┌──────────────────┐          ┌─────────────────────┐
│ - description   │           │ ApiPageItem      │          │ PageItem            │
│ - components    │           │ (extends Core +  │          │ (extends Core)      │
└─────────────────┘           │  BaseEntity)     │          │ + EditState         │
                              │ + pageid         │          │ + PreviewConfig     │
                              │ + appid          │          │ + DragState         │
                              │ + status         │          │ + Performance       │
                              │ + order          │          └─────────────────────┘
                              └──────────────────┘
```

## 💡 使用方式

### 1. 基础业务逻辑

```typescript
import { DataSourceCore, PageCore, FormField } from '@/types/base';

// 纯业务逻辑，不涉及API
const dataSource: DataSourceCore = {
  datasourceid: 'ds_001',
  title: '用户信息',
  description: '用户基础信息表',
  dataSource: [...]
};
```

### 2. API 接口调用

```typescript
import { ApiDataSourceItem, CreateDataSourceRequest } from "@/types/api";
import { getDataSourceInfo } from "@/api";

// API调用
const apiData: ApiDataSourceItem = await getDataSourceInfo("ds_001");
```

### 3. 前端组件状态

```typescript
import {
  DataSourceItem,
  DataSourceFormState,
  PageItem,
} from "@/types/frontend";

// 组件内部状态
const [dataSource, setDataSource] = useState<DataSourceItem>();
const [formState, setFormState] = useState<DataSourceFormState>({
  isEditing: false,
  isDirty: false,
  isValid: true,
  errors: {},
});
```

### 4. 类型转换

```typescript
import { toBaseDataSource } from "@/api";
import { ApiDataSourceItem } from "@/types/api";
import { DataSourceCore } from "@/types/base";

// API数据 → 基础类型
const apiData: ApiDataSourceItem = await getDataSourceInfo("ds_001");
const baseData: DataSourceCore = toBaseDataSource(apiData);
```

## 🚀 主要改进

### ✅ **统一管理**

- 所有类型定义都在 `types/` 目录下
- 按功能分层，职责清晰
- 避免类型定义分散在不同地方

### ✅ **消除重复**

- 基础类型作为单一数据源
- API 和前端类型通过 `extends` 扩展
- 不再有重复的类型定义

### ✅ **层次分明**

- **Base 层**：纯业务逻辑，与环境无关
- **API 层**：服务器交互，包含 API 特有字段
- **Frontend 层**：前端特有，包含 UI 状态等

### ✅ **类型安全**

- 提供转换工具函数
- 明确的类型边界
- 编译时类型检查

## 🔧 工具函数

### 数据源相关

```typescript
// API → 基础类型
toBaseDataSource(apiData: ApiDataSourceItem): DataSourceCore

// 基础类型 → 创建请求
toDataSourceCreateRequest(
  baseData: DataSourceCore,
  appid: string,
  additional?: Partial<CreateDataSourceRequest>
): CreateDataSourceRequest
```

### 页面相关

```typescript
// API → 基础类型
toBasePage(apiPage: ApiPageItem): PageCore

// 基础类型 → 创建请求
toPageCreateRequest(
  basePage: PageCore,
  appid: string,
  additional?: Partial<CreatePageRequest>
): CreatePageRequest
```

## 📋 迁移指南

### 导入方式更新

```typescript
// ❌ 旧方式
import { DataSourceItem } from "@/api/dataSource";
import { PageComponent } from "@/types/page";

// ✅ 新方式 - 根据使用场景选择
import { DataSourceCore } from "@/types/base"; // 纯业务逻辑
import { ApiDataSourceItem } from "@/types/api"; // API调用
import { DataSourceItem } from "@/types/frontend"; // 前端组件

// ✅ 或者统一从主入口导入
import {
  DataSourceCore, // 基础类型
  ApiDataSourceItem, // API类型
  DataSourceItem, // 前端类型
  PageComponent,
} from "@/types";
```

### 最佳实践

1. **基础类型** - 用于：

   - 业务逻辑函数
   - 数据转换
   - 算法处理

2. **API 类型** - 用于：

   - API 接口调用
   - 服务器数据处理
   - 类型转换的源/目标

3. **前端类型** - 用于：
   - Vue 组件状态
   - 表单管理
   - UI 交互逻辑

## 🎉 总结

这次重构实现了：

- ✅ 所有类型定义集中到 `types/` 目录
- ✅ 按照基础/API/前端三层分离
- ✅ 消除重复定义，提高可维护性
- ✅ 类型安全的转换机制
- ✅ 清晰的使用指南和最佳实践

新的类型系统更加清晰、可维护，为项目的长期发展奠定了坚实的基础。
