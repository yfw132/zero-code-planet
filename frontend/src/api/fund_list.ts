import request from "../utils/request";

const path = "fund_list";

export function getFundList(params?: any) {
  return request({
    url: `api/${path}/getList`,
    method: "get",
    params,
  });
}

export function updateFundItem(id: string, data: any) {
  return request({
    url: `api/${path}/edit/${id}`,
    method: "put",
    data,
  });
}

export function addFundItem(data: any) {
  return request({
    url: `api/${path}/add`,
    method: "post",
    data,
  });
}