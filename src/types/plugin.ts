/**
 * 插件相关类型
 */

import { Plugin, App } from 'obsidian';
import type { EditorProSettings } from '../settings';

/**
 * EditorProPlugin 类型别名
 * 用于在 feature 模块中引用主插件类型，避免循环依赖
 */
export interface EditorProPluginInterface extends Plugin {
    settings: EditorProSettings;
    app: App;
    saveSettings(): Promise<void>;
}

/**
 * Feature 生命周期接口
 * 所有 feature manager 应该实现此接口
 */
export interface FeatureManager {
    /** 注册功能（命令、视图、事件等） */
    register(): void;
    /** 清理资源 */
    cleanup?(): void;
}

/**
 * 条件性功能接口
 * 根据设置决定是否启用
 */
export interface ConditionalFeatureManager extends FeatureManager {
    /** 检查功能是否应该启用 */
    isEnabled(): boolean;
}
