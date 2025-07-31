/**
 * 页面API类型定义
 * 包含API接口返回的页面类型
 */

import { PageCore, PageComponentCore, EntityStatus, BaseEntity } from "../base";

// ==================== API扩展类型定义 ====================

/**
 * API返回的页面接口 - 扩展核心类型
 * 包含API特有的字段（如pageid, appid, status, order, creator等）
 */
export interface ApiPageItem extends PageCore, BaseEntity {
  pageid: string; // 页面ID
  appid: string; // 所属应用ID
  status: EntityStatus; // 状态
  order: number; // 排序
}

/**
 * 创建页面请求接口
 */
export interface CreatePageRequest {
  pageName: string;
  description?: string;
  appid: string;
  components?: PageComponentCore[];
  order?: number;
}

/**
 * 更新页面请求接口
 */
export interface UpdatePageRequest {
  pageName?: string;
  description?: string;
  components?: PageComponentCore[];
  order?: number;
  status?: EntityStatus;
}

// ==================== 页面API响应类型 ====================

/**
 * 页面列表响应类型
 */
export type PageListResponse = ApiPageItem[];

/**
 * 页面详情响应类型
 */
export type PageDetailResponse = ApiPageItem;

/**
 * 页面排序请求类型
 */
export interface PageReorderRequest {
  pageOrders: Array<{ pageid: string; order: number }>;
}

/**
 * 通用成功响应类型
 */
export interface SuccessResponse {
  message: string;
}
