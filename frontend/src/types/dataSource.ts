/**
 * 数据源架构类型定义
 * 用于定义动态表单的数据结构和验证规则
 */

// ==================== 基础类型定义 ====================

/**
 * 表单控件类型
 * 定义了支持的所有表单控件类型
 */
export type FormControlType =
  | "input" // 文本输入框
  | "number" // 数字输入框
  | "email" // 邮箱输入框
  | "tel" // 电话输入框
  | "textarea" // 多行文本框
  | "select" // 下拉选择框
  | "radio" // 单选按钮
  | "checkbox" // 复选框
  | "date" // 日期选择器
  | "switch"; // 开关

/**
 * 表单字段数据类型
 * 定义了字段值的数据类型
 */
export type FormFieldDataType =
  | "string" // 字符串类型
  | "number" // 数字类型
  | "boolean" // 布尔类型
  | "date" // 日期类型
  | "array"; // 数组类型

/**
 * 字段选项接口
 * 用于 select、radio、checkbox 等控件的选项定义
 */
export interface FieldOption {
  value: string | number;
  label: string;
}

// ==================== 验证规则定义 ====================

/**
 * 表单验证规则接口
 * 定义了字段的验证规则
 */
export interface ValidationRule {
  required?: boolean; // 是否必填
  min?: number; // 最小值（用于数字）
  max?: number; // 最大值（用于数字）
  minLength?: number; // 最小长度（用于字符串）
  maxLength?: number; // 最大长度（用于字符串）
  pattern?: string; // 正则表达式模式
  custom?: (value: any) => boolean | string; // 自定义验证函数
}

// ==================== 表单字段配置 ====================

/**
 * 表单字段基础配置接口
 * 定义了字段的基本配置属性
 */
export interface FormFieldConfig {
  placeholder?: string; // 占位符文本
  step?: number; // 步长（用于数字输入）
  options?: FieldOption[]; // 选项列表
  rows?: number; // 行数（用于 textarea）
  suffix?: string; // 后缀文本
  default?: any; // 默认值
  disabled?: boolean; // 是否禁用
  readonly?: boolean; // 是否只读
  visible?: boolean; // 是否可见
}

/**
 * 条件显示配置
 * 定义字段的条件显示逻辑
 */
export interface ConditionalConfig {
  field: string; // 依赖的字段名
  value: any; // 触发条件的值
}

/**
 * 关联配置接口
 * 定义字段与其他数据源的关联关系
 */
export interface RelationConfig {
  type: "foreign" | "lookup" | "cascade"; // 关联类型
  targetDataSourceId: string; // 目标数据源ID
  targetField?: string; // 用于显示的字段名
  targetValueField?: string; // 用于值的字段名
  filter?: Record<string, any>; // 过滤条件
  sort?: Record<string, any>; // 排序条件
  searchable?: boolean; // 是否支持搜索
  searchFields?: string[]; // 搜索字段数组
  paginated?: boolean; // 是否支持分页
  pageSize?: number; // 每页数量
}

/**
 * 表单字段完整定义接口
 * 继承基础配置，添加字段基本信息
 */
export interface FormField {
  name: string; // 字段名（唯一标识）
  type: FormFieldDataType; // 数据类型
  label: string; // 显示标签
  control: FormControlType; // 控件类型
  config?: FormFieldConfig; // 字段配置
  validation?: ValidationRule; // 验证规则
  dependencies?: string[]; // 依赖的其他字段
  conditional?: ConditionalConfig; // 条件显示配置
  relation?: RelationConfig; // 关联配置
}

// ==================== 数据源定义 ====================

/**
 * 数据源项目接口
 * 定义单个数据源的完整结构
 */
export interface DataSourceItem {
  datasourceid: string; // 数据源ID
  title: string; // 标题
  description: string; // 描述
  dataSource: FormField[]; // 字段列表
  version?: string; // 版本号
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
}

/**
 * 数据源架构类型
 * 数据源项目的数组
 */
export type DataSourceSchema = DataSourceItem[];
