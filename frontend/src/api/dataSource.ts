import request from "../utils/request";
import {
  DataSourceCore,
  RelationConfig,
  ApiDataSourceItem,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  DataSourceListResponse,
  DataSourceDetailResponse,
  DataSourceFieldsResponse,
  RelationValidationResponse,
  EntityStatus,
  DataSourceCategory,
} from "../types";

const path = "dataSourceManage";

// ==================== API接口函数 ====================

// 获取应用的所有数据源
export function getAppDataSources(
  appid: string,
  params?: {
    status?: EntityStatus;
    category?: DataSourceCategory;
  }
): Promise<DataSourceListResponse> {
  return request({
    url: `api/${path}/app/${appid}`,
    method: "get",
    params,
  });
}

// 获取数据源详情
export function getDataSourceInfo(
  datasourceid: string
): Promise<DataSourceDetailResponse> {
  return request({
    url: `api/${path}/${datasourceid}`,
    method: "get",
  });
}

// 创建新数据源
export function createDataSource(
  data: CreateDataSourceRequest
): Promise<ApiDataSourceItem> {
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
): Promise<ApiDataSourceItem> {
  return request({
    url: `api/${path}/${datasourceid}`,
    method: "put",
    data,
  });
}

// 发布数据源
export function publishDataSource(
  datasourceid: string
): Promise<ApiDataSourceItem> {
  return request({
    url: `api/${path}/${datasourceid}/publish`,
    method: "post",
  });
}

// 归档数据源
export function archiveDataSource(
  datasourceid: string
): Promise<ApiDataSourceItem> {
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
): Promise<ApiDataSourceItem> {
  return request({
    url: `api/${path}/${datasourceid}/clone`,
    method: "post",
    data,
  });
}

// 获取数据源的字段定义
export function getDataSourceFields(
  datasourceid: string
): Promise<DataSourceFieldsResponse> {
  return request({
    url: `api/${path}/${datasourceid}/fields`,
    method: "get",
  });
}

// 验证关联配置
export function validateRelation(
  relation: RelationConfig
): Promise<RelationValidationResponse> {
  return request({
    url: "api/dataSourceManage/relation/validate",
    method: "post",
    data: { relation },
  });
}

// ==================== 工具函数 ====================

/**
 * 将API数据源转换为基础数据源类型
 * 用于在业务逻辑中使用基础类型
 */
export function toBaseDataSource(
  apiDataSource: ApiDataSourceItem
): DataSourceCore {
  const {
    appid,
    status,
    category,
    tags,
    creator,
    createdAt,
    updatedAt,
    ...baseFields
  } = apiDataSource;
  return baseFields;
}

/**
 * 将基础数据源转换为创建请求
 * 用于从基础类型创建API请求
 */
export function toCreateRequest(
  baseDataSource: DataSourceCore,
  appid: string,
  additional?: Partial<CreateDataSourceRequest>
): CreateDataSourceRequest {
  return {
    title: baseDataSource.title,
    description: baseDataSource.description,
    appid,
    dataSource: baseDataSource.dataSource,
    ...additional,
  };
}
