/**
 * 模组中心 API 服务
 * 提供与 EyeUC 模组数据交互的接口
 */

import { getApiBaseUrl } from './config';

/**
 * 获取模组中心 API 基础路径
 */
function getMCenterApiBase(): string {
  // 浏览器端：一律走 Next API 代理，彻底规避 CORS/预检不稳定问题
  if (typeof window !== 'undefined') {
    return `/api/mcenter/eyeuc`;
  }
  // 服务端渲染/Node 环境：直连后端，少一跳且不受 CORS 约束
  const base = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) || getApiBaseUrl();
  return `${base}/mcenter/eyeuc`;
}

/**
 * 游戏信息
 */
export interface GameInfo {
  listId: number;
  game: string;
  slug: string | null;
  modsCount: number;
}

/**
 * 分类统计信息
 */
export interface CategoryStats {
  category: string;
  count: number;
}

/**
 * 模组列表项
 */
export interface ModListItem {
  mid: number;
  title: string;
  category: string | null;
  cover: string | null;
  author: string | null;
  downloads: number;
  views: number;
  likes: number;
  createdAt: string | null;
  lastUpdated: string | null;
}

/**
 * 模组列表响应
 */
export interface ModListResponse {
  total: number;
  page: number;
  size: number;
  items: ModListItem[];
}

/**
 * 模组图片
 */
export interface ModImage {
  url: string;
  index: number;
}

/**
 * 下载链接
 */
export interface DownloadLink {
  id: number;
  type: "internal" | "external" | "forum_redirect" | "empty" | "unknown";
  fileid: number | null;
  filename: string | null;
  size: string | null;
  url: string | null;
  note: string | null;
  versionLabel: string | null;
}

/**
 * 模组版本
 */
export interface ModVersion {
  versionId: number;
  vid: number | null;
  versionName: string | null;
  intro: string | null;
  isDefault: boolean;
  updatedAt: string | null;
  stats: {
    downloads: number;
    views: number;
  };
  downloads: DownloadLink[];
}

/**
 * 模组详情响应
 */
export interface ModDetailResponse {
  mid: number;
  listId: number;
  game: string | null;
  category: string | null;
  title: string;
  intro: string | null;
  cover: string | null;
  stats: {
    downloads: number;
    views: number;
    likes: number;
  };
  author: {
    name: string | null;
    url: string | null;
  };
  publisher: {
    name: string | null;
    url: string | null;
  };
  createdAt: string | null;
  lastUpdated: string | null;
  detailUrl: string | null;
  images: ModImage[];
  versions: ModVersion[];
}

/**
 * 下载直链响应
 */
export interface DownloadLinkResponse {
  success: boolean;
  fileid: number;
  filename: string | null;
  size: string | null;
  directUrl: string | null;
  expiresAt: string | null;
  message: string;
  error: string | null;
}

/**
 * 获取游戏列表
 */
export async function getGames(): Promise<GameInfo[]> {
  const response = await fetch(`${getMCenterApiBase()}/games`);
  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 获取分类统计
 */
export async function getCategories(
  listId: number,
  signal?: AbortSignal
): Promise<CategoryStats[]> {
  const response = await fetch(
    `${getMCenterApiBase()}/categories?list_id=${listId}`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 获取模组列表
 */
export async function getMods(
  params: {
    list_id?: number;
    category?: string;
    keyword?: string;
    sort?: string;
    page?: number;
    size?: number;
  },
  signal?: AbortSignal
): Promise<ModListResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const response = await fetch(`${getMCenterApiBase()}/mods?${query}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch mods: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 获取模组详情
 */
export async function getModDetail(mid: number): Promise<ModDetailResponse> {
  const response = await fetch(`${getMCenterApiBase()}/mods/${mid}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("模组不存在");
    }
    throw new Error(`Failed to fetch mod detail: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 生成下载直链
 */
export async function generateDownloadLink(
  fileid: number,
): Promise<DownloadLinkResponse> {
  const response = await fetch(`${getMCenterApiBase()}/download-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileid }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate download link: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 清空缓存（管理员功能）
 */
export async function clearCache(): Promise<{ message: string }> {
  const response = await fetch(`${getMCenterApiBase()}/cache/clear`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to clear cache: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 获取数据最后更新时间
 */
export async function getLastUpdateTime(): Promise<{
  lastUpdateTime: string | null;
  success: boolean;
}> {
  const response = await fetch(`${getMCenterApiBase()}/last-update-time`);
  if (!response.ok) {
    throw new Error(`Failed to fetch last update time: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<{
  status: string;
  service: string;
  cache_stats: {
    games_cached: boolean;
    categories_count: number;
    mods_list_count: number;
    mod_detail_count: number;
  };
}> {
  const response = await fetch(`${getMCenterApiBase()}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}

