/**
 * 前端数据源类型定义
 * 包含前端业务逻辑中使用的数据源类型
 */

import { DataSourceCore } from "../base";

// ==================== 前端业务类型 ====================

/**
 * 数据源完整接口 - 包含所有前端业务字段
 * 用于前端业务逻辑中的数据源表示
 */
export interface DataSourceItem extends DataSourceCore {
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
}

/**
 * 数据源架构类型
 * 数据源项目的数组
 */
export type DataSourceSchema = DataSourceItem[];

// ==================== 前端特有类型 ====================

/**
 * 数据源表单状态
 */
export interface DataSourceFormState {
  isEditing: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * 数据源列表过滤条件
 */
export interface DataSourceFilter {
  keyword?: string;
  category?: string[];
  status?: string[];
  creator?: string;
  dateRange?: [string, string];
}

/**
 * 数据源排序选项
 */
export interface DataSourceSort {
  field: "title" | "createdAt" | "updatedAt" | "creator";
  order: "asc" | "desc";
}
