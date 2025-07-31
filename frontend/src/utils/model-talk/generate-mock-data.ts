/**
 * 入参： {dataSourceSchema: DataSourceSchema, recordCount: 10}
 * 出参： MockDataSchema
 * 封装一个prompt函数，入参为：{dataSourceSchema: DataSourceSchema, recordCount: 10}，出参为：prompt
 * 在index中封装 模型调用方法，出参为模型返回结果（string）
 * 在这里封装一个pre Handle函数，用于处理模型返回结果，使其符合MockDataSchema的格式，包含类型的校验，如果存在问题进行兜底等策略，pre Handle
 *
 * 让我总结一下这个utils的主要流程，首先根据入参： {dataSourceSchema: DataSourceSchema, recordCount: 10}调用prompt函数，得到prompt，然后调用模型调用方法，得到模型返回结果，然后调用一个公用函数，用于将模型返回的string处理成json，然后调用pre Handle函数，得到符合MockDataSchema的格式，最后返回MockDataSchema
 */

import {
  DataSourceSchema,
  DataSourceItem,
  FormField,
  FormFieldDataType,
} from "@/types/dataSource";

import { callModel } from "./model-call";

// 入参接口定义
export interface GenerateMockDataParams {
  dataSourceSchema: DataSourceSchema;
  recordCount?: number; // 每个数据源的记录数量，默认10条
}

// Mock数据记录接口
export interface MockDataRecord {
  [key: string]: any;
}

// Mock数据源接口
export interface MockDataSource {
  datasourceid: string;
  title: string;
  records: MockDataRecord[];
}

// Mock数据架构类型
export type MockDataSchema = MockDataSource[];

// 生成prompt函数
export function generatePrompt(params: GenerateMockDataParams): string {
  const { dataSourceSchema, recordCount = 10 } = params;

  const dataSourceDescriptions = dataSourceSchema
    .map((ds) => {
      const fieldDescriptions = ds.dataSource
        .map((field) => {
          let fieldDesc = `- ${field.name} (${field.type}): ${field.label}`;

          if (field.validation?.required) {
            fieldDesc += " [必填]";
          }

          if (field.config?.options) {
            const options = field.config.options
              .map((opt: any) => `${opt.label}(${opt.value})`)
              .join(", ");
            fieldDesc += ` [选项: ${options}]`;
          }

          if (field.relation?.targetDataSourceId) {
            fieldDesc += ` [关联数据源: ${field.relation.targetDataSourceId}]`;
          }

          if (field.validation?.min !== undefined) {
            fieldDesc += ` [最小值: ${field.validation.min}]`;
          }

          if (field.validation?.max !== undefined) {
            fieldDesc += ` [最大值: ${field.validation.max}]`;
          }

          if (field.validation?.minLength !== undefined) {
            fieldDesc += ` [最小长度: ${field.validation.minLength}]`;
          }

          if (field.validation?.maxLength !== undefined) {
            fieldDesc += ` [最大长度: ${field.validation.maxLength}]`;
          }

          if (field.validation?.pattern) {
            fieldDesc += ` [格式: ${field.validation.pattern}]`;
          }

          return fieldDesc;
        })
        .join("\n    ");

      return `数据源: ${ds.title} (${ds.datasourceid})
  描述: ${ds.description}
  字段:
    ${fieldDescriptions}`;
    })
    .join("\n\n");

  return `你是一个专业的数据生成专家，请根据以下数据源定义，为每个数据源生成${recordCount}条真实的mock数据。

数据源定义：
${dataSourceDescriptions}

生成要求：
1. 数据必须符合字段的类型和验证规则
2. 关联字段的值应该是有效的关联ID（可以是随机生成的ID格式）
3. 数据要真实、合理，符合业务场景
4. 日期字段使用 "YYYY-MM-DD" 格式
5. 布尔字段使用 true/false
6. 数组字段使用数组格式
7. 所有必填字段都必须有值
8. 字符串长度要符合minLength和maxLength限制
9. 数字要符合min和max限制
10. 字符串要符合pattern正则表达式格式

请严格按照以下JSON格式返回，不要包含任何其他文字：

[
  {
    "datasourceid": "ds_xxxxxxxxxxxx",
    "title": "数据源标题",
    "records": [
      {
        "fieldName1": "字段值1",
        "fieldName2": 123,
        "fieldName3": true,
        "fieldName4": "2024-01-01",
        "fieldName5": ["选项1", "选项2"]
      },
      {
        "fieldName1": "字段值2",
        "fieldName2": 456,
        "fieldName3": false,
        "fieldName4": "2024-01-02",
        "fieldName5": ["选项3"]
      }
    ]
  }
]

注意事项：
1. 确保每个数据源的datasourceid与输入的数据源定义完全匹配
2. 字段名必须与数据源定义中的字段名完全一致
3. 关联字段的值应该是有效的ID格式（如：ObjectId格式或自定义ID格式）
4. 数据要多样化，避免所有记录都相同
5. 确保返回的是有效的JSON格式
6. 每个数据源都要生成${recordCount}条记录
7. 数据要符合业务逻辑，比如：
   - 客户名称应该是合理的中文姓名或公司名
   - 电话号码应该符合手机号格式
   - 邮箱应该符合邮箱格式
   - 日期应该是合理的业务日期
   - 金额应该是合理的数字
8. 关联字段的值应该指向已存在的其他数据源中的记录ID`;
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

// 验证和修复字段值
function validateAndFixFieldValue(
  value: any,
  field: FormField,
  mockDataSchema: MockDataSchema
): any {
  // 如果值为空且字段必填，生成默认值
  if (
    (value === null || value === undefined || value === "") &&
    field.validation?.required
  ) {
    return generateDefaultValue(field, mockDataSchema);
  }

  // 如果值为空且字段非必填，返回空值
  if (value === null || value === undefined || value === "") {
    return field.type === "array"
      ? []
      : field.type === "number"
      ? null
      : field.type === "boolean"
      ? false
      : "";
  }

  // 根据字段类型验证和修复值
  switch (field.type) {
    case "string":
      if (typeof value !== "string") {
        value = String(value);
      }
      // 验证长度
      if (
        field.validation?.minLength &&
        value.length < field.validation.minLength
      ) {
        value = value.padEnd(field.validation.minLength, "0");
      }
      if (
        field.validation?.maxLength &&
        value.length > field.validation.maxLength
      ) {
        value = value.substring(0, field.validation.maxLength);
      }
      // 验证正则表达式
      if (field.validation?.pattern) {
        try {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            value = generateDefaultValue(field, mockDataSchema);
          }
        } catch (e) {
          console.warn("正则表达式验证失败:", e);
        }
      }
      break;

    case "number":
      if (typeof value !== "number") {
        value = parseFloat(value) || 0;
      }
      // 验证范围
      if (field.validation?.min !== undefined && value < field.validation.min) {
        value = field.validation.min;
      }
      if (field.validation?.max !== undefined && value > field.validation.max) {
        value = field.validation.max;
      }
      break;

    case "boolean":
      if (typeof value !== "boolean") {
        value = Boolean(value);
      }
      break;

    case "date":
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        value = new Date().toISOString().split("T")[0];
      }
      break;

    case "array":
      if (!Array.isArray(value)) {
        value = [value];
      }
      break;
  }

  return value;
}

// 生成默认值
function generateDefaultValue(
  field: FormField,
  mockDataSchema: MockDataSchema
): any {
  switch (field.type) {
    case "string":
      if (field.control === "email") {
        return "user@example.com";
      }
      if (field.control === "tel") {
        return "13800138000";
      }
      if (field.config?.options && field.config.options.length > 0) {
        return field.config.options[0].value;
      }
      return field.label || "默认值";

    case "number":
      const min = field.validation?.min || 0;
      const max = field.validation?.max || 100;
      return Math.floor(Math.random() * (max - min + 1)) + min;

    case "boolean":
      return Math.random() > 0.5;

    case "date":
      const today = new Date();
      const randomDays = Math.floor(Math.random() * 365);
      const randomDate = new Date(
        today.getTime() - randomDays * 24 * 60 * 60 * 1000
      );
      return randomDate.toISOString().split("T")[0];

    case "array":
      if (field.config?.options && field.config.options.length > 0) {
        const count =
          Math.floor(Math.random() * field.config.options.length) + 1;
        return field.config.options
          .slice(0, count)
          .map((opt: any) => opt.value);
      }
      return [];

    default:
      return "";
  }
}

// 验证和修复数据源记录
function validateAndFixDataSourceRecords(
  dataSource: MockDataSource,
  originalDataSource: DataSourceItem,
  mockDataSchema: MockDataSchema
): MockDataSource {
  const validatedRecords = dataSource.records.map((record) => {
    const validatedRecord: MockDataRecord = {};

    // 验证每个字段
    originalDataSource.dataSource.forEach((field) => {
      const value = record[field.name];
      validatedRecord[field.name] = validateAndFixFieldValue(
        value,
        field,
        mockDataSchema
      );
    });

    return validatedRecord;
  });

  return {
    datasourceid: dataSource.datasourceid,
    title: dataSource.title,
    records: validatedRecords,
  };
}

// 验证和修复数据源项目
function validateAndFixMockDataSource(
  item: any,
  originalDataSources: DataSourceItem[],
  mockDataSchema: MockDataSchema
): MockDataSource {
  // 查找对应的原始数据源
  const originalDataSource = originalDataSources.find(
    (ds) => ds.datasourceid === item.datasourceid
  );

  if (!originalDataSource) {
    throw new Error(`找不到对应的数据源: ${item.datasourceid}`);
  }

  return validateAndFixDataSourceRecords(
    {
      datasourceid: item.datasourceid || "",
      title: item.title || originalDataSource.title,
      records: Array.isArray(item.records) ? item.records : [],
    },
    originalDataSource,
    mockDataSchema
  );
}

// 预处理函数：处理模型返回结果，使其符合MockDataSchema的格式
export function preHandleModelResponse(
  data: any,
  originalDataSources: DataSourceItem[]
): MockDataSchema {
  try {
    // 确保数据是数组
    if (!Array.isArray(data)) {
      throw new Error("模型返回的数据不是数组格式");
    }

    // 验证和修复每个数据源项目
    const validatedData: MockDataSchema = data.map((item) =>
      validateAndFixMockDataSource(item, originalDataSources, [])
    );

    // 确保所有原始数据源都有对应的mock数据
    const missingDataSources = originalDataSources.filter(
      (ds) =>
        !validatedData.find((mockDs) => mockDs.datasourceid === ds.datasourceid)
    );

    // 为缺失的数据源生成默认mock数据
    missingDataSources.forEach((ds) => {
      const defaultRecords = Array.from({ length: 5 }, () => {
        const record: MockDataRecord = {};
        ds.dataSource.forEach((field) => {
          record[field.name] = generateDefaultValue(field, []);
        });
        return record;
      });

      validatedData.push({
        datasourceid: ds.datasourceid,
        title: ds.title,
        records: defaultRecords,
      });
    });

    return validatedData;
  } catch (error) {
    console.error("预处理模型响应失败:", error);

    // 兜底策略：为所有数据源生成基础mock数据
    return originalDataSources.map((ds) => {
      const defaultRecords = Array.from({ length: 3 }, () => {
        const record: MockDataRecord = {};
        ds.dataSource.forEach((field) => {
          record[field.name] = generateDefaultValue(field, []);
        });
        return record;
      });

      return {
        datasourceid: ds.datasourceid,
        title: ds.title,
        records: defaultRecords,
      };
    });
  }
}

// 主生成函数：完整的AI mock数据生成流程
export async function generateMockData(
  params: GenerateMockDataParams
): Promise<MockDataSchema> {
  try {
    console.log("开始生成mock数据，参数:", params);

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
    const result = preHandleModelResponse(parsedData, params.dataSourceSchema);
    console.log("最终结果:", result);

    return result;
  } catch (error) {
    console.error("生成mock数据失败:", error);

    // 兜底策略：返回基础mock数据
    return params.dataSourceSchema.map((ds) => {
      const defaultRecords = Array.from(
        { length: params.recordCount || 5 },
        () => {
          const record: MockDataRecord = {};
          ds.dataSource.forEach((field) => {
            record[field.name] = generateDefaultValue(field, []);
          });
          return record;
        }
      );

      return {
        datasourceid: ds.datasourceid,
        title: ds.title,
        records: defaultRecords,
      };
    });
  }
}
