import { PageSchema } from "../../../types/page";

// 页面Schema配置
export const testPageSchema: PageSchema = [
  {
    pageName: "用户数据管理",
    description: "这是一个用户数据管理页面",
    components: [
      {
        componentName: "DataManage",
        dataSourceId: "user",
      },
    ],
  },
  {
    pageName: "产品管理",
    description: "产品信息管理和维护",
    components: [
      {
        componentName: "DataCard",
        dataSourceId: "product",
      },
    ],
  },
  {
    pageName: "订单管理",
    description: "订单信息管理和处理",
    components: [
      {
        componentName: "DataManage",
        dataSourceId: "order",
      },
    ],
  },
  {
    pageName: "文章管理",
    description: "文章内容管理和发布",
    components: [
      {
        componentName: "DataCard",
        dataSourceId: "article",
      },
    ],
  },
  {
    pageName: "员工管理",
    description: "员工信息管理和维护",
    components: [
      {
        componentName: "DataManage",
        dataSourceId: "employee",
      },
    ],
  },
  {
    pageName: "用户数据可视化",
    description: "这是一个用户数据可视化页面",
    components: [
      {
        componentName: "DataVisual",
        dataSourceId: "user",
      },
    ],
  },
];
