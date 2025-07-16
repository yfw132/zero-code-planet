import request from "../utils/request";

const path = "dataSourceManage";

// 获取应用的所有数据源
export function getAppDataSources(
  appid: string,
  params?: {
    status?: string;
    category?: string;
  }
): Promise<DataSourceItem[]> {
  return request({
    url: `api/${path}/app/${appid}`,
    method: "get",
    params,
  });
}

// 获取数据源详情
export function getDataSourceInfo(
  datasourceid: string
): Promise<DataSourceItem> {
  return request({
    url: `api/${path}/${datasourceid}`,
    method: "get",
  });
}

// 创建新数据源
export function createDataSource(
  data: CreateDataSourceRequest
): Promise<DataSourceItem> {
  return request({
    url: `api/${path}`,
    method: "post",
    data,
  });
}

// 更新数据源
export function updateDataSource(
  datasourceid: string,
  data: UpdateDataSourceRequest
): Promise<DataSourceItem> {
  return request({
    url: `api/${path}/${datasourceid}`,
    method: "put",
    data,
  });
}

// 发布数据源
export function publishDataSource(
  datasourceid: string
): Promise<DataSourceItem> {
  return request({
    url: `api/${path}/${datasourceid}/publish`,
    method: "post",
  });
}

// 归档数据源
export function archiveDataSource(
  datasourceid: string
): Promise<DataSourceItem> {
  return request({
    url: `api/${path}/${datasourceid}/archive`,
    method: "post",
  });
}

// 删除数据源
export function deleteDataSource(
  datasourceid: string
): Promise<{ message: string }> {
  return request({
    url: `api/${path}/${datasourceid}`,
    method: "delete",
  });
}

// 复制数据源
export function cloneDataSource(
  datasourceid: string,
  data: {
    newTitle: string;
    targetAppid?: string;
  }
): Promise<DataSourceItem> {
  return request({
    url: `api/${path}/${datasourceid}/clone`,
    method: "post",
    data,
  });
}

// 获取数据源的字段定义
export function getDataSourceFields(
  datasourceid: string
): Promise<FormField[]> {
  return request({
    url: `api/${path}/${datasourceid}/fields`,
    method: "get",
  });
}

// 数据源管理相关的类型定义
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  placeholder?: string;
  step?: number;
  options?: FieldOption[];
  rows?: number;
  suffix?: string;
  default?: any;
  disabled?: boolean;
  readonly?: boolean;
  visible?: boolean;
}

export interface ConditionalConfig {
  field: string;
  value: any;
}

export interface FormField {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "array";
  label: string;
  control:
    | "input"
    | "number"
    | "email"
    | "tel"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "switch";
  config?: FormFieldConfig;
  validation?: ValidationRule;
  dependencies?: string[];
  conditional?: ConditionalConfig;
}

export interface DataSourceItem {
  datasourceid: string;
  title: string;
  description?: string;
  appid: string;
  dataSource: FormField[];
  version: string;
  status: "draft" | "published" | "archived";
  category: "form" | "table" | "chart" | "custom";
  creator: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDataSourceRequest {
  title: string;
  description?: string;
  appid: string;
  category?: "form" | "table" | "chart" | "custom";
  dataSource?: FormField[];
  tags?: string[];
}

export interface UpdateDataSourceRequest {
  title?: string;
  description?: string;
  dataSource?: FormField[];
  category?: string;
  tags?: string[];
}
