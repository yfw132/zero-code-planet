/**
 * 页面生成功能
 * 入参： {appName: 'test', description: 'test', dataSources: [...]}
 * 出参： PageSchema
 * 封装一个prompt函数，入参为应用信息和数据源信息，出参为prompt
 * 调用模型调用方法，得到模型返回结果（string）
 * 封装一个pre Handle函数，用于处理模型返回结果，使其符合PageSchema的格式
 */

import { callModel } from "./model-call";
import type { DataSourceItem } from "@/api/dataSource";

// 页面字段类型定义
export interface PageField {
  name: string;
  label: string;
  componentName: "DataManage" | "DataCard";
  dataSourceId: string;
  config: Record<string, any>;
}

// 页面项目类型定义
export interface PageItem {
  id: string;
  pageName: string;
  description: string;
  components: PageField[];
  order: number;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 页面架构类型
export type PageSchema = PageItem[];

// 入参接口定义
export interface GeneratePageParams {
  appName: string;
  description: string;
  dataSources: DataSourceItem[];
  pageCount?: number; // 页面个数，默认2-3个
}

// 生成prompt函数
export function generatePagePrompt(params: GeneratePageParams): string {
  const { appName, description, dataSources, pageCount = "2-3" } = params;

  const dataSourceInfo = dataSources
    .map((ds) => `- 【${ds.datasourceid}】: ${ds.title} (${ds.description})`)
    .join("\n");

  return `你是一个专业的页面设计专家，请根据以下应用信息和数据源，为该应用设计${pageCount}个页面。

应用名称：${appName}
应用描述：${description}

可用数据源：
${dataSourceInfo}

请为这个应用设计合适的页面，每个页面应该包含：
1. 页面名称（pageName）
2. 页面描述（description）
3. 组件列表（components），每个组件包含：
   - name: 组件名称（英文，驼峰命名）
   - label: 显示标签（中文）
   - componentName: 组件类型（DataManage/DataCard）
   - dataSourceId: 关联的数据源ID（在可用数据源中用【】包裹起来的部分）
   - config: 组件配置（可选）

请严格按照以下JSON格式返回，不要包含任何其他文字：

[
  {
    "id": "page_1",
    "pageName": "页面名称",
    "description": "页面描述",
    "components": [
      {
        "name": "componentName",
        "label": "组件标签",
        "componentName": "DataManage",
        "dataSourceId": "ds_1",
        "config": {}
      }
    ],
    "order": 1
  }
]

注意事项：
1. 组件名使用英文驼峰命名法
2. 根据业务场景选择合适的组件类型
3. 确保dataSourceId与提供的数据源ID匹配
4. 页面数量控制在${pageCount}个
5. 确保返回的是有效的JSON格式
6. 第一个页面通常是主页，包含主要功能
7. 后续页面可以是数据管理、数据分析等专业页面`;
}

// 将模型返回的string处理成JSON
export function parsePageModelResponse(response: string): any {
  try {
    // 尝试直接解析JSON
    return JSON.parse(response);
  } catch (error) {
    console.error("JSON解析失败:", error);

    // 尝试提取JSON部分
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("提取JSON后解析仍然失败:", e);
      }
    }

    throw new Error("无法解析模型返回的数据");
  }
}

// 验证和修复组件配置
function validateAndFixComponent(
  component: any,
  dataSources: DataSourceItem[]
): PageField {
  const validComponentNames = ["DataManage", "DataCard"];

  // 验证数据源ID是否存在
  const validDataSourceIds = dataSources.map((ds) => ds.datasourceid);
  const dataSourceId = validDataSourceIds.includes(component.dataSourceId)
    ? component.dataSourceId
    : validDataSourceIds[0] || "ds_default";

  return {
    name: component.name || `component_${Date.now()}`,
    label: component.label || component.name || "未命名组件",
    componentName: validComponentNames.includes(component.componentName)
      ? component.componentName
      : "DataManage",
    dataSourceId: dataSourceId,
    config: component.config || {},
  };
}

// 验证和修复页面项目
function validateAndFixPageItem(
  item: any,
  dataSources: DataSourceItem[]
): PageItem {
  return {
    id: item.id || `page_${Date.now()}`,
    pageName: item.pageName || "未命名页面",
    description: item.description || "",
    components: Array.isArray(item.components)
      ? item.components.map((comp: any) =>
          validateAndFixComponent(comp, dataSources)
        )
      : [],
    order: typeof item.order === "number" ? item.order : 1,
    version: item.version || "1.0.0",
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

// 预处理函数：处理模型返回结果，使其符合PageSchema的格式
export function preHandlePageModelResponse(
  data: any,
  dataSources: DataSourceItem[]
): PageSchema {
  try {
    // 确保数据是数组
    if (!Array.isArray(data)) {
      throw new Error("模型返回的数据不是数组格式");
    }

    // 验证和修复每个页面项目
    const validatedData: PageSchema = data.map((item) =>
      validateAndFixPageItem(item, dataSources)
    );

    // 确保至少有一个页面
    if (validatedData.length === 0) {
      // 兜底策略：创建一个默认的页面
      const defaultDataSourceId =
        dataSources.length > 0 ? dataSources[0].datasourceid : "ds_default";
      validatedData.push({
        id: `page_default_${Date.now()}`,
        pageName: "主页",
        description: "应用主页",
        components: [
          {
            name: "mainComponent",
            label: "主要组件",
            componentName: "DataManage",
            dataSourceId: defaultDataSourceId,
            config: {},
          },
        ],
        order: 1,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return validatedData;
  } catch (error) {
    console.error("预处理页面模型响应失败:", error);

    // 兜底策略：返回一个基础的页面
    const defaultDataSourceId =
      dataSources.length > 0 ? dataSources[0].datasourceid : "ds_default";
    return [
      {
        id: `page_fallback_${Date.now()}`,
        pageName: "基础页面",
        description: "系统自动生成的基础页面",
        components: [
          {
            name: "basicComponent",
            label: "基础组件",
            componentName: "DataManage",
            dataSourceId: defaultDataSourceId,
            config: {},
          },
        ],
        order: 1,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

// 主生成函数：完整的AI页面生成流程
export async function generatePage(
  params: GeneratePageParams
): Promise<PageSchema> {
  try {
    console.log("开始生成页面，参数:", params);

    // 1. 生成prompt
    const prompt = generatePagePrompt(params);
    console.log("生成的页面prompt:", prompt);

    // 2. 调用模型
    const modelResponse = await callModel(prompt);
    console.log("页面模型返回结果:", modelResponse);

    // 3. 解析JSON
    const parsedData = parsePageModelResponse(modelResponse);
    console.log("解析后的页面数据:", parsedData);

    // 4. 预处理和验证
    const result = preHandlePageModelResponse(parsedData, params.dataSources);
    console.log("最终页面结果:", result);

    return result;
  } catch (error) {
    console.error("生成页面失败:", error);

    // 兜底策略：返回基础页面
    const defaultDataSourceId =
      params.dataSources.length > 0
        ? params.dataSources[0].datasourceid
        : "ds_default";
    return [
      {
        id: `page_error_${Date.now()}`,
        pageName: "错误恢复页面",
        description: "生成失败时的恢复页面",
        components: [
          {
            name: "errorComponent",
            label: "错误组件",
            componentName: "DataManage",
            dataSourceId: defaultDataSourceId,
            config: {},
          },
        ],
        order: 1,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
