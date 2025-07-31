/**
 * 类型系统统一导出
 * 按照新的目录结构组织所有类型定义
 */

// ==================== 基础类型 (Core Types) ====================
// 所有核心业务类型，不包含API特有字段
export * from "./base";

// ==================== API类型 (API Types) ====================
// API接口返回的类型，包含API特有字段
export * from "./api";

// ==================== 前端类型 (Frontend Types) ====================
// 前端业务逻辑中使用的类型，基于基础类型的扩展
export * from "./frontend";

// ==================== 兼容性导出 ====================
// 为了向后兼容，重新导出常用类型的别名

// 基础类型别名
export type {
  // 通用类型
  EntityStatus,
  DataSourceCategory,
  ComponentType,
  FieldOption,
  BaseEntity,
  ID,
  Timestamp,
  KeyValuePair,

  // 数据源基础类型
  FormControlType,
  FormFieldDataType,
  ValidationRule,
  FormFieldConfig,
  ConditionalConfig,
  RelationConfig,
  FormField,
  DataSourceCore,

  // 页面基础类型
  PageComponentCore,
  PageCore,
} from "./base";

// API类型别名
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
} from "./api";

// 前端类型别名
export type {
  // 数据源前端类型
  DataSourceItem,
  DataSourceSchema,
  DataSourceFormState,
  DataSourceFilter,
  DataSourceSort,

  // 页面前端类型
  PageComponent,
  PageComponentDetail,
  PageItem,
  PageSchema,
  PageEditState,
  PagePreviewConfig,
  ComponentDragState,
  PagePerformance,
} from "./frontend";
