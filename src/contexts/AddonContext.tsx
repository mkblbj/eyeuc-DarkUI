'use client';

/**
 * 插件上下文
 * 
 * 负责管理插件激活状态的全局状态
 * 
 * 架构说明：
 * - 应用启动时从后端加载已激活插件列表
 * - 存储在内存 Set 中，权限检查极快（纳秒级）
 * - 不使用 localStorage
 * - 激活成功后自动刷新状态
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AddonType, AddonContextType, TrialStatus } from '@/types/addon';
import * as addonService from '@/lib/addonService';

/**
 * 插件上下文
 */
const AddonContext = createContext<AddonContextType | undefined>(undefined);

/**
 * 插件 Provider 属性
 */
interface AddonProviderProps {
  children: React.ReactNode;
}

/**
 * 插件 Provider
 * 
 * 在应用根组件中使用此 Provider 包裹所有内容
 * 
 * @example
 * ```tsx
 * <AddonProvider>
 *   <App />
 * </AddonProvider>
 * ```
 */
export function AddonProvider({ children }: AddonProviderProps) {
  const [activatedAddons, setActivatedAddons] = useState<Set<AddonType>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);

  /**
   * 从后端加载已激活插件列表
   */
  const loadActivatedAddons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Web 版本：静默跳过插件加载
      console.log('[AddonContext] Web 版本：跳过插件加载');
      setActivatedAddons(new Set());
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载插件状态失败';
      setError(message);
      console.error('[AddonContext] 加载插件状态失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 检查并加载试用状态
   */
  const loadTrialStatus = useCallback(async () => {
    try {
      // Web 版本：静默跳过试用状态加载
      console.log('[AddonContext] Web 版本：跳过试用状态加载');
      setTrialStatus(null);
    } catch (err) {
      console.error('[AddonContext] 加载试用状态失败:', err);
    }
  }, [loadActivatedAddons]);

  /**
   * 应用启动时加载插件状态和试用状态
   */
  useEffect(() => {
    // 🔧 构建时跳过 API 调用（Next.js 静态生成不需要运行时数据）
    if (typeof window === 'undefined') {
      return;
    }
    
    const init = async () => {
      await loadActivatedAddons();
      await loadTrialStatus();
    };
    init();
  }, [loadActivatedAddons, loadTrialStatus]);

  /**
   * 检查插件是否已激活（支持试用判断）
   * 
   * 优先级：
   * 1. 已购买（永久权限）
   * 2. 试用期内（临时权限）
   * 3. 无权限
   */
  const hasAddon = useCallback(
    (type: AddonType): boolean => {
      // 优先级1：已购买
      if (activatedAddons.has(type)) {
        if (typeof window !== 'undefined') {
          console.log(`[AddonContext] hasAddon(${type}): true (已购买)`);
        }
        return true;
      }
      
      // 优先级2：试用期内（所有插件可用）
      if (trialStatus && trialStatus.is_active) {
        if (typeof window !== 'undefined') {
          console.log(`[AddonContext] hasAddon(${type}): true (试用中，剩余${trialStatus.remaining_hours}小时)`);
        }
        return true;
      }
      
      // 🔧 构建时不输出日志，避免干扰构建输出
      if (typeof window !== 'undefined') {
        console.log(`[AddonContext] hasAddon(${type}): false`);
      }
      return false;
    },
    [activatedAddons, trialStatus]
  );

  /**
   * 激活插件
   */
  const activateAddon = useCallback(
    async (code: string) => {
      // Web 版本：禁用插件激活
      throw new Error('Web 版本不支持插件激活');
    },
    [loadActivatedAddons]
  );

  /**
   * 刷新已激活插件列表
   */
  const refreshAddons = useCallback(async () => {
    await loadActivatedAddons();
  }, [loadActivatedAddons]);

  /**
   * 激活试用码
   */
  const activateTrialCode = useCallback(
    async (code: string) => {
      // Web 版本：禁用试用激活
      throw new Error('Web 版本不支持试用激活');
    },
    [loadTrialStatus, loadActivatedAddons]
  );

  const value: AddonContextType = {
    activatedAddons,
    hasAddon,
    activateAddon,
    refreshAddons,
    isLoading,
    error,
    trialStatus,
    activateTrialCode,
    refreshTrialStatus: loadTrialStatus,
  };

  return (
    <AddonContext.Provider value={value}>
      {children}
    </AddonContext.Provider>
  );
}

/**
 * 使用插件上下文的 Hook
 * 
 * @returns 插件上下文
 * @throws 如果在 AddonProvider 外部使用会抛出错误
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasAddon, activateAddon } = useAddons();
 *   
 *   if (!hasAddon('file_tree')) {
 *     return <UpgradePrompt addon="file_tree" />;
 *   }
 *   
 *   return <FileTreeComponent />;
 * }
 * ```
 */
export function useAddons(): AddonContextType {
  const context = useContext(AddonContext);
  
  if (context === undefined) {
    throw new Error('useAddons 必须在 AddonProvider 内部使用');
  }
  
  return context;
}

/**
 * 便捷 Hook：检查插件是否已激活
 * 
 * @param addonType - 插件类型
 * @returns 包含激活状态和加载状态的对象
 * 
 * @example
 * ```tsx
 * function FileTreeButton() {
 *   const { hasAddon, isLoading } = useHasAddon('file_tree');
 *   
 *   if (isLoading) return <Spinner />;
 *   
 *   return (
 *     <button disabled={!hasAddon}>
 *       {hasAddon ? '打开文件树' : '需要激活插件'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useHasAddon(addonType: AddonType): { hasAddon: boolean; isLoading: boolean } {
  const { hasAddon, isLoading } = useAddons();
  return {
    hasAddon: hasAddon(addonType),
    isLoading
  };
}

