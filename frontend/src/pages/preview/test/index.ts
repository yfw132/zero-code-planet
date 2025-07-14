import { AppSchema } from "../types";

import { testPageSchema } from "./page";
import { testDataSourceSchema } from "./dataSource";

export const testAppSchema: AppSchema = {
  appName: "数据管理平台",
  description: "企业级数据管理解决方案",
  pages: testPageSchema,
  dataSource: testDataSourceSchema,
};
