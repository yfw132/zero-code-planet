/**
 * 前端页面类型定义
 * 包含前端业务逻辑中使用的页面类型
 */

import { PageCore, PageComponentCore } from "../base";
import { DataSourceItem } from "./dataSource";

// ==================== 前端业务类型 ====================

/**
 * 页面组件完整接口
 * 用于前端业务逻辑中的组件表示
 */
export interface PageComponent extends PageComponentCore {
  // 可以在这里添加前端特有的字段
}

/**
 * 组件配置详细接口，继承PageComponent
 * 包含关联的数据源详细信息
 */
export interface PageComponentDetail extends PageComponent {
  dataSourceSchema: DataSourceItem;
}

/**
 * 页面完整接口 - 包含所有前端业务字段
 * 用于前端业务逻辑中的页面表示
 */
export interface PageItem extends PageCore {
  // 前端可能需要的额外字段可以在这里添加
  components: PageComponent[]; // 覆盖基础类型，使用前端的PageComponent
}

/**
 * 页面Schema数组类型
 */
export type PageSchema = PageItem[];

// ==================== 前端特有类型 ====================

/**
 * 页面编辑状态
 */
export interface PageEditState {
  isEditing: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  selectedComponent?: string;
}

/**
 * 页面预览配置
 */
export interface PagePreviewConfig {
  mode: "desktop" | "tablet" | "mobile";
  theme: "light" | "dark";
  showGrid: boolean;
  showBounds: boolean;
}

/**
 * 组件拖拽状态
 */
export interface ComponentDragState {
  isDragging: boolean;
  draggedComponent?: PageComponent;
  dropZone?: string;
  insertIndex?: number;
}

/**
 * 页面性能指标
 */
export interface PagePerformance {
  renderTime: number;
  componentCount: number;
  dataSourceCount: number;
  memoryUsage?: number;
}
