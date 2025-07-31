import request from "../utils/request";
import {
  PageCore,
  ApiPageItem,
  CreatePageRequest,
  UpdatePageRequest,
  PageListResponse,
  PageDetailResponse,
  PageReorderRequest,
  SuccessResponse,
  EntityStatus,
} from "../types";

const path = "pageManage";

// ==================== API接口函数 ====================

// 获取应用的所有页面
export function getAppPages(
  appid: string,
  params?: { status?: EntityStatus }
): Promise<PageListResponse> {
  return request({
    url: `api/${path}/app/${appid}`,
    method: "get",
    params,
  });
}

// 获取页面详情
export function getPageInfo(pageid: string): Promise<PageDetailResponse> {
  return request({
    url: `api/${path}/${pageid}`,
    method: "get",
  });
}

// 创建新页面
export function createPage(data: CreatePageRequest): Promise<ApiPageItem> {
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
): Promise<ApiPageItem> {
  return request({
    url: `api/${path}/${pageid}`,
    method: "put",
    data,
  });
}

// 发布页面
export function publishPage(pageid: string): Promise<ApiPageItem> {
  return request({
    url: `api/${path}/${pageid}/publish`,
    method: "post",
  });
}

// 归档页面
export function archivePage(pageid: string): Promise<ApiPageItem> {
  return request({
    url: `api/${path}/${pageid}/archive`,
    method: "post",
  });
}

// 删除页面
export function deletePage(pageid: string): Promise<SuccessResponse> {
  return request({
    url: `api/${path}/${pageid}`,
    method: "delete",
  });
}

// 批量更新页面排序
export function reorderPages(
  appid: string,
  data: PageReorderRequest
): Promise<SuccessResponse> {
  return request({
    url: `api/${path}/app/${appid}/reorder`,
    method: "put",
    data,
  });
}

// ==================== 工具函数 ====================

/**
 * 将API页面转换为基础页面类型
 * 用于在业务逻辑中使用基础类型
 */
export function toBasePage(apiPage: ApiPageItem): PageCore {
  const {
    pageid,
    appid,
    status,
    order,
    creator,
    createdAt,
    updatedAt,
    ...baseFields
  } = apiPage;
  return baseFields;
}

/**
 * 将基础页面转换为创建请求
 * 用于从基础类型创建API请求
 */
export function toCreateRequest(
  basePage: PageCore,
  appid: string,
  additional?: Partial<CreatePageRequest>
): CreatePageRequest {
  return {
    pageName: basePage.pageName,
    description: basePage.description,
    appid,
    components: basePage.components,
    ...additional,
  };
}
