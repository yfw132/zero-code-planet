# 类型系统迁移指南

## 📋 快速迁移清单

### 1. 更新导入语句

```typescript
// ❌ 旧方式
import { DataSourceItem } from "@/api/dataSource";
import { PageItem } from "@/types/page";
import { FormField } from "@/api/dataSource";

// ✅ 新方式 - 根据使用场景选择
import { DataSourceCore, FormField } from "@/types/base"; // 基础业务逻辑
import { ApiDataSourceItem } from "@/types/api"; // API调用
import { DataSourceItem, PageItem } from "@/types/frontend"; // 前端组件

// ✅ 或者统一从主入口导入
import {
  DataSourceCore,
  ApiDataSourceItem,
  DataSourceItem,
  PageItem,
  FormField,
} from "@/types";
```

### 2. 组件状态类型更新

```typescript
// ❌ 旧方式
import { DataSourceItem } from "@/api/dataSource";

const [dataSource, setDataSource] = useState<DataSourceItem>();

// ✅ 新方式
import { DataSourceItem } from "@/types/frontend";

const [dataSource, setDataSource] = useState<DataSourceItem>();
```

### 3. API 调用类型更新

```typescript
// ❌ 旧方式
import { getDataSourceInfo } from "@/api/dataSource";
import type { DataSourceItem } from "@/api/dataSource";

const data: DataSourceItem = await getDataSourceInfo(id);

// ✅ 新方式
import { getDataSourceInfo } from "@/api";
import type { ApiDataSourceItem } from "@/types/api";

const data: ApiDataSourceItem = await getDataSourceInfo(id);
```

### 4. 业务逻辑类型更新

```typescript
// ❌ 旧方式
import { DataSourceItem } from "@/types/dataSource";

function processDataSource(ds: DataSourceItem) {
  // 业务逻辑处理
}

// ✅ 新方式
import { DataSourceCore } from "@/types/base";

function processDataSource(ds: DataSourceCore) {
  // 业务逻辑处理
}
```

## 🔍 常见迁移场景

### 场景 1：Vue 组件中的状态管理

```typescript
// Before
<script setup lang="ts">
import { ref } from 'vue';
import { DataSourceItem } from '@/api/dataSource';

const dataSource = ref<DataSourceItem>();
</script>

// After
<script setup lang="ts">
import { ref } from 'vue';
import { DataSourceItem } from '@/types/frontend';

const dataSource = ref<DataSourceItem>();
</script>
```

### 场景 2：API 服务文件

```typescript
// Before
import { DataSourceItem, CreateDataSourceRequest } from "@/api/dataSource";

class DataSourceService {
  async create(request: CreateDataSourceRequest): Promise<DataSourceItem> {
    // API调用
  }
}

// After
import { ApiDataSourceItem, CreateDataSourceRequest } from "@/types/api";

class DataSourceService {
  async create(request: CreateDataSourceRequest): Promise<ApiDataSourceItem> {
    // API调用
  }
}
```

### 场景 3：工具函数/业务逻辑

```typescript
// Before
import { DataSourceItem } from "@/types/dataSource";

function validateDataSource(ds: DataSourceItem): boolean {
  return ds.title.length > 0;
}

// After
import { DataSourceCore } from "@/types/base";

function validateDataSource(ds: DataSourceCore): boolean {
  return ds.title.length > 0;
}
```

## ⚡ 自动化迁移脚本

如果你有大量文件需要迁移，可以使用以下 VS Code 的查找替换功能：

### 1. 更新导入语句

**查找：** `import.*from.*'@/api/(dataSource|page)'`  
**替换：** 手动更新，根据使用场景选择合适的类型

### 2. 更新类型导入

**查找：** `import.*DataSourceItem.*from '@/api/dataSource'`  
**替换：** `import { DataSourceItem } from '@/types/frontend'` (组件中)  
或 `import { ApiDataSourceItem } from '@/types/api'` (API 中)

## 🐛 常见问题解决

### 问题 1：类型不兼容

```typescript
// 问题：ApiDataSourceItem 不能赋值给 DataSourceCore
const apiData: ApiDataSourceItem = await getDataSourceInfo(id);
const baseData: DataSourceCore = apiData; // ❌ 类型错误

// 解决：使用转换函数
import { toBaseDataSource } from "@/api";
const baseData: DataSourceCore = toBaseDataSource(apiData); // ✅
```

### 问题 2：找不到类型定义

```typescript
// 问题：找不到 FormField 类型
import { FormField } from "@/api/dataSource"; // ❌ 不存在

// 解决：从 base 导入
import { FormField } from "@/types/base"; // ✅
```

### 问题 3：循环依赖

```typescript
// 问题：类型导入循环依赖
import { DataSourceItem } from "@/types/frontend";
import { ApiDataSourceItem } from "@/types/api";

// 解决：按层次导入，避免交叉引用
// 在 API 层使用 API 类型
// 在前端层使用前端类型
// 在基础层使用基础类型
```

## 📝 迁移检查清单

- [ ] 所有 `@/api/dataSource` 导入已更新
- [ ] 所有 `@/api/page` 导入已更新
- [ ] 所有 `@/types/dataSource` 导入已更新
- [ ] 所有 `@/types/page` 导入已更新
- [ ] 组件中使用前端类型
- [ ] API 调用中使用 API 类型
- [ ] 业务逻辑中使用基础类型
- [ ] 类型转换使用工具函数
- [ ] 编译无错误
- [ ] 测试通过

## 🚀 验证迁移成功

运行以下命令确保迁移成功：

```bash
# 类型检查
npm run type-check

# 编译检查
npm run build

# 测试检查
npm run test
```

如果所有检查都通过，恭喜你！迁移成功完成。
