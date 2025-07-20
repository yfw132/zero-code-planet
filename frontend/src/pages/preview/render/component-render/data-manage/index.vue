<template>
  <div class="data-manager">
    <!-- 搜索和筛选 -->
    <div class="card toolbar">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索数据..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
        />
      </div>
      <div class="toolbar-actions">
        <el-button type="primary" @click="openAddModal" :icon="Plus">
          添加数据
        </el-button>
        <el-button type="success" @click="exportData" :icon="Download">
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        empty-text="暂无数据"
        @row-click="handleRowClick"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column
          v-for="field in tableFields"
          :key="field.name"
          :prop="field.name"
          :label="field.label"
          :min-width="getColumnWidth(field)"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="field.type === 'boolean'">
              <el-tag
                :type="row[field.name] ? 'success' : 'error'"
                size="small"
              >
                {{ formatBooleanValue(row[field.name]) }}
              </el-tag>
            </span>
            <span v-else-if="field.type === 'array'">
              <el-tag
                v-for="item in formatArrayValue(row[field.name], field).split(
                  ', '
                )"
                :key="item"
                size="small"
                style="margin-right: 4px"
              >
                {{ item }}
              </el-tag>
            </span>
            <span v-else-if="field.type === 'date'">
              {{ formatDateValue(row[field.name]) }}
            </span>
            <span v-else>
              {{ row[field.name] || "-" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click.stop="openEditModal(row)"
              link
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click.stop="deleteItem(row)"
              link
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onCurrentPageChange"
        />
      </div>
    </div>

    <!-- 表单弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="isEditing ? '编辑数据' : '添加数据'"
      width="800px"
      :close-on-click-modal="false"
      @close="closeModal"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="right"
        style="padding: 24px"
      >
        <el-row :gutter="20">
          <el-col
            v-for="field in visibleFields"
            :key="field.name"
            :span="getFieldSpan(field)"
          >
            <el-form-item
              :label="field.label"
              :prop="field.name"
              :required="field.validation?.required"
            >
              <!-- 文本输入框 -->
              <el-input
                v-if="field.control === 'input'"
                v-model="formData[field.name]"
                :placeholder="field.config?.placeholder"
                :disabled="field.config?.disabled"
                :readonly="field.config?.readonly"
                clearable
              />

              <!-- 数字输入框 -->
              <el-input-number
                v-else-if="field.control === 'number'"
                v-model="formData[field.name]"
                :placeholder="field.config?.placeholder"
                :disabled="field.config?.disabled"
                :step="field.config?.step || 1"
                :min="field.validation?.min"
                :max="field.validation?.max"
                style="width: 100%"
              />

              <!-- 邮箱输入框 -->
              <el-input
                v-else-if="field.control === 'email'"
                v-model="formData[field.name]"
                :placeholder="field.config?.placeholder"
                :disabled="field.config?.disabled"
                :readonly="field.config?.readonly"
                type="email"
                clearable
              />

              <!-- 电话输入框 -->
              <el-input
                v-else-if="field.control === 'tel'"
                v-model="formData[field.name]"
                :placeholder="field.config?.placeholder"
                :disabled="field.config?.disabled"
                :readonly="field.config?.readonly"
                clearable
              />

              <!-- 日期选择器 -->
              <el-date-picker
                v-else-if="field.control === 'date'"
                v-model="formData[field.name]"
                type="date"
                :disabled="field.config?.disabled"
                :readonly="field.config?.readonly"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />

              <!-- 文本域 -->
              <el-input
                v-else-if="field.control === 'textarea'"
                v-model="formData[field.name]"
                type="textarea"
                :placeholder="field.config?.placeholder"
                :disabled="field.config?.disabled"
                :readonly="field.config?.readonly"
                :rows="field.config?.rows || 3"
                show-word-limit
                :maxlength="field.validation?.maxLength"
              />

              <!-- 下拉选择框 -->
              <el-select
                v-else-if="field.control === 'select'"
                v-model="formData[field.name]"
                :disabled="field.config?.disabled"
                :placeholder="field.config?.placeholder || '请选择'"
                clearable
                filterable
                :loading="getRelationLoading(field)"
                :remote="!!field.relation"
                :remote-method="
                  field.relation
                    ? (query: string) => handleRelationSearch(field, query)
                    : undefined
                "
                style="width: 100%"
              >
                <el-option
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>

              <!-- 单选按钮 -->
              <el-radio-group
                v-else-if="field.control === 'radio'"
                v-model="formData[field.name]"
                :disabled="field.config?.disabled"
              >
                <el-radio
                  v-for="option in field.config?.options"
                  :key="option.value"
                  :label="option.value"
                >
                  {{ option.label }}
                </el-radio>
              </el-radio-group>

              <!-- 多选框组 -->
              <el-checkbox-group
                v-else-if="
                  field.control === 'checkbox' && field.config?.options
                "
                v-model="formData[field.name]"
                :disabled="field.config?.disabled"
              >
                <el-checkbox
                  v-for="option in field.config.options"
                  :key="option.value"
                  :label="option.value"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>

              <!-- 单个复选框 -->
              <el-checkbox
                v-else-if="
                  field.control === 'checkbox' && !field.config?.options
                "
                v-model="formData[field.name]"
                :disabled="field.config?.disabled"
              >
                {{ field.label }}
              </el-checkbox>

              <!-- 开关 -->
              <el-switch
                v-else-if="field.control === 'switch'"
                v-model="formData[field.name]"
                :disabled="field.config?.disabled"
                active-text="开启"
                inactive-text="关闭"
              />

              <!-- 后缀文本 -->
              <template v-if="field.config?.suffix" #suffix>
                <span class="input-suffix">{{ field.config.suffix }}</span>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeModal">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ submitting ? "保存中..." : "保存" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteModal"
      title="确认删除"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="delete-content">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <p>确定要删除这条数据吗？此操作不可恢复。</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDeleteModal">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Plus,
  Download,
  Search,
  Edit,
  Delete,
  Warning,
} from "@element-plus/icons-vue";

import type {
  FormField,
  DataSourceItem,
} from "../../../../../types/dataSource";

import {
  getRecordList,
  createRecord,
  updateRecord,
  deleteRecord,
  batchDeleteRecords,
  getRecordStats,
  type CrudResponse,
  type CrudListResponse,
} from "../../../../../api/crud";

// dataSourceSchema 是从父组件传递过来的参数
const props = defineProps<{
  dataSourceSchema: DataSourceItem;
}>();

// 响应式数据
const currentSchema = ref<DataSourceItem>(props.dataSourceSchema);
const tableData = ref<Record<string, any>[]>([]);
const formData = reactive<Record<string, any>>({});
const formRef = ref();

// UI 状态
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const editingItem = ref<Record<string, any> | null>(null);
const itemToDelete = ref<Record<string, any> | null>(null);
const submitting = ref(false);
const loading = ref(false);

// 搜索和分页
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

// 关联数据缓存
const relationOptionsCache = ref<Record<string, any[]>>({});
const relationLoadingCache = ref<Record<string, boolean>>({});

// 获取数据源ID
const getDataSourceId = computed(() => {
  return currentSchema.value.datasourceid;
});

// 计算属性
const tableFields = computed(() => {
  return currentSchema.value.dataSource.filter((field) => {
    // 过滤掉不适合在表格中显示的字段
    return field.control !== "textarea" && field.control !== "switch";
  });
});

const visibleFields = computed(() => {
  return currentSchema.value.dataSource.filter((field) =>
    isFieldVisible(field)
  );
});

const filteredData = computed(() => {
  if (!searchQuery.value) return tableData.value;

  return tableData.value.filter((item) => {
    return Object.values(item).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value)
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());
    });
  });
});

const paginatedData = computed(() => {
  return filteredData.value;
});

const formRules = computed(() => {
  const rules: Record<string, any[]> = {};

  currentSchema.value.dataSource.forEach((field) => {
    if (!field.validation) return;

    const fieldRules: any[] = [];

    if (field.validation.required) {
      fieldRules.push({
        required: true,
        message: `${field.label}不能为空`,
        trigger: field.control === "select" ? "change" : "blur",
      });
    }

    if (field.validation.pattern) {
      fieldRules.push({
        pattern: new RegExp(field.validation.pattern),
        message: `${field.label}格式不正确`,
        trigger: "blur",
      });
    }

    if (field.validation.minLength) {
      fieldRules.push({
        min: field.validation.minLength,
        message: `${field.label}长度不能少于${field.validation.minLength}个字符`,
        trigger: "blur",
      });
    }

    if (field.validation.maxLength) {
      fieldRules.push({
        max: field.validation.maxLength,
        message: `${field.label}长度不能超过${field.validation.maxLength}个字符`,
        trigger: "blur",
      });
    }

    if (fieldRules.length > 0) {
      rules[field.name] = fieldRules;
    }
  });

  return rules;
});

// 方法
const initFormData = () => {
  const newFormData: Record<string, any> = {};

  currentSchema.value.dataSource.forEach((field) => {
    if (field.type === "array") {
      newFormData[field.name] = [];
    } else if (field.type === "boolean") {
      newFormData[field.name] =
        field.config?.default !== undefined ? field.config.default : false;
    } else if (field.type === "number") {
      newFormData[field.name] =
        field.config?.default !== undefined ? field.config.default : null;
    } else {
      newFormData[field.name] =
        field.config?.default !== undefined ? field.config.default : "";
    }
  });

  Object.assign(formData, newFormData);
};

const isFieldVisible = (field: FormField): boolean => {
  if (field.config?.visible === false) return false;

  if (field.conditional) {
    const dependentValue = formData[field.conditional.field];
    return dependentValue === field.conditional.value;
  }

  return true;
};

const getFieldSpan = (field: FormField): number => {
  if (field.control === "textarea") return 24;
  if (field.control === "checkbox" && field.config?.options) return 24;
  if (field.control === "radio") return 24;
  return 12;
};

const getColumnWidth = (field: FormField): number => {
  if (field.type === "boolean") return 80;
  if (field.type === "array") return 150;
  if (field.type === "date") return 120;
  if (field.control === "email") return 180;
  if (field.control === "tel") return 140;
  return 120;
};

const openAddModal = async () => {
  isEditing.value = false;
  editingItem.value = null;
  initFormData();
  showModal.value = true;
};

const openEditModal = async (item: Record<string, any>) => {
  isEditing.value = true;
  editingItem.value = item;

  // 填充表单数据
  Object.assign(formData, { ...item });

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingItem.value = null;

  // 清空表单验证
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

// 加载数据列表
const loadData = async () => {
  if (!getDataSourceId.value) {
    ElMessage.error("数据源ID不存在");
    return;
  }

  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };

    // 添加搜索条件
    if (searchQuery.value) {
      // 为所有字符串字段添加搜索条件
      currentSchema.value.dataSource.forEach((field) => {
        if (field.type === "string") {
          params[field.name] = searchQuery.value;
        }
      });
    }

    const response = await getRecordList(getDataSourceId.value, params);
    console.log(response);

    // 根据新的类型定义，response 直接就是 CrudListResponse
    tableData.value = response.records;
    totalCount.value = response.pagination.total;
  } catch (error) {
    ElMessage.error("加载数据失败");
    console.error("加载数据错误:", error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch (error) {
    ElMessage.error("请检查表单信息");
    return;
  }

  submitting.value = true;

  try {
    if (!getDataSourceId.value) {
      throw new Error("数据源ID不存在");
    }

    if (isEditing.value && editingItem.value) {
      // 更新现有项
      const response = await updateRecord(
        getDataSourceId.value,
        editingItem.value._id,
        formData
      );

      // 根据新的类型定义，如果到这里说明更新成功
      ElMessage.success(response.message || "数据更新成功！");
      await loadData(); // 重新加载数据
    } else {
      // 添加新项
      const response = await createRecord(getDataSourceId.value, formData);

      // 根据新的类型定义，如果到这里说明创建成功
      ElMessage.success(response.message || "数据添加成功！");
      await loadData(); // 重新加载数据
    }

    closeModal();
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : "操作失败，请重试"
    );
    console.error("提交错误:", error);
  } finally {
    submitting.value = false;
  }
};

const deleteItem = (item: Record<string, any>) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

const confirmDelete = async () => {
  if (itemToDelete.value && getDataSourceId.value) {
    try {
      const response = await deleteRecord(
        getDataSourceId.value,
        itemToDelete.value._id
      );

      // 根据新的类型定义，如果到这里说明删除成功
      ElMessage.success(response.message || "数据删除成功！");
      await loadData(); // 重新加载数据
    } catch (error) {
      ElMessage.error("删除失败，请重试");
      console.error("删除错误:", error);
    }
  }
  closeDeleteModal();
};

const exportData = () => {
  const dataStr = JSON.stringify(tableData.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentSchema.value.title}_${
    new Date().toISOString().split("T")[0]
  }.json`;
  link.click();
  URL.revokeObjectURL(url);
  ElMessage.success("数据导出成功！");
};

const handleRowClick = (row: Record<string, any>) => {
  // 可以在这里添加行点击事件处理
  console.log(row);
};

// 格式化显示值
const formatBooleanValue = (value: boolean): string => {
  return value ? "是" : "否";
};

const formatArrayValue = (value: any[], field: FormField): string => {
  if (!Array.isArray(value) || value.length === 0) return "-";

  if (field.config?.options) {
    const options = field.config.options;
    return value
      .map((v) => {
        const option = options.find((opt) => opt.value === v);
        return option ? option.label : v;
      })
      .join(", ");
  }

  return value.join(", ");
};

const formatDateValue = (value: string): string => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("zh-CN");
};

// 分页事件处理
const onPageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadData();
};

const onCurrentPageChange = (page: number) => {
  currentPage.value = page;
  loadData();
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  loadData();
};

// 监听搜索变化
watch(searchQuery, () => {
  handleSearch();
});

// 关联数据处理方法
const getRelationLoading = (field: FormField): boolean => {
  if (!field.relation?.targetDataSourceId) return false;
  return relationLoadingCache.value[field.relation.targetDataSourceId] || false;
};

const getFieldOptions = (field: FormField): any[] => {
  if (field.relation?.targetDataSourceId) {
    // 关联数据源的情况
    const cacheKey = field.relation.targetDataSourceId;
    return relationOptionsCache.value[cacheKey] || [];
  } else {
    // 静态选项的情况
    return field.config?.options || [];
  }
};

const loadRelationOptions = async (field: FormField) => {
  if (!field.relation?.targetDataSourceId) return;

  const cacheKey = field.relation.targetDataSourceId;

  // 如果已经加载过，直接返回
  if (
    relationOptionsCache.value[cacheKey] &&
    relationOptionsCache.value[cacheKey].length > 0
  ) {
    return;
  }

  // 如果正在加载中，等待加载完成
  if (relationLoadingCache.value[cacheKey]) {
    return;
  }

  relationLoadingCache.value[cacheKey] = true;

  try {
    const params: any = {
      limit: field.relation.pageSize || 20,
    };

    // 添加过滤条件
    if (field.relation.filter) {
      Object.assign(params, field.relation.filter);
    }

    // 添加排序条件
    if (field.relation.sort) {
      // 将排序对象转换为字符串格式
      const sortArray = Object.entries(field.relation.sort).map(
        ([key, value]) => (value === 1 ? key : `-${key}`)
      );
      params.sort = sortArray.join(",");
    }

    const response = await getRecordList(
      field.relation.targetDataSourceId,
      params
    );

    // 将记录转换为选项格式
    const options = response.records.map((record: any) => ({
      label: record[field.relation!.targetField || "title"] || record._id,
      value: record[field.relation!.targetValueField || "_id"] || record._id,
      data: record,
    }));

    relationOptionsCache.value[cacheKey] = options;
  } catch (error) {
    console.error("加载关联选项失败:", error);
    ElMessage.error("加载关联数据失败");
  } finally {
    relationLoadingCache.value[cacheKey] = false;
  }
};

const handleRelationSearch = async (field: FormField, query: string) => {
  if (!field.relation?.targetDataSourceId) return;

  const cacheKey = field.relation.targetDataSourceId;
  relationLoadingCache.value[cacheKey] = true;

  try {
    const params: any = {
      limit: field.relation.pageSize || 20,
    };

    // 添加搜索条件
    if (field.relation.searchFields && field.relation.searchFields.length > 0) {
      // 为每个搜索字段添加搜索条件
      field.relation.searchFields.forEach((searchField) => {
        params[searchField] = query || "";
      });
    } else {
      // 如果没有指定搜索字段，使用目标字段
      params[field.relation.targetField || "title"] = query || "";
    }

    // 添加过滤条件
    if (field.relation.filter) {
      Object.assign(params, field.relation.filter);
    }

    // 添加排序条件
    if (field.relation.sort) {
      // 将排序对象转换为字符串格式
      const sortArray = Object.entries(field.relation.sort).map(
        ([key, value]) => (value === 1 ? key : `-${key}`)
      );
      params.sort = sortArray.join(",");
    }

    const response = await getRecordList(
      field.relation.targetDataSourceId,
      params
    );

    // 将记录转换为选项格式
    const options = response.records.map((record: any) => ({
      label: record[field.relation!.targetField || "title"] || record._id,
      value: record[field.relation!.targetValueField || "_id"] || record._id,
      data: record,
    }));

    relationOptionsCache.value[cacheKey] = options;
  } catch (error) {
    console.error("搜索关联选项失败:", error);
    ElMessage.error("搜索关联数据失败");
  } finally {
    relationLoadingCache.value[cacheKey] = false;
  }
};

// 监听数据源变化
watch(
  () => props.dataSourceSchema,
  async (newSchema: DataSourceItem) => {
    if (newSchema) {
      currentSchema.value = newSchema;
      initFormData();
      loadData();
      // 清空关联数据缓存
      relationOptionsCache.value = {};
      relationLoadingCache.value = {};
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.data-manager {
  padding: 24px;
}

.card {
  background: var(--el-bg-color);
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--el-box-shadow);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .search-box {
    flex: 1;
    max-width: 400px;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.delete-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0;

  .warning-icon {
    color: #e6a23c;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: #606266;
    font-size: 14px;
  }
}

.input-suffix {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .data-manager {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

    .header-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }

  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .search-box {
      max-width: none;
    }
  }

  // 表格滚动
  :deep(.el-table) {
    .el-table__body-wrapper {
      overflow-x: auto;
    }
  }
}
</style>
