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

    <!-- 数据卡片 -->
    <div class="card">
      <div v-loading="loading" class="cards-container">
        <div v-if="paginatedData.length === 0" class="empty-state">
          <el-empty description="暂无数据" />
        </div>
        <div v-else class="cards-grid">
          <div
            v-for="(row, index) in paginatedData"
            :key="row.id || index"
            class="data-card"
            @click="handleRowClick(row)"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <div class="card-title">
                <span class="card-index"
                  >#{{ (currentPage - 1) * pageSize + index + 1 }}</span
                >
                <span class="card-name">{{ getCardTitle(row) }}</span>
              </div>
              <div class="card-actions">
                <el-button
                  type="primary"
                  :icon="Edit"
                  size="small"
                  @click.stop="openEditModal(row)"
                  circle
                />
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="small"
                  @click.stop="deleteItem(row)"
                  circle
                />
              </div>
            </div>

            <!-- 卡片内容 -->
            <div class="card-content">
              <div class="card-fields">
                <div
                  v-for="field in displayFields"
                  :key="field.name"
                  class="field-item"
                >
                  <span class="field-label">{{ field.label }}:</span>
                  <span class="field-value">
                    <el-tag
                      v-if="field.type === 'boolean'"
                      :type="row[field.name] ? 'success' : 'error'"
                      size="small"
                    >
                      {{ formatBooleanValue(row[field.name]) }}
                    </el-tag>
                    <div
                      v-else-if="field.type === 'array'"
                      class="tags-container"
                    >
                      <el-tag
                        v-for="item in formatArrayValue(
                          row[field.name],
                          field
                        ).split(', ')"
                        :key="item"
                        size="small"
                        class="array-tag"
                      >
                        {{ item }}
                      </el-tag>
                    </div>
                    <span v-else-if="field.type === 'date'">
                      {{ formatDateValue(row[field.name]) }}
                    </span>
                    <span v-else class="text-value">
                      {{ row[field.name] || "-" }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                placeholder="请选择"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="option in field.config?.options"
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
  type CrudResponse,
  type CrudListResponse,
  type CrudRecordResponse,
  type CrudSuccessResponse,
} from "../../../../../api/crud";

// dataSourceSchema 是从父组件传递过来的参数
const props = defineProps<{
  dataSourceSchema: DataSourceItem;
}>();

// 响应式数据
const currentSchema = ref<DataSourceItem>(props.dataSourceSchema);
const dataList = ref<Record<string, any>[]>([]);
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

// 获取数据源ID
const getDataSourceId = computed(() => {
  return currentSchema.value.datasourceid;
});

// 计算属性
const displayFields = computed(() => {
  // 选择要在卡片中显示的字段
  const fields = currentSchema.value.dataSource.filter((field) => {
    // 排除一些不适合在卡片中显示的字段
    if (
      field.control === "textarea" &&
      field.name !== "introduction" &&
      field.name !== "summary"
    ) {
      return false;
    }
    // 排除协议同意等纯功能性字段
    if (
      field.type === "boolean" &&
      (field.name === "agreement" || field.name === "newsletter")
    ) {
      return false;
    }
    return true;
  });

  // 限制显示字段数量，优先显示重要字段
  return fields.slice(0, 8);
});

const visibleFields = computed(() => {
  return currentSchema.value.dataSource.filter((field) =>
    isFieldVisible(field)
  );
});

const filteredData = computed(() => {
  if (!searchQuery.value) return dataList.value;

  return dataList.value.filter((item: Record<string, any>) => {
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
const getCardTitle = (row: Record<string, any>): string => {
  // 根据不同的数据源类型，返回合适的标题
  const schema = currentSchema.value;
  const dataSourceId = schema.datasourceid;

  if (dataSourceId === "user") {
    return row.name || "未命名用户";
  } else if (dataSourceId === "product") {
    return row.productName || "未命名产品";
  } else if (dataSourceId === "order") {
    return row.orderNumber || "未命名订单";
  } else if (dataSourceId === "article") {
    return row.title || "未命名文章";
  } else if (dataSourceId === "employee") {
    return row.fullName || "未命名员工";
  }

  // 默认取第一个字符串字段作为标题
  const firstStringField = schema.dataSource.find(
    (field) => field.type === "string"
  );
  return firstStringField ? row[firstStringField.name] || "未命名" : "数据项";
};

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

const openAddModal = () => {
  isEditing.value = false;
  editingItem.value = null;
  initFormData();
  showModal.value = true;
};

const openEditModal = (item: Record<string, any>) => {
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
  const dataStr = JSON.stringify(dataList.value, null, 2);
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
    dataList.value = response.records;
    totalCount.value = response.pagination.total;
  } catch (error) {
    ElMessage.error("加载数据失败");
    console.error("加载数据错误:", error);
  } finally {
    loading.value = false;
  }
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

// 监听数据源变化
watch(
  () => props.dataSourceSchema,
  (newSchema: DataSourceItem) => {
    if (newSchema) {
      currentSchema.value = newSchema;
      initFormData();
      loadData();
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

// 卡片布局样式
.cards-container {
  min-height: 200px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 4px;
}

.data-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .card-title {
      flex: 1;
      min-width: 0;

      .card-index {
        display: inline-block;
        background: var(--el-color-primary-light-8);
        color: var(--el-color-primary);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-right: 8px;
      }

      .card-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        word-break: break-word;
      }
    }

    .card-actions {
      display: flex;
      gap: 8px;
      margin-left: 12px;

      .el-button {
        transition: all 0.2s;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }

  .card-content {
    .card-fields {
      display: grid;
      gap: 12px;

      .field-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;

        .field-label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          font-weight: 500;
          min-width: 70px;
          flex-shrink: 0;
        }

        .field-value {
          flex: 1;
          min-width: 0;

          .text-value {
            font-size: 14px;
            color: var(--el-text-color-primary);
            word-break: break-word;
          }

          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }

          .array-tag {
            margin: 0;
          }

          .el-tag {
            border-radius: 6px;
          }
        }
      }
    }
  }
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

  // 卡片响应式
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .data-card {
    padding: 16px;

    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .card-actions {
        margin-left: 0;
        align-self: flex-end;
      }
    }

    .card-content {
      .card-fields {
        .field-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;

          .field-label {
            min-width: auto;
          }
        }
      }
    }
  }
}

// 平板设备响应式
@media (max-width: 1024px) and (min-width: 769px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }

  .data-card {
    .card-header {
      .card-title {
        .card-name {
          font-size: 15px;
        }
      }
    }
  }
}
</style>
