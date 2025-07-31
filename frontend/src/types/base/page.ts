/**
 * 页面基础类型定义
 * 包含页面相关的核心业务类型
 */

import { ComponentType } from "./common";

// ==================== 页面组件定义 ====================

/**
 * 页面组件核心接口 - 不包含API特有字段
 * 定义组件的核心业务属性
 */
export interface PageComponentCore {
  componentName: ComponentType;
  dataSourceId: string;
  config?: Record<string, any>; // 组件的详细配置 后期代扩充
}

// ==================== 页面定义 ====================

/**
 * 页面核心业务接口 - 不包含API特有字段
 * 定义页面的核心业务属性
 */
export interface PageCore {
  pageName: string;
  description: string;
  components: PageComponentCore[];
}
