import request from "../utils/request";

const path = "appManage";

// 通用分页信息类型
export interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 应用列表响应类型
export interface AppListResponse {
  apps: AppItem[];
  pagination: PaginationInfo;
}

// 应用列表和查询
export function getAppList(params?: any): Promise<AppListResponse> {
  return request({
    url: `api/${path}`,
    method: "get",
    params,
  });
}

// 获取应用基本信息
export function getAppInfo(appid: string): Promise<AppItem> {
  return request({
    url: `api/${path}/${appid}`,
    method: "get",
  });
}

// 获取应用完整数据（包含关联的pages和dataSources）
export function getAppFullData(appid: string): Promise<AppItem> {
  return request({
    url: `api/${path}/${appid}/full`,
    method: "get",
  });
}

// 创建新应用
export function createApp(data: CreateAppRequest): Promise<AppItem> {
  return request({
    url: `api/${path}`,
    method: "post",
    data,
  });
}

// 更新应用
export function updateApp(
  appid: string,
  data: UpdateAppRequest
): Promise<AppItem> {
  return request({
    url: `api/${path}/${appid}`,
    method: "put",
    data,
  });
}

// 发布应用
export function publishApp(appid: string): Promise<AppItem> {
  return request({
    url: `api/${path}/${appid}/publish`,
    method: "post",
  });
}

// 归档应用
export function archiveApp(appid: string): Promise<AppItem> {
  return request({
    url: `api/${path}/${appid}/archive`,
    method: "post",
  });
}

// 删除应用
export function deleteApp(appid: string): Promise<{ message: string }> {
  return request({
    url: `api/${path}/${appid}`,
    method: "delete",
  });
}

// 复制应用
export function cloneApp(
  appid: string,
  data: { newAppName: string }
): Promise<AppItem> {
  return request({
    url: `api/${path}/${appid}/clone`,
    method: "post",
    data,
  });
}

// 应用管理相关的类型定义
export interface AppItem {
  appid: string;
  appName: string;
  description?: string;
  version: string;
  status: "draft" | "published" | "archived";
  creator: string;
  tags: string[];
  pages: string[];
  dataSource: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppRequest {
  appName: string;
  description?: string;
}

export interface UpdateAppRequest {
  appName?: string;
  description?: string;
  version?: string;
  status?: string;
  tags?: string[];
}
