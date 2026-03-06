/**
 * 插件系统类型定义（预留接口，后续迭代实现）
 *
 * 使用方式（未来）：
 *   import type { PluginDefinition } from '@/types/plugin';
 *   const myPlugin: PluginDefinition = { ... };
 */

import type { ReactNode } from 'react';
import type { CreateBillData } from './bill';

/** 插件路由定义 */
export interface PluginRoute {
    path: string;
    component: () => ReactNode;
    label?: string;
    icon?: string;
}

/** 插件菜单项 */
export interface PluginMenuItem {
    location: 'tab-bar' | 'settings';
    label: string;
    icon: string;
    path: string;
}

/** 账单中间件（创建/更新前后的处理器） */
export type BillMiddleware = (
    billData: CreateBillData,
    next: () => Promise<string>
) => Promise<string>;

/** 卡片装饰器 */
export interface CardDecorator {
    id: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'overlay';
    render: (billId: string) => ReactNode;
}

/** 插件上下文（传入 onInit 回调） */
export interface PluginContext {
    navigate: (path: string) => void;
    toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

/** 插件定义接口 */
export interface PluginDefinition {
    /** 唯一标识符 */
    id: string;
    /** 显示名称 */
    name: string;
    /** 语义化版本号 */
    version: string;
    /** 可选描述 */
    description?: string;

    /** 路由扩展 */
    routes?: PluginRoute[];
    /** 菜单扩展 */
    menuItems?: PluginMenuItem[];
    /** 账单中间件 */
    billMiddleware?: BillMiddleware[];
    /** 卡片装饰器 */
    cardDecorators?: CardDecorator[];

    /** 初始化回调 */
    onInit?: (context: PluginContext) => void | Promise<void>;
    /** 销毁回调 */
    onDestroy?: () => void;
}
