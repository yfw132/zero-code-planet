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
        :data="paginatedData"
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
          :total="filteredData.length"
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

import type { FormField, DataSourceItem } from "../../../types/dataSource";

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
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
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
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (isEditing.value && editingItem.value) {
      // 更新现有项
      const index = tableData.value.findIndex(
        (item) => item === editingItem.value
      );
      if (index !== -1) {
        tableData.value[index] = { ...formData };
      }
      ElMessage.success("数据更新成功！");
    } else {
      // 添加新项
      const newItem = {
        ...formData,
        id: Date.now().toString(),
      };
      tableData.value.push(newItem);
      ElMessage.success("数据添加成功！");
    }

    closeModal();
  } catch (error) {
    ElMessage.error("操作失败，请重试");
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

const confirmDelete = () => {
  if (itemToDelete.value) {
    const index = tableData.value.findIndex(
      (item) => item === itemToDelete.value
    );
    if (index !== -1) {
      tableData.value.splice(index, 1);
      ElMessage.success("数据删除成功！");
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
};

const onCurrentPageChange = (page: number) => {
  currentPage.value = page;
};

// 初始化测试数据
const initTestData = () => {
  const dataSourceId = currentSchema.value.id;

  switch (dataSourceId) {
    case "user":
      tableData.value = [
        {
          id: "1",
          name: "张三",
          age: 28,
          email: "zhangsan@example.com",
          phone: "13800138001",
          gender: "male",
          city: "beijing",
          hobbies: ["reading", "music"],
          birthday: "1995-06-15",
          salary: 15000,
          experience: "3-5",
          introduction: "有丰富的前端开发经验",
          agreement: true,
          newsletter: false,
        },
        {
          id: "2",
          name: "李四",
          age: 32,
          email: "lisi@example.com",
          phone: "13800138002",
          gender: "female",
          city: "shanghai",
          hobbies: ["sports", "travel"],
          birthday: "1991-03-20",
          salary: 18000,
          experience: "5-10",
          introduction: "热爱技术，善于团队协作",
          agreement: true,
          newsletter: true,
        },
        {
          id: "3",
          name: "王五",
          age: 25,
          email: "wangwu@example.com",
          phone: "13800138003",
          gender: "male",
          city: "guangzhou",
          hobbies: ["photography", "gaming"],
          birthday: "1998-09-10",
          salary: 12000,
          experience: "1-3",
          introduction: "刚毕业的新人，学习能力强",
          agreement: true,
          newsletter: true,
        },
      ];
      break;

    case "product":
      tableData.value = [
        {
          id: "1",
          productName: "iPhone 15 Pro",
          productCode: "IP15P001",
          category: "electronics",
          price: 7999,
          stock: 50,
          brand: "Apple",
          status: "active",
          tags: ["new", "hot"],
          description: "最新款iPhone，搭载A17 Pro芯片",
          launchDate: "2023-09-22",
          featured: true,
        },
        {
          id: "2",
          productName: "Nike Air Max 270",
          productCode: "NKE270001",
          category: "sports",
          price: 899,
          stock: 100,
          brand: "Nike",
          status: "active",
          tags: ["hot", "recommend"],
          description: "经典跑鞋，舒适透气",
          launchDate: "2023-08-15",
          featured: false,
        },
        {
          id: "3",
          productName: "编程珠玑",
          productCode: "BK001",
          category: "books",
          price: 59,
          stock: 200,
          brand: "人民邮电出版社",
          status: "active",
          tags: ["recommend"],
          description: "程序员必读经典书籍",
          launchDate: "2023-07-01",
          featured: true,
        },
      ];
      break;

    case "order":
      tableData.value = [
        {
          id: "1",
          orderNumber: "ORD202312001",
          customerName: "张三",
          customerPhone: "13800138001",
          totalAmount: 1999.0,
          orderStatus: "delivered",
          paymentMethod: "alipay",
          shippingAddress: "北京市朝阳区xxx街道xxx号",
          orderDate: "2023-12-01",
          deliveryDate: "2023-12-03",
          urgent: false,
          notes: "请放在门口",
        },
        {
          id: "2",
          orderNumber: "ORD202312002",
          customerName: "李四",
          customerPhone: "13800138002",
          totalAmount: 899.0,
          orderStatus: "shipped",
          paymentMethod: "wechat",
          shippingAddress: "上海市浦东新区xxx路xxx号",
          orderDate: "2023-12-02",
          deliveryDate: "2023-12-04",
          urgent: true,
          notes: "加急订单",
        },
        {
          id: "3",
          orderNumber: "ORD202312003",
          customerName: "王五",
          customerPhone: "13800138003",
          totalAmount: 59.0,
          orderStatus: "paid",
          paymentMethod: "bank",
          shippingAddress: "广州市天河区xxx大道xxx号",
          orderDate: "2023-12-03",
          deliveryDate: "2023-12-05",
          urgent: false,
          notes: "",
        },
      ];
      break;

    case "article":
      tableData.value = [
        {
          id: "1",
          title: "Vue 3.0 新特性详解",
          author: "张三",
          category: "tech",
          tags: ["trending", "tutorial"],
          status: "published",
          publishDate: "2023-12-01",
          readTime: 15,
          summary: "详细介绍Vue 3.0的新特性和改进",
          content: "Vue 3.0带来了许多激动人心的新特性...",
          featured: true,
          allowComments: true,
        },
        {
          id: "2",
          title: "创业公司如何选择技术栈",
          author: "李四",
          category: "business",
          tags: ["featured", "original"],
          status: "published",
          publishDate: "2023-11-28",
          readTime: 20,
          summary: "从技术和商业角度分析创业公司的技术选择",
          content: "创业公司在选择技术栈时需要考虑多个因素...",
          featured: false,
          allowComments: true,
        },
        {
          id: "3",
          title: "北京美食探店指南",
          author: "王五",
          category: "food",
          tags: ["trending"],
          status: "draft",
          publishDate: "",
          readTime: 10,
          summary: "推荐北京地道美食餐厅",
          content: "北京作为历史悠久的城市，有着丰富的美食文化...",
          featured: false,
          allowComments: true,
        },
      ];
      break;

    case "employee":
      tableData.value = [
        {
          id: "1",
          employeeId: "EMP001",
          fullName: "张三",
          department: "tech",
          position: "前端开发工程师",
          level: "senior",
          email: "zhangsan@company.com",
          phone: "13800138001",
          hireDate: "2021-03-15",
          salary: 18000,
          skills: ["javascript", "vue", "react"],
          status: "active",
          notes: "技术能力强，团队合作好",
          remote: true,
        },
        {
          id: "2",
          employeeId: "EMP002",
          fullName: "李四",
          department: "product",
          position: "产品经理",
          level: "middle",
          email: "lisi@company.com",
          phone: "13800138002",
          hireDate: "2022-01-10",
          salary: 16000,
          skills: ["python", "mysql"],
          status: "active",
          notes: "产品规划能力出色",
          remote: false,
        },
        {
          id: "3",
          employeeId: "EMP003",
          fullName: "王五",
          department: "design",
          position: "UI设计师",
          level: "junior",
          email: "wangwu@company.com",
          phone: "13800138003",
          hireDate: "2023-06-01",
          salary: 12000,
          skills: [],
          status: "active",
          notes: "设计作品有创意",
          remote: false,
        },
      ];
      break;

    default:
      tableData.value = [];
  }
};

// 监听数据源变化
watch(
  () => props.dataSourceSchema,
  (newSchema: DataSourceItem) => {
    if (newSchema) {
      currentSchema.value = newSchema;
      initFormData();
      initTestData();
    }
  },
  { immediate: true }
);

// 组件挂载时初始化
onMounted(() => {
  initFormData();
  initTestData();
});
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
