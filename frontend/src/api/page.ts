import request from "../utils/request";

const path = "pageManage";

// 获取应用的所有页面
export function getAppPages(
  appid: string,
  params?: { status?: string }
): Promise<PageItem[]> {
  return request({
    url: `api/${path}/app/${appid}`,
    method: "get",
    params,
  });
}

// 获取页面详情
export function getPageInfo(pageid: string): Promise<PageItem> {
  return request({
    url: `api/${path}/${pageid}`,
    method: "get",
  });
}

// 创建新页面
export function createPage(data: CreatePageRequest): Promise<PageItem> {
  return request({
    url: `api/${path}`,
    method: "post",
    data,
  });
}

// 更新页面
export function updatePage(
  pageid: string,
  data: UpdatePageRequest
): Promise<PageItem> {
  return request({
    url: `api/${path}/${pageid}`,
    method: "put",
    data,
  });
}

// 发布页面
export function publishPage(pageid: string): Promise<PageItem> {
  return request({
    url: `api/${path}/${pageid}/publish`,
    method: "post",
  });
}

// 归档页面
export function archivePage(pageid: string): Promise<PageItem> {
  return request({
    url: `api/${path}/${pageid}/archive`,
    method: "post",
  });
}

// 删除页面
export function deletePage(pageid: string): Promise<{ message: string }> {
  return request({
    url: `api/${path}/${pageid}`,
    method: "delete",
  });
}

// 批量更新页面排序
export function reorderPages(
  appid: string,
  data: {
    pageOrders: Array<{ pageid: string; order: number }>;
  }
): Promise<{ message: string }> {
  return request({
    url: `api/${path}/app/${appid}/reorder`,
    method: "put",
    data,
  });
}

// 页面管理相关的类型定义
export interface PageComponent {
  componentName: "DataManage" | "DataVisual" | "DataCard";
  dataSourceId: string;
  config?: Record<string, any>;
}

export interface PageItem {
  pageid: string;
  pageName: string;
  description?: string;
  appid: string;
  components: PageComponent[];
  status: "draft" | "published" | "archived";
  order: number;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageRequest {
  pageName: string;
  description?: string;
  appid: string;
  components?: PageComponent[];
  order?: number;
}

export interface UpdatePageRequest {
  pageName?: string;
  description?: string;
  components?: PageComponent[];
  order?: number;
  status?: string;
}
