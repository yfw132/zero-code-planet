/**
 * CRUD API类型定义
 * 包含动态CRUD操作的相关类型
 */

import { KeyValuePair } from "../base";

// ==================== CRUD基础类型 ====================

/**
 * 基础响应类型（经过预处理后）
 */
export type CrudResponse<T = any> = T;

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * 记录列表响应（包含分页）
 */
export interface CrudListResponse<T = any> {
  records: T[];
  pagination: PaginationInfo;
}

/**
 * 单条记录响应
 */
export interface CrudRecordResponse<T = any> {
  message?: string;
  record: T;
}

/**
 * 操作成功响应
 */
export interface CrudSuccessResponse {
  message: string;
}

/**
 * 批量删除响应
 */
export interface CrudBatchDeleteResponse {
  message: string;
  deletedCount: number;
}

/**
 * 数据统计响应
 */
export interface CrudStatsResponse {
  totalCount: number;
  todayCount: number;
  fieldStats: Record<string, Array<{ _id: string; count: number }>>;
}

/**
 * 缓存信息响应
 */
export interface CrudCacheInfoResponse {
  cacheSize: number;
  cachedModels: string[];
  mongooseModels: string[];
}

/**
 * 缓存清理响应
 */
export interface CrudCacheClearResponse {
  message: string;
}

// ==================== CRUD请求类型 ====================

/**
 * 记录查询参数
 */
export interface RecordQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  [key: string]: any;
}

/**
 * 批量删除请求
 */
export interface BatchDeleteRequest {
  ids: string[];
}

/**
 * 缓存清理请求
 */
export interface CacheClearRequest {
  datasourceid?: string;
}

/**
 * 记录创建/更新数据
 */
export type RecordData = KeyValuePair;
