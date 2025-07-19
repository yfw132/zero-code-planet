import { AppSchema } from "../../../types";

import { testPageSchema } from "./page";
import { testDataSourceSchema } from "./dataSource";

export const testAppSchema: AppSchema = {
  appName: "数据管理平台",
  appid: "appid1",
  description: "企业级数据管理解决方案",
  pages: testPageSchema,
  dataSource: testDataSourceSchema,
};

// 默认应用ID和页面ID
export const DEFAULT_APP_ID = "appid1";
export const DEFAULT_PAGE_ID = "pageid1";
