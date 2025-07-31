import axios from "axios";

// DeepSeek API 配置
interface DeepSeekConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// DeepSeek API 请求参数
interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  max_tokens: number;
  temperature: number;
  stream?: boolean;
}

// DeepSeek API 响应
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 默认配置
const defaultConfig: DeepSeekConfig = {
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com",
  model: "deepseek-chat",
  maxTokens: 4000,
  temperature: 0.7,
};

// 创建DeepSeek API客户端
const createDeepSeekClient = (config: Partial<DeepSeekConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  if (!finalConfig.apiKey) {
    throw new Error(
      "DeepSeek API Key is required. Please set VITE_DEEPSEEK_API_KEY in your environment variables."
    );
  }

  return axios.create({
    baseURL: finalConfig.baseURL,
    headers: {
      Authorization: `Bearer ${finalConfig.apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 3 * 60 * 1000, // 3分钟超时
  });
};

// 系统提示词
const SYSTEM_PROMPT = `你是一个专业的Web开发、PC端后台管理系统设计专家，擅长根据应用需求设计合适的数据源结构和页面内容。请严格按照用户的要求生成数据，确保是json结构，确保返回的数据格式正确且符合业务需求。`;

/**
 * 调用DeepSeek模型
 * @param prompt 用户提示词
 * @param config 可选配置
 * @returns Promise<string> 模型返回的文本
 */
export async function callModel(
  prompt: string,
  config: Partial<DeepSeekConfig> = {}
): Promise<string> {
  try {
    console.log("开始调用DeepSeek模型...");

    const client = createDeepSeekClient(config);
    const finalConfig = { ...defaultConfig, ...config };

    const requestData: DeepSeekRequest = {
      model: finalConfig.model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: finalConfig.maxTokens,
      temperature: finalConfig.temperature,
      stream: false,
    };

    console.log("发送请求到DeepSeek API:", {
      model: requestData.model,
      maxTokens: requestData.max_tokens,
      temperature: requestData.temperature,
    });

    const response = await client.post<DeepSeekResponse>(
      "/chat/completions",
      requestData
    );

    console.log("DeepSeek API响应:", {
      model: response.data.model,
      usage: response.data.usage,
      finishReason: response.data.choices[0]?.finish_reason,
    });

    // 提取模型返回的内容
    const content = response.data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("模型返回的内容为空");
    }

    console.log("模型返回内容长度:", content.length);
    return content;
  } catch (error) {
    console.error("调用DeepSeek模型失败:", error);

    // 处理不同类型的错误
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // 服务器返回错误状态码
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 401:
            throw new Error(
              "API密钥无效或已过期，请检查VITE_DEEPSEEK_API_KEY配置"
            );
          case 403:
            throw new Error("API访问被拒绝，请检查API密钥权限");
          case 429:
            throw new Error("请求频率过高，请稍后重试");
          case 500:
            throw new Error("DeepSeek服务器内部错误，请稍后重试");
          default:
            throw new Error(
              `API请求失败 (${status}): ${
                data?.error?.message || error.message
              }`
            );
        }
      } else if (error.request) {
        // 网络错误
        throw new Error("网络连接失败，请检查网络连接");
      } else {
        // 其他错误
        throw new Error(`请求配置错误: ${error.message}`);
      }
    } else {
      // 非axios错误
      throw new Error(
        `调用模型时发生未知错误: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * 带重试机制的模型调用
 * @param prompt 用户提示词
 * @param config 可选配置
 * @param maxRetries 最大重试次数
 * @returns Promise<string> 模型返回的文本
 */
export async function callModelWithRetry(
  prompt: string,
  config: Partial<DeepSeekConfig> = {},
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试调用模型 (第${attempt}次)...`);
      return await callModel(prompt, config);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`第${attempt}次调用失败:`, lastError.message);

      if (attempt < maxRetries) {
        // 等待一段时间后重试
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // 指数退避，最大10秒
        console.log(`等待${delay}ms后重试...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`模型调用失败，已重试${maxRetries}次: ${lastError!.message}`);
}

/**
 * 流式调用DeepSeek模型（用于实时显示生成过程）
 * @param prompt 用户提示词
 * @param config 可选配置
 * @param onChunk 处理每个数据块的回调函数
 * @returns Promise<string> 完整的模型返回文本
 */
export async function callModelStream(
  prompt: string,
  config: Partial<DeepSeekConfig> = {},
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    console.log("开始流式调用DeepSeek模型...");

    const client = createDeepSeekClient(config);
    const finalConfig = { ...defaultConfig, ...config };

    const requestData: DeepSeekRequest = {
      model: finalConfig.model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: finalConfig.maxTokens,
      temperature: finalConfig.temperature,
      stream: true,
    };

    const response = await client.post("/chat/completions", requestData, {
      responseType: "stream",
    });

    let fullContent = "";

    // 处理流式响应
    for await (const chunk of response.data) {
      const lines = chunk.toString().split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            console.log("流式响应完成");
            return fullContent;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;

            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent;
  } catch (error) {
    console.error("流式调用DeepSeek模型失败:", error);
    throw error;
  }
}

// 导出配置类型
export type { DeepSeekConfig, DeepSeekRequest, DeepSeekResponse };
