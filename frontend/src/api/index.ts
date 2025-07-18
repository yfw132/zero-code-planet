// 统一导出所有API接口
export * from "./app";
export * from "./page";
export * from "./dataSource";

// 重新导出常用的接口和类型
export {
  // 应用管理
  getAppList,
  createApp,
  updateApp,
  deleteApp,
  cloneApp,
  getAppInfo,
  getAppFullData,
  publishApp,
  archiveApp,
  type AppItem,
  type CreateAppRequest,
  type UpdateAppRequest,
} from "./app";

export {
  // 页面管理
  getAppPages,
  createPage,
  updatePage,
  deletePage,
  getPageInfo,
  publishPage,
  archivePage,
  reorderPages,
  type PageItem,
  type PageComponent,
  type CreatePageRequest,
  type UpdatePageRequest,
} from "./page";

export {
  // 数据源管理
  getAppDataSources,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  getDataSourceInfo,
  publishDataSource,
  archiveDataSource,
  cloneDataSource,
  getDataSourceFields,
  type DataSourceItem,
  type FormField,
  type CreateDataSourceRequest,
  type UpdateDataSourceRequest,
  type ValidationRule,
  type FieldOption,
  type FormFieldConfig,
} from "./dataSource";
