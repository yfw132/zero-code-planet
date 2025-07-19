import request from "@/utils/request";

// 动态CRUD API接口
// 注意：request.ts 中的响应拦截器已经处理了 success 字段，直接返回 data 部分
// 所以这里的类型定义对应的是实际接收到的数据格式

// 基础响应类型（经过预处理后）
export type CrudResponse<T = any> = T;

// 分页信息
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// 记录列表响应（包含分页）
export interface CrudListResponse<T = any> {
  records: T[];
  pagination: PaginationInfo;
}

// 单条记录响应
export interface CrudRecordResponse<T = any> {
  message?: string;
  record: T;
}

// 操作成功响应
export interface CrudSuccessResponse {
  message: string;
}

// 批量删除响应
export interface CrudBatchDeleteResponse {
  message: string;
  deletedCount: number;
}

// 数据统计响应
export interface CrudStatsResponse {
  totalCount: number;
  todayCount: number;
  fieldStats: Record<string, Array<{ _id: string; count: number }>>;
}

// 缓存信息响应
export interface CrudCacheInfoResponse {
  cacheSize: number;
  cachedModels: string[];
  mongooseModels: string[];
}

// 缓存清理响应
export interface CrudCacheClearResponse {
  message: string;
}

// 获取数据源配置
export const getDataSourceConfig = (
  datasourceid: string
): Promise<CrudResponse> => {
  return request({
    url: `/api/crud/datasource/${datasourceid}/config`,
    method: "get",
  });
};

// 创建记录
export const createRecord = (
  datasourceid: string,
  data: Record<string, any>
): Promise<CrudRecordResponse> => {
  return request({
    url: `/api/crud/${datasourceid}`,
    method: "post",
    data,
  });
};

// 获取记录列表
export const getRecordList = (
  datasourceid: string,
  params: {
    page?: number;
    limit?: number;
    sort?: string;
    [key: string]: any;
  } = {}
): Promise<CrudListResponse> => {
  return request({
    url: `/api/crud/${datasourceid}`,
    method: "get",
    params,
  });
};

// 获取单条记录
export const getRecord = (
  datasourceid: string,
  id: string
): Promise<CrudResponse> => {
  return request({
    url: `/api/crud/${datasourceid}/${id}`,
    method: "get",
  });
};

// 更新记录
export const updateRecord = (
  datasourceid: string,
  id: string,
  data: Record<string, any>
): Promise<CrudRecordResponse> => {
  return request({
    url: `/api/crud/${datasourceid}/${id}`,
    method: "put",
    data,
  });
};

// 删除记录
export const deleteRecord = (
  datasourceid: string,
  id: string
): Promise<CrudSuccessResponse> => {
  return request({
    url: `/api/crud/${datasourceid}/${id}`,
    method: "delete",
  });
};

// 批量删除记录
export const batchDeleteRecords = (
  datasourceid: string,
  ids: string[]
): Promise<CrudBatchDeleteResponse> => {
  return request({
    url: `/api/crud/${datasourceid}`,
    method: "delete",
    data: { ids },
  });
};

// 获取数据统计
export const getRecordStats = (
  datasourceid: string
): Promise<CrudStatsResponse> => {
  return request({
    url: `/api/crud/${datasourceid}/stats`,
    method: "get",
  });
};

// 调试接口：查看模型缓存状态
export const getModelCacheInfo = (): Promise<CrudCacheInfoResponse> => {
  return request({
    url: `/api/crud/debug/models`,
    method: "get",
  });
};

// 调试接口：清理模型缓存
export const clearModelCache = (
  datasourceid?: string
): Promise<CrudCacheClearResponse> => {
  return request({
    url: `/api/crud/debug/clear-cache`,
    method: "post",
    data: datasourceid ? { datasourceid } : {},
  });
};
