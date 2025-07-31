/**
 * 通用基础类型定义
 * 包含所有业务模块共用的基础类型
 */

// ==================== 通用枚举类型 ====================

/**
 * 实体状态类型 - 用于各种实体的状态管理
 */
export type EntityStatus = "draft" | "published" | "archived";

/**
 * 数据源分类类型
 */
export type DataSourceCategory = "form" | "table" | "chart" | "custom";

/**
 * 页面组件类型
 */
export type ComponentType =
  | "DataManage" // 数据管理组件
  | "Dashboard" // 仪表盘组件
  | "DataCard"; // 数据卡片组件

// ==================== 通用接口定义 ====================

/**
 * 字段选项接口
 * 用于 select、radio、checkbox 等控件的选项定义
 */
export interface FieldOption {
  value: string | number;
  label: string;
}

/**
 * 基础实体接口
 * 包含所有实体共有的字段
 */
export interface BaseEntity {
  createdAt: string;
  updatedAt: string;
  creator: string;
}

/**
 * 带状态的实体接口
 * 扩展基础实体，添加状态字段
 */
export interface EntityWithStatus extends BaseEntity {
  status: EntityStatus;
}

// ==================== 通用类型别名 ====================

/**
 * 通用ID类型
 */
export type ID = string;

/**
 * 时间戳类型
 */
export type Timestamp = string;

/**
 * 键值对类型
 */
export type KeyValuePair<T = any> = Record<string, T>;
