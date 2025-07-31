# 数据源关联功能 API 文档

## 概述

数据源关联功能允许一个数据源的字段关联到另一个数据源，实现表单选项的动态获取。这在构建复杂业务系统时非常有用，比如客户跟进记录需要关联客户基本信息。

## 关联配置结构

### 字段关联配置

在数据源字段定义中添加 `relation` 配置：

```json
{
  "name": "customerId",
  "type": "string",
  "label": "关联客户",
  "control": "select",
  "relation": {
    "type": "foreign",
    "targetDataSourceId": "ds_01a163360039",
    "targetField": "customerName",
    "targetValueField": "_id",
    "filter": {},
    "sort": {
      "customerName": 1
    },
    "searchable": true,
    "searchFields": ["customerName", "contactPerson"],
    "paginated": true,
    "pageSize": 20
  }
}
```

### 关联配置参数说明

| 参数                 | 类型    | 必填 | 说明                                                                 |
| -------------------- | ------- | ---- | -------------------------------------------------------------------- |
| `type`               | String  | 是   | 关联类型：`foreign`（外键关联）、`lookup`（查找）、`cascade`（级联） |
| `targetDataSourceId` | String  | 是   | 目标数据源的 ID                                                      |
| `targetField`        | String  | 否   | 用于显示的字段名，默认为 `title`                                     |
| `targetValueField`   | String  | 否   | 用于值的字段名，默认为 `_id`                                         |
| `filter`             | Object  | 否   | 过滤条件                                                             |
| `sort`               | Object  | 否   | 排序条件                                                             |
| `searchable`         | Boolean | 否   | 是否支持搜索，默认 `false`                                           |
| `searchFields`       | Array   | 否   | 搜索字段数组                                                         |
| `paginated`          | Boolean | 否   | 是否支持分页，默认 `false`                                           |
| `pageSize`           | Number  | 否   | 每页数量，默认 `20`                                                  |

## API 接口

### 1. 获取关联选项

**接口地址：** `GET /api/datasource/relation/options/:targetDataSourceId`

**请求参数：**

| 参数                 | 类型   | 必填 | 说明                        |
| -------------------- | ------ | ---- | --------------------------- |
| `targetDataSourceId` | String | 是   | 目标数据源 ID（路径参数）   |
| `targetField`        | String | 否   | 显示字段，默认 `title`      |
| `targetValueField`   | String | 否   | 值字段，默认 `_id`          |
| `filter`             | String | 否   | 过滤条件（JSON 字符串）     |
| `sort`               | String | 否   | 排序条件（JSON 字符串）     |
| `search`             | String | 否   | 搜索关键词                  |
| `searchFields`       | String | 否   | 搜索字段数组（JSON 字符串） |
| `page`               | Number | 否   | 页码，默认 `1`              |
| `pageSize`           | Number | 否   | 每页数量，默认 `20`         |
| `limit`              | Number | 否   | 限制返回数量                |

**请求示例：**

```bash
GET /api/datasource/relation/options/ds_01a163360039?targetField=customerName&targetValueField=_id&search=张三&searchFields=["customerName","contactPerson"]&page=1&pageSize=10
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "options": [
      {
        "label": "张三公司",
        "value": "687ba6e69dbdae184426ace4",
        "data": {
          "_id": "687ba6e69dbdae184426ace4",
          "customerName": "张三公司",
          "contactPerson": "张三",
          "phone": "13800138000"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### 2. 验证关联配置

**接口地址：** `POST /api/datasource/relation/validate`

**请求参数：**

```json
{
  "relation": {
    "type": "foreign",
    "targetDataSourceId": "ds_01a163360039",
    "targetField": "customerName",
    "targetValueField": "_id"
  }
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "targetDataSource": {
      "_id": "687ba6e69dbdae184426ace8",
      "title": "客户基本信息",
      "datasourceid": "ds_01a163360039"
    }
  }
}
```

## 使用场景示例

### 场景 1：客户跟进记录关联客户

在"客户跟进记录"数据源中，"关联客户"字段需要从"客户基本信息"表获取选项：

```json
{
  "name": "customerId",
  "type": "string",
  "label": "关联客户",
  "control": "select",
  "relation": {
    "type": "foreign",
    "targetDataSourceId": "ds_01a163360039",
    "targetField": "customerName",
    "targetValueField": "_id",
    "searchable": true,
    "searchFields": ["customerName", "contactPerson"],
    "sort": {
      "customerName": 1
    }
  }
}
```

### 场景 2：销售机会关联客户

在"销售机会"数据源中，"关联客户"字段同样需要从"客户基本信息"表获取选项：

```json
{
  "name": "customerId",
  "type": "string",
  "label": "关联客户",
  "control": "select",
  "relation": {
    "type": "foreign",
    "targetDataSourceId": "ds_01a163360039",
    "targetField": "customerName",
    "targetValueField": "_id",
    "filter": {
      "customerType": "vip"
    },
    "searchable": true,
    "searchFields": ["customerName"]
  }
}
```

## 前端集成

### Vue.js 组件示例

```vue
<template>
  <div>
    <select v-model="selectedValue" @change="handleChange">
      <option value="">请选择客户</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- 搜索框 -->
    <input
      v-if="relationConfig.searchable"
      v-model="searchKeyword"
      @input="handleSearch"
      placeholder="搜索客户..."
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getRelationOptions } from "@/api/dataSource";

export default {
  props: {
    relationConfig: {
      type: Object,
      required: true,
    },
    value: {
      type: String,
      default: "",
    },
  },

  setup(props, { emit }) {
    const options = ref([]);
    const selectedValue = ref(props.value);
    const searchKeyword = ref("");

    const loadOptions = async (search = "") => {
      try {
        const params = {
          targetField: props.relationConfig.targetField,
          targetValueField: props.relationConfig.targetValueField,
          search,
          searchFields: props.relationConfig.searchFields,
          sort: props.relationConfig.sort,
          filter: props.relationConfig.filter,
        };

        const response = await getRelationOptions(
          props.relationConfig.targetDataSourceId,
          params
        );

        options.value = response.data.options;
      } catch (error) {
        console.error("加载选项失败:", error);
      }
    };

    const handleChange = (event) => {
      const value = event.target.value;
      selectedValue.value = value;
      emit("input", value);
    };

    const handleSearch = () => {
      loadOptions(searchKeyword.value);
    };

    onMounted(() => {
      loadOptions();
    });

    return {
      options,
      selectedValue,
      searchKeyword,
      handleChange,
      handleSearch,
    };
  },
};
</script>
```

## 注意事项

1. **性能考虑**：对于大量数据的关联，建议启用分页和搜索功能
2. **数据一致性**：确保关联的数据源在同一个应用下
3. **字段验证**：使用验证 API 确保关联配置的正确性
4. **缓存策略**：前端可以考虑缓存关联选项以提高性能
5. **错误处理**：妥善处理关联数据源不存在等异常情况

## 扩展功能

未来可以考虑添加以下功能：

1. **级联关联**：支持多级关联关系
2. **动态过滤**：根据其他字段值动态过滤关联选项
3. **关联数据同步**：当关联数据更新时自动同步
4. **关联数据验证**：验证关联数据的完整性和一致性
