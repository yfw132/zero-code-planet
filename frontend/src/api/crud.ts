import request from "@/utils/request";
import {
  CrudResponse,
  CrudListResponse,
  CrudRecordResponse,
  CrudSuccessResponse,
  CrudBatchDeleteResponse,
  CrudStatsResponse,
  CrudCacheInfoResponse,
  CrudCacheClearResponse,
  RecordQueryParams,
  RecordData,
} from "../types";

// 动态CRUD API接口
// 注意：request.ts 中的响应拦截器已经处理了 success 字段，直接返回 data 部分
// 所以这里的类型定义对应的是实际接收到的数据格式

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
  data: RecordData
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
  params: RecordQueryParams = {}
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
  data: RecordData
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
