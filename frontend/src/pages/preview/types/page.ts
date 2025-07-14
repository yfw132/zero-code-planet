import { DataSourceItem } from "./dataSource";

/**
 * 页面Schema类型定义
 */

// 基础组件类型
export type ComponentType =
  | "DataManage" // 数据管理组件
  | "DataVisual"; // 数据可视化组件

// 组件配置接口
export interface PageComponent {
  componentName: ComponentType;
  dataSourceId: string;
}

// 组件配置详细接口，继承PageComponent
export interface PageComponentDetail extends PageComponent {
  dataSourceSchema: DataSourceItem;
}

// 页面配置接口
export interface PageItem {
  pageName: string;
  description: string;
  components: PageComponent[];
}

// 页面Schema数组类型
export type PageSchema = PageItem[];
