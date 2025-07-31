/**
 * 数据源API类型定义
 * 包含API接口返回的数据源类型
 */

import {
  DataSourceCore,
  FormField,
  EntityStatus,
  DataSourceCategory,
  BaseEntity,
} from "../base";

// ==================== API扩展类型定义 ====================

/**
 * API返回的数据源接口 - 扩展核心类型
 * 包含API特有的字段（如appid, status, creator等）
 */
export interface ApiDataSourceItem extends DataSourceCore, BaseEntity {
  appid: string; // 所属应用ID
  status: EntityStatus; // 状态
  category: DataSourceCategory; // 数据源分类
  tags: string[]; // 标签数组
}

/**
 * 创建数据源请求接口
 */
export interface CreateDataSourceRequest {
  title: string;
  description?: string;
  appid: string;
  category?: DataSourceCategory;
  dataSource?: FormField[];
  tags?: string[];
}

/**
 * 更新数据源请求接口
 */
export interface UpdateDataSourceRequest {
  title?: string;
  description?: string;
  dataSource?: FormField[];
  category?: DataSourceCategory;
  tags?: string[];
}

// ==================== 数据源API响应类型 ====================

/**
 * 数据源列表响应类型
 */
export type DataSourceListResponse = ApiDataSourceItem[];

/**
 * 数据源详情响应类型
 */
export type DataSourceDetailResponse = ApiDataSourceItem;

/**
 * 数据源字段列表响应类型
 */
export type DataSourceFieldsResponse = FormField[];

/**
 * 关联验证响应类型
 */
export interface RelationValidationResponse {
  valid: boolean;
  error?: string;
  targetDataSource?: any;
}
