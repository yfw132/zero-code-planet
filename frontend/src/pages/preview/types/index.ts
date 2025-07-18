import { PageSchema } from "./page";
import { DataSourceSchema } from "./dataSource";

// 应用Schema
export type AppSchema = {
  appName: string;
  appid: string;
  description: string;
  pages: PageSchema;
  dataSource: DataSourceSchema;
};
