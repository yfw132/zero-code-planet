/**
 * API接口统一导出
 * 提供所有API接口函数和相关工具函数
 */

// ==================== 数据源相关API ====================
export {
  getAppDataSources,
  getDataSourceInfo,
  createDataSource,
  updateDataSource,
  publishDataSource,
  archiveDataSource,
  deleteDataSource,
  cloneDataSource,
  getDataSourceFields,
  validateRelation,
  toBaseDataSource,
  toCreateRequest as toDataSourceCreateRequest,
} from "./dataSource";

// ==================== 页面相关API ====================
export {
  getAppPages,
  getPageInfo,
  createPage,
  updatePage,
  publishPage,
  archivePage,
  deletePage,
  reorderPages,
  toBasePage,
  toCreateRequest as toPageCreateRequest,
} from "./page";

// ==================== CRUD相关API ====================
export {
  getDataSourceConfig,
  createRecord,
  getRecordList,
  getRecord,
  updateRecord,
  deleteRecord,
  batchDeleteRecords,
  getRecordStats,
  getModelCacheInfo,
  clearModelCache,
} from "./crud";

// ==================== 应用相关API ====================
export * from "./app";

// ==================== 类型重新导出 ====================
// 从 types 目录重新导出常用的API类型

export type {
  // 数据源API类型
  ApiDataSourceItem,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  DataSourceListResponse,
  DataSourceDetailResponse,
  DataSourceFieldsResponse,
  RelationValidationResponse,

  // 页面API类型
  ApiPageItem,
  CreatePageRequest,
  UpdatePageRequest,
  PageListResponse,
  PageDetailResponse,
  PageReorderRequest,
  SuccessResponse,

  // CRUD API类型
  CrudResponse,
  PaginationInfo,
  CrudListResponse,
  CrudRecordResponse,
  CrudSuccessResponse,
  CrudBatchDeleteResponse,
  CrudStatsResponse,
  CrudCacheInfoResponse,
  CrudCacheClearResponse,
  RecordQueryParams,
  BatchDeleteRequest,
  CacheClearRequest,
  RecordData,
} from "../types";
