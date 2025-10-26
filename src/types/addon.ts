/**
 * 插件系统类型定义
 * 
 * 架构说明：
 * - 后端只负责激活状态管理（MySQL + SQLite）
 * - 前端负责插件信息展示（从 i18n 读取）
 * - 激活状态通过 API 获取后存储在内存（Context）
 */

/**
 * 插件类型
 */
export type AddonType = 
  | 'file_tree'
  | 'iff_fixer'
  | 'mods_update'
  | 'drag_drop_import';

/**
 * 插件状态
 */
export type AddonStatus = 'stable' | 'beta' | 'coming_soon';

/**
 * 试用类型
 */
export type TrialType = 'auto' | 'code';

/**
 * 货币类型
 */
export type Currency = 'CNY' | 'USD' | 'JPY' | 'EUR';

/**
 * 插件信息接口（前端从 i18n 组装）
 */
export interface AddonInfo {
  /** 插件 ID */
  id: AddonType;
  /** 插件名称（从 i18n 读取） */
  name: string;
  /** 插件描述（从 i18n 读取） */
  description: string;
  /** 价格（从 i18n 读取，已格式化） */
  price: string;
  /** 特性列表（从 i18n 读取） */
  features: string[];
  /** 图标类名（可选） */
  icon?: string;
  /** 版本号（可选） */
  version?: string;
  /** 插件状态 */
  status?: AddonStatus;
  /** 是否已激活（从 API 获取） */
  isActivated: boolean;
}

/**
 * 插件激活状态映射（从 API 获取）
 * 
 * @example
 * ```typescript
 * {
 *   "file_tree": true,
 *   "file_control": false,
 *   "auto_update": true,
 *   "batch_operations": false
 * }
 * ```
 */
export type AddonStatusMap = Record<AddonType, boolean>;

/**
 * 激活插件请求
 */
export interface ActivateAddonRequest {
  /** 激活码 */
  code: string;
  /** 硬件指纹哈希（可选，后端会自动获取） */
  hardware_fingerprint?: string;
  /** 完整硬件指纹信息（可选，后端会自动获取） */
  hardware_info?: Record<string, any>;
}

/**
 * 激活插件响应
 */
export interface ActivateAddonResponse {
  /** 是否成功 */
  success: boolean;
  /** 插件类型 */
  addon_type: AddonType;
  /** 激活时间（ISO 8601 格式） */
  activated_at: string;
  /** 设备指纹（部分显示） */
  device_fingerprint?: string;
  /** 响应消息 */
  message: string;
}

/**
 * 已激活插件信息
 */
export interface ActivatedAddon {
  /** 插件类型 */
  addon_type: AddonType;
  /** 激活码 */
  activation_code: string;
  /** 激活时间（ISO 8601 格式） */
  activated_at: string;
  /** 设备指纹（部分显示） */
  device_fingerprint?: string;
}

/**
 * API 错误响应
 */
export interface AddonErrorResponse {
  /** 是否成功（固定为 false） */
  success: false;
  /** 错误代码 */
  error: string;
  /** 错误消息（已国际化） */
  message: string;
}

/**
 * 健康检查响应
 */
export interface AddonHealthResponse {
  /** 状态 */
  status: 'ok' | 'error';
  /** 服务名称 */
  service: string;
  /** 版本号 */
  version: string;
  /** 时间戳 */
  timestamp?: string;
}

/**
 * 检查插件状态响应
 */
export interface CheckAddonResponse {
  /** 是否已激活 */
  is_activated: boolean;
}

/**
 * 插件 Context 类型
 */
export interface AddonContextType {
  /** 已激活的插件类型集合（内存缓存） */
  activatedAddons: Set<AddonType>;
  /** 检查插件是否已激活（支持试用判断） */
  hasAddon: (type: AddonType) => boolean;
  /** 激活插件 */
  activateAddon: (code: string) => Promise<ActivateAddonResponse>;
  /** 刷新已激活插件列表 */
  refreshAddons: () => Promise<void>;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 试用状态 */
  trialStatus: TrialStatus | null;
  /** 激活试用码 */
  activateTrialCode: (code: string) => Promise<TrialStatus>;
  /** 刷新试用状态 */
  refreshTrialStatus: () => Promise<void>;
}

/**
 * 插件门控组件属性
 */
export interface AddonGateProps {
  /** 需要的插件类型 */
  addon: AddonType;
  /** 子组件（已激活时显示） */
  children: React.ReactNode;
  /** 备用内容（未激活时显示） */
  fallback?: React.ReactNode;
  /** 加载中的内容 */
  loading?: React.ReactNode;
}

/**
 * 升级提示组件属性
 */
export interface UpgradePromptProps {
  /** 插件类型 */
  addon: AddonType;
  /** 自定义标题 */
  title?: string;
  /** 自定义描述 */
  description?: string;
  /** 是否显示特性列表 */
  showFeatures?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 试用状态接口
 */
export interface TrialStatus {
  /** 试用是否有效 */
  is_active: boolean;
  /** 试用开始时间 */
  trial_started_at?: string;
  /** 试用到期时间 */
  trial_expires_at?: string;
  /** 试用类型 */
  trial_type?: TrialType;
  /** 剩余小时数 */
  remaining_hours?: number;
  /** 激活码（如果是通过激活码试用） */
  activation_code?: string;
}

/**
 * 试用横幅组件属性
 */
export interface TrialBannerProps {
  /** 试用状态 */
  trialStatus: TrialStatus;
  /** 点击"立即购买"的回调 */
  onUpgrade?: () => void;
  /** 点击"稍后提醒"的回调 */
  onDismiss?: () => void;
  /** 自定义样式类名 */
  className?: string;
}

