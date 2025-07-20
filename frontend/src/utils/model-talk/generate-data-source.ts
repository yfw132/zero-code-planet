/**
 * 入参： {appName: 'test', description: 'test'}
 * 出参： DataSourceSchema
 * 封装一个prompt函数，入参为：{appName: 'test', description: 'test'}，出参为：prompt
 * 在index中封装 模型调用方法，出参为模型返回结果（string）
 * 在这里封装一个pre Handle函数，用于处理模型返回结果，使其符合DataSourceSchema的格式，包含类型的校验，如果存在问题进行兜底等策略，pre Handle
 *
 * 让我总结一下这个utils的主要流程，首先根据入参： {appName: 'test', description: 'test'}调用prompt函数，得到prompt，然后调用模型调用方法，得到模型返回结果，然后调用一个公用函数，用于将模型返回的string处理成json，然后调用pre Handle函数，得到符合DataSourceSchema的格式，最后返回DataSourceSchema
 */

import {
  DataSourceSchema,
  DataSourceItem,
  FormField,
  FormControlType,
  FormFieldDataType,
} from "@/types/dataSource";

import { callModel } from "./model-call";

// 入参接口定义
export interface GenerateDataSourceParams {
  appName: string;
  description: string;
  dataSourceCount?: number; // 数据源个数，默认3-5个
}

// 生成prompt函数
export function generatePrompt(params: GenerateDataSourceParams): string {
  const { appName, description, dataSourceCount = "3-5" } = params;

  return `你是一个专业的数据源设计专家，请根据以下应用信息，为该应用设计${dataSourceCount}个数据源。

应用名称：${appName}
应用描述：${description}

请为这个应用设计合适的数据源，每个数据源应该包含：
1. 数据源标题（title）
2. 数据源描述（description）
3. 字段列表（dataSource），每个字段包含：
   - name: 字段名（英文，驼峰命名）
   - type: 数据类型（string/number/boolean/date/array）
   - label: 显示标签（中文）
   - control: 控件类型（input/number/email/tel/textarea/select/radio/checkbox/date/switch）
   - validation: 验证规则（可选）
   - config: 字段配置（可选）
   - relation: 关联配置（可选，用于关联其他数据源）

关联配置（relation）说明：
当字段需要关联其他数据源时，可以添加relation配置：
- type: 关联类型，固定为"foreign"
- targetDataSourceId: 目标数据源的ID（格式如"ds_xxxxxxxxxxxx"）
- targetField: 用于显示的字段名（如"customerName"）
- targetValueField: 用于值的字段名（通常为"_id"）
- filter: 过滤条件（可选）
- sort: 排序条件（可选）
- searchable: 是否支持搜索（可选，默认false）
- searchFields: 搜索字段数组（可选）
- paginated: 是否支持分页（可选，默认false）
- pageSize: 每页数量（可选，默认20）

请严格按照以下JSON格式返回，不要包含任何其他文字：

[
  {
    "datasourceid": "ds_1",
    "title": "数据源标题",
    "description": "数据源描述",
    "dataSource": [
      {
        "name": "fieldName",
        "type": "string",
        "label": "字段标签",
        "control": "input",
        "validation": {
          "required": true,
          "minLength": 3
        },
        "config": {
          "placeholder": "请输入..."
        }
      },
      {
        "name": "relatedField",
        "type": "string",
        "label": "关联字段",
        "control": "select",
        "validation": {
          "required": true
        },
        "relation": {
          "type": "foreign",
          "targetDataSourceId": "ds_xxxxxxxxxxxx",
          "targetField": "title",
          "targetValueField": "_id",
          "searchable": true,
          "searchFields": ["title", "name"],
          "sort": {
            "title": 1
          }
        }
      }
    ]
  }
]

注意事项：
1. 字段名使用英文驼峰命名法
2. 根据业务场景选择合适的控件类型
3. 为重要字段添加适当的验证规则
4. 数据源数量控制在${dataSourceCount}个
5. 所有的表都会自动生成 id、createTime、updateTime 字段，不要在dataSource这里添加
6. 确保返回的是有效的JSON格式
7. 当设计关联字段时，确保关联的数据源ID格式正确（ds_开头加12位字符）
8. 关联字段通常使用select控件类型
9. 关联配置中的targetDataSourceId应该指向已存在的其他数据源
10. 数据源ID（datasourceid）必须唯一且格式为"ds_"开头加12位字符
11. 关联字段的targetDataSourceId必须与某个数据源的datasourceid完全匹配
12. 一定要先定义主数据源，再定义关联数据源，确保关联关系正确`;
}

// 将模型返回的string处理成JSON
export function parseModelResponse(response: string): any {
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

// 验证和修复字段配置
function validateAndFixField(field: any): FormField {
  const validTypes: FormFieldDataType[] = [
    "string",
    "number",
    "boolean",
    "date",
    "array",
  ];
  const validControls: FormControlType[] = [
    "input",
    "number",
    "email",
    "tel",
    "textarea",
    "select",
    "radio",
    "checkbox",
    "date",
    "switch",
  ];

  // 基础字段验证和修复
  const validatedField: FormField = {
    name: field.name || `field_${Date.now()}`,
    type: validTypes.includes(field.type) ? field.type : "string",
    label: field.label || field.name || "未命名字段",
    control: validControls.includes(field.control) ? field.control : "input",
  };

  // 验证规则处理
  if (field.validation) {
    validatedField.validation = {
      required: !!field.validation.required,
      min:
        typeof field.validation.min === "number"
          ? field.validation.min
          : undefined,
      max:
        typeof field.validation.max === "number"
          ? field.validation.max
          : undefined,
      minLength:
        typeof field.validation.minLength === "number"
          ? field.validation.minLength
          : undefined,
      maxLength:
        typeof field.validation.maxLength === "number"
          ? field.validation.maxLength
          : undefined,
      pattern:
        typeof field.validation.pattern === "string"
          ? field.validation.pattern
          : undefined,
    };
  }

  // 配置处理
  if (field.config) {
    validatedField.config = {
      placeholder: field.config.placeholder,
      step:
        typeof field.config.step === "number" ? field.config.step : undefined,
      options: Array.isArray(field.config.options)
        ? field.config.options
        : undefined,
      rows:
        typeof field.config.rows === "number" ? field.config.rows : undefined,
      suffix: field.config.suffix,
      default: field.config.default,
      disabled: !!field.config.disabled,
      readonly: !!field.config.readonly,
      visible: field.config.visible !== false,
    };
  }

  // 关联配置处理
  if (field.relation) {
    const validRelationTypes = ["foreign", "lookup", "cascade"];

    // 检查relation对象是否有效（至少包含必要的属性）
    const hasValidRelation =
      field.relation.targetDataSourceId &&
      field.relation.type &&
      validRelationTypes.includes(field.relation.type);

    if (hasValidRelation) {
      validatedField.relation = {
        type: validRelationTypes.includes(field.relation.type)
          ? field.relation.type
          : "foreign",
        targetDataSourceId: field.relation.targetDataSourceId || "",
        targetField: field.relation.targetField || undefined,
        targetValueField: field.relation.targetValueField || undefined,
        filter:
          field.relation.filter && typeof field.relation.filter === "object"
            ? field.relation.filter
            : undefined,
        sort:
          field.relation.sort && typeof field.relation.sort === "object"
            ? field.relation.sort
            : undefined,
        searchable: !!field.relation.searchable,
        searchFields: Array.isArray(field.relation.searchFields)
          ? field.relation.searchFields
          : undefined,
        paginated: !!field.relation.paginated,
        pageSize:
          typeof field.relation.pageSize === "number" &&
          field.relation.pageSize > 0
            ? field.relation.pageSize
            : 20,
      };
    }
    // 如果relation无效，则不添加relation字段（保持undefined）
  }

  return validatedField;
}

// 验证和修复数据源项目
function validateAndFixDataSourceItem(item: any): DataSourceItem {
  return {
    datasourceid: item.datasourceid || "",
    title: item.title || "未命名数据源",
    description: item.description || "",
    dataSource: Array.isArray(item.dataSource)
      ? item.dataSource.map(validateAndFixField)
      : [],
    version: item.version || "1.0.0",
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

// 预处理函数：处理模型返回结果，使其符合DataSourceSchema的格式
export function preHandleModelResponse(data: any): DataSourceSchema {
  try {
    // 确保数据是数组
    if (!Array.isArray(data)) {
      throw new Error("模型返回的数据不是数组格式");
    }

    // 验证和修复每个数据源项目
    const validatedData: DataSourceSchema = data.map(
      validateAndFixDataSourceItem
    );

    // 确保至少有一个数据源
    if (validatedData.length === 0) {
      // 兜底策略：创建一个默认的数据源
      validatedData.push({
        datasourceid: "",
        title: "默认数据源",
        description: "系统自动生成的默认数据源",
        dataSource: [
          {
            name: "name",
            type: "string",
            label: "名称",
            control: "input",
            validation: { required: true },
            config: { placeholder: "请输入名称" },
          },
        ],
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return validatedData;
  } catch (error) {
    console.error("预处理模型响应失败:", error);

    // 兜底策略：返回一个基础的数据源
    return [
      {
        datasourceid: "",
        title: "基础数据源",
        description: "系统自动生成的基础数据源",
        dataSource: [
          {
            name: "title",
            type: "string",
            label: "标题",
            control: "input",
            validation: { required: true },
            config: { placeholder: "请输入标题" },
          },
          {
            name: "description",
            type: "string",
            label: "描述",
            control: "textarea",
            config: { placeholder: "请输入描述", rows: 3 },
          },
        ],
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

// 主生成函数：完整的AI数据源生成流程
export async function generateDataSource(
  params: GenerateDataSourceParams
): Promise<DataSourceSchema> {
  try {
    console.log("开始生成数据源，参数:", params);

    // 1. 生成prompt
    const prompt = generatePrompt(params);
    console.log("生成的prompt:", prompt);

    // 2. 调用模型
    const modelResponse = await callModel(prompt);
    console.log("模型返回结果:", modelResponse);

    // 3. 解析JSON
    const parsedData = parseModelResponse(modelResponse);
    console.log("解析后的数据:", parsedData);

    // 4. 预处理和验证
    const result = preHandleModelResponse(parsedData);
    console.log("最终结果:", result);

    return result;
  } catch (error) {
    console.error("生成数据源失败:", error);

    // 兜底策略：返回基础数据源
    return [
      {
        datasourceid: "",
        title: "错误恢复数据源",
        description: "生成失败时的恢复数据源",
        dataSource: [
          {
            name: "errorMessage",
            type: "string",
            label: "错误信息",
            control: "textarea",
            config: { placeholder: "生成数据源时发生错误", rows: 2 },
          },
        ],
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
