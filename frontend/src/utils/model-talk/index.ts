/**
 * 应用生成管理类
 * 支持创建新应用或基于现有应用进行修改
 */

import { generateDataSource } from "./generate-data-source";
import { generatePage } from "./generate-page";
import { createApp, updateApp, getAppInfo } from "@/api/app";
import { createDataSource } from "@/api/dataSource";
import { createPage } from "@/api/page";
import type { AppItem } from "@/api/app";
import type { DataSourceItem } from "@/api/dataSource";
import type { PageItem } from "@/api/page";

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

      for (const ds of dataSourceSchema) {
        try {
          const createdDataSource = await createDataSource({
            title: ds.title,
            description: ds.description,
            appid: this.appid!,
            category: "form",
            dataSource: ds.dataSource,
          });
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
            pageName: page.pageName,
            description: page.description,
            appid: this.appid!,
            components: mappedComponents,
            order: page.order,
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
}
