/**
 * 应用生成管理类
 * 支持创建新应用或基于现有应用进行修改
 */

import { generateDataSource } from "./generate-data-source";
import { generatePage } from "./generate-page";
import { generateMockData, type MockDataSchema } from "./generate-mock-data";
import { createApp, updateApp, getAppInfo } from "@/api/app";
import { createDataSource } from "@/api/dataSource";
import { createPage } from "@/api/page";
import { createRecord } from "@/api/crud";
import type { AppItem } from "@/api/app";
import type { DataSourceItem } from "@/api/dataSource";
import type { PageItem } from "@/api/page";
import type { DataSourceSchema } from "@/types/dataSource";

export interface AppConfig {
  appName: string;
  description: string;
  dataSourceCount?: number;
  pageCount?: number;
}

export interface GeneratedAppResult {
  app: AppItem;
  dataSources: DataSourceItem[];
  pages: PageItem[];
}

export class AppGenerator {
  private appid: string | null = null;
  private appInfo: AppItem | null = null;
  private dataSources: DataSourceItem[] = [];
  private pages: PageItem[] = [];

  /**
   * 构造函数
   * @param appid 可选的应用ID，如果不提供则创建新应用
   */
  constructor(appid?: string) {
    this.appid = appid || null;
  }

  /**
   * 初始化应用信息
   * 如果提供了appid，则获取现有应用信息
   */
  async initialize(): Promise<void> {
    if (this.appid) {
      try {
        this.appInfo = await getAppInfo(this.appid);
        console.log("初始化现有应用:", this.appInfo);
      } catch (error) {
        console.error("获取应用信息失败:", error);
        throw new Error(`获取应用信息失败: ${error}`);
      }
    }
  }

  /**
   * 创建新应用
   * @param config 应用配置
   * @returns 创建的应用信息
   */
  async createApp(config: AppConfig): Promise<AppItem> {
    if (this.appid) {
      throw new Error("应用已存在，无法创建新应用");
    }

    try {
      const newApp = await createApp({
        appName: config.appName,
        description: config.description || `AI生成的${config.appName}项目`,
      });

      this.appid = newApp.appid;
      this.appInfo = newApp;
      console.log("创建新应用:", newApp);
      return newApp;
    } catch (error) {
      console.error("创建应用失败:", error);
      throw new Error(`创建应用失败: ${error}`);
    }
  }

  /**
   * 生成并创建数据源（合并操作）
   * @param config 应用配置
   * @returns 创建的数据源列表
   */
  async generateAndCreateDataSources(
    config: AppConfig
  ): Promise<DataSourceItem[]> {
    if (!this.appInfo) {
      throw new Error("应用信息未初始化，请先调用 createApp 或 initialize");
    }

    try {
      // 1. 生成数据源
      const dataSourceSchema = await generateDataSource({
        appName: this.appInfo.appName,
        description: this.appInfo.description || config.description,
        dataSourceCount: config.dataSourceCount || 3,
      });

      console.log("生成的数据源:", dataSourceSchema);

      // 2. 创建数据源到后端
      const createdDataSources: DataSourceItem[] = [];
      // 由于datasourceid在提交之后会发生变化，所以我需要一个map存储映射关系
      const map = new Map<string, string>();

      for (const ds of dataSourceSchema) {
        try {
          ds.dataSource.map((field) => {
            if (field.relation) {
              field.relation.targetDataSourceId =
                map.get(field.relation.targetDataSourceId) || "";
            }
          });
          const createdDataSource = await createDataSource({
            ...ds,
            appid: this.appid!,
            category: "form",
          });
          map.set(ds.datasourceid, createdDataSource.datasourceid);
          createdDataSources.push(createdDataSource);
          console.log("创建的数据源:", createdDataSource);
        } catch (error) {
          console.error("创建数据源失败:", error);
          throw new Error(`创建数据源 "${ds.title}" 失败: ${error}`);
        }
      }

      this.dataSources = createdDataSources;
      return createdDataSources;
    } catch (error) {
      console.error("生成并创建数据源失败:", error);
      throw new Error(`生成并创建数据源失败: ${error}`);
    }
  }

  /**
   * 生成并创建页面（合并操作）
   * @param config 应用配置
   * @param dataSources 数据源架构（用于页面生成）
   * @returns 创建的页面列表
   */
  async generateAndCreatePages(config: AppConfig): Promise<PageItem[]> {
    if (!this.appInfo) {
      throw new Error("应用信息未初始化");
    }

    try {
      // 1. 生成页面
      const pageSchema = await generatePage({
        appName: this.appInfo.appName,
        description: this.appInfo.description || config.description,
        dataSources: this.dataSources,
        pageCount: config.pageCount || 2,
      });

      console.log("生成的页面:", pageSchema);

      // 2. 创建页面到后端
      const createdPages: PageItem[] = [];

      for (const page of pageSchema) {
        try {
          // 映射数据源ID
          const mappedComponents = page.components.map((comp) => {
            const dataSource = this.dataSources.find(
              (ds) => ds.datasourceid === comp.dataSourceId
            );
            return {
              componentName: comp.componentName,
              dataSourceId:
                dataSource?.datasourceid ||
                this.dataSources[0]?.datasourceid ||
                "",
              config: comp.config,
            };
          });

          const createdPage = await createPage({
            ...page,
            appid: this.appid!,
            components: mappedComponents,
          });
          createdPages.push(createdPage);
          console.log("创建的页面:", createdPage);
        } catch (error) {
          console.error("创建页面失败:", error);
          throw new Error(`创建页面 "${page.pageName}" 失败: ${error}`);
        }
      }

      this.pages = createdPages;
      return createdPages;
    } catch (error) {
      console.error("生成并创建页面失败:", error);
      throw new Error(`生成并创建页面失败: ${error}`);
    }
  }

  /**
   * 更新应用信息
   * @param updates 更新内容
   * @returns 更新后的应用信息
   */
  async updateApp(updates: Partial<AppItem>): Promise<AppItem> {
    if (!this.appid) {
      throw new Error("应用ID不存在");
    }

    try {
      const updatedApp = await updateApp(this.appid, updates);
      this.appInfo = updatedApp;
      console.log("更新应用:", updatedApp);
      return updatedApp;
    } catch (error) {
      console.error("更新应用失败:", error);
      throw new Error(`更新应用失败: ${error}`);
    }
  }

  /**
   * 完整的应用生成流程
   * @param config 应用配置
   * @returns 生成结果
   */
  async generateFullApp(config: AppConfig): Promise<GeneratedAppResult> {
    try {
      console.log("开始完整应用生成流程:", config);

      // 1. 创建应用（如果还没有appid）
      let app: AppItem;
      if (!this.appid) {
        app = await this.createApp(config);
      } else {
        await this.initialize();
        app = this.appInfo!;
      }

      // 2. 生成并创建数据源
      const createdDataSources = await this.generateAndCreateDataSources(
        config
      );

      // 3. 生成并创建页面
      const createdPages = await this.generateAndCreatePages(config);

      // 4. 更新应用描述
      const updatedApp = await this.updateApp({
        description: `${config.description} - 已生成 ${createdDataSources.length} 个数据源和 ${createdPages.length} 个页面`,
      });

      console.log("应用生成完成:", {
        app: updatedApp,
        dataSources: createdDataSources,
        pages: createdPages,
      });

      return {
        app: updatedApp,
        dataSources: createdDataSources,
        pages: createdPages,
      };
    } catch (error) {
      console.error("完整应用生成失败:", error);
      throw new Error(
        `完整应用生成失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 获取当前应用信息
   */
  getAppInfo(): AppItem | null {
    return this.appInfo;
  }

  /**
   * 获取当前应用ID
   */
  getAppId(): string | null {
    return this.appid;
  }

  /**
   * 获取已创建的数据源
   */
  getDataSources(): DataSourceItem[] {
    return this.dataSources;
  }

  /**
   * 获取已创建的页面
   */
  getPages(): PageItem[] {
    return this.pages;
  }

  /**
   * 生成并插入mock数据（合并操作）
   * @param recordCount 每个数据源的记录数量，默认10条
   * @returns 插入的记录统计信息
   */
  async generateAndInsertMockData(recordCount: number = 10): Promise<{
    totalRecords: number;
    dataSourceStats: Array<{
      datasourceid: string;
      title: string;
      insertedCount: number;
    }>;
  }> {
    if (!this.appInfo) {
      throw new Error("应用信息未初始化，请先调用 createApp 或 initialize");
    }

    if (this.dataSources.length === 0) {
      throw new Error("没有可用的数据源，请先生成数据源");
    }

    try {
      console.log(
        "开始生成并插入mock数据，数据源数量:",
        this.dataSources.length
      );

      // 1. 生成mock数据
      const mockDataSchema = await generateMockData({
        dataSourceSchema: this.dataSources as DataSourceSchema,
        recordCount: recordCount,
      });

      console.log("生成的mock数据:", mockDataSchema);

      // 2. 插入mock数据到后端
      const dataSourceStats: Array<{
        datasourceid: string;
        title: string;
        insertedCount: number;
      }> = [];
      let totalRecords = 0;

      // 按顺序插入数据，确保关联关系正确
      for (const mockDataSource of mockDataSchema) {
        try {
          let insertedCount = 0;
          console.log(`开始插入数据源 "${mockDataSource.title}" 的记录...`);

          // 插入该数据源的所有记录
          for (const record of mockDataSource.records) {
            try {
              await createRecord(mockDataSource.datasourceid, record);
              insertedCount++;
              totalRecords++;
              console.log(
                `成功插入记录 ${insertedCount}/${mockDataSource.records.length}`
              );
            } catch (error) {
              console.error(`插入记录失败:`, error);
              // 继续插入其他记录，不中断整个流程
            }
          }

          dataSourceStats.push({
            datasourceid: mockDataSource.datasourceid,
            title: mockDataSource.title,
            insertedCount: insertedCount,
          });

          console.log(
            `数据源 "${mockDataSource.title}" 插入完成，共插入 ${insertedCount} 条记录`
          );
        } catch (error) {
          console.error(`插入数据源 "${mockDataSource.title}" 失败:`, error);
          // 记录失败的数据源，但继续处理其他数据源
          dataSourceStats.push({
            datasourceid: mockDataSource.datasourceid,
            title: mockDataSource.title,
            insertedCount: 0,
          });
        }
      }

      console.log("Mock数据插入完成，统计信息:", {
        totalRecords,
        dataSourceStats,
      });

      return {
        totalRecords,
        dataSourceStats,
      };
    } catch (error) {
      console.error("生成并插入mock数据失败:", error);
      throw new Error(`生成并插入mock数据失败: ${error}`);
    }
  }
}
