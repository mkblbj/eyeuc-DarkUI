'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { GameInfo, ModListItem } from '@/lib/mcenterService';
import * as mcenterService from '@/lib/mcenterService';
import ModListRow from './ModListRow';
import { usePersistedPagination } from '@/lib/hooks/usePersistedPagination';

interface ModListViewProps {
  game: GameInfo;
  onModClick: (mod: ModListItem) => void;
}

interface Filters {
  searchQuery: string;
  category: string;
  sort: string;
  page: number;
  size: number;
}

const ModListView: React.FC<ModListViewProps> = ({ game, onModClick }) => {
  const { t } = useTranslation();
  
  // 状态管理
  const [mods, setMods] = useState<ModListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  
  // 使用持久化分页 Hook（按游戏 ID 独立存储）
  const [paginationState, updatePaginationState] = usePersistedPagination(
    game.listId,
    {
      page: 1,
      size: 20,
      category: 'all',
      searchQuery: '',
      sort: 'last_updated:desc',
    }
  );
  
  // 筛选状态（从持久化状态初始化）
  const [filters, setFilters] = useState<Filters>({
    searchQuery: paginationState.searchQuery || '',
    category: paginationState.category || 'all',
    sort: paginationState.sort || 'last_updated:desc',
    page: paginationState.page,
    size: paginationState.size,
  });

  // 追踪上一个游戏 ID，避免重复触发
  const previousGameId = React.useRef(game.listId);
  const isRestoringState = React.useRef(false);

  // 当游戏切换时，重置为默认状态（清空所有筛选）
  useEffect(() => {
    console.log('[ModListView] Game changed to:', game.listId, 'Previous:', previousGameId.current);
    
    if (previousGameId.current !== game.listId) {
      isRestoringState.current = true;
      
      // 重置为默认状态（清空搜索、分类、排序等）
      const defaultFilters = {
        searchQuery: '',
        category: 'all',
        sort: 'last_updated:desc',
        page: 1,
        size: 20,
      };
      
      console.log('[ModListView] Resetting to default filters:', defaultFilters);
      setFilters(defaultFilters);
      
      // 同时重置持久化状态
      updatePaginationState(defaultFilters);
      
      previousGameId.current = game.listId;
      
      // 恢复完成后重置标志
      setTimeout(() => {
        isRestoringState.current = false;
      }, 100);
    }
  }, [game.listId, updatePaginationState]);

  // 当 filters 变化时，同步到持久化状态（但跳过恢复期间）
  useEffect(() => {
    if (!isRestoringState.current) {
      updatePaginationState({
        page: filters.page,
        size: filters.size,
        category: filters.category,
        searchQuery: filters.searchQuery,
        sort: filters.sort,
      });
    }
  }, [filters]);

  // 加载分类
  useEffect(() => {
    const abortController = new AbortController();
    loadCategories(abortController.signal);
    return () => abortController.abort(); // 清理：取消未完成的请求
  }, [game.listId]);

  // 加载模组列表
  useEffect(() => {
    const abortController = new AbortController();
    loadMods(abortController.signal);
    return () => abortController.abort(); // 清理：取消未完成的请求
  }, [game.listId, filters.category, filters.sort, filters.page, filters.size]);

  // 搜索防抖（追踪搜索词变化，避免在恢复状态时触发）
  const previousSearchQuery = React.useRef(filters.searchQuery);

  useEffect(() => {
    // 如果正在恢复状态，不触发搜索
    if (isRestoringState.current) {
      previousSearchQuery.current = filters.searchQuery;
      return;
    }

    // 只有当搜索词真正变化时才触发防抖
    if (previousSearchQuery.current === filters.searchQuery) {
      return;
    }

    const oldQuery = previousSearchQuery.current;
    previousSearchQuery.current = filters.searchQuery;

    const timer = setTimeout(() => {
      // 再次检查搜索词是否真的变化了
      if (oldQuery !== filters.searchQuery) {
        if (filters.page === 1) {
          loadMods();
        } else {
          setFilters(prev => ({ ...prev, page: 1 }));
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // AbortController refs for cancelling requests
  const categoriesAbortController = React.useRef<AbortController | null>(null);
  const modsAbortController = React.useRef<AbortController | null>(null);

  const loadCategories = async (signal?: AbortSignal) => {
    try {
      const data = await mcenterService.getCategories(game.listId, signal);
      setCategories(data);
    } catch (error) {
      // 忽略已取消的请求错误
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to load categories:', error);
    }
  };

  const loadMods = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const params: any = {
        list_id: game.listId,
        page: filters.page,
        size: filters.size,
        sort: filters.sort,
      };

      if (filters.category !== 'all') {
        params.category = filters.category;
      }

      if (filters.searchQuery.trim()) {
        params.keyword = filters.searchQuery.trim();
      }

      const data = await mcenterService.getMods(params, signal);
      setMods(data.items);
      setTotal(data.total);
    } catch (error) {
      // 忽略已取消的请求错误
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to load mods:', error);
      setMods([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category, page: 1 }));
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleClearSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({ ...prev, size, page: 1 })); // 改变每页数量时重置到第一页
  };

  const totalPages = Math.ceil(total / filters.size);

  return (
    <StyledWrapper>
      {/* 标题与筛选栏合并为一行 */}
      <div className="header-and-filters">
        {/* 左侧标题区 */}
        <div className="list-header">
          <h2 className="list-title">{game.game} {t('模组列表')}</h2>
          <p className="list-subtitle">
            {t('共')} {total.toLocaleString()} {t('个模组')}
          </p>
        </div>

        {/* 右侧筛选栏 */}
        <div className="filters-bar">
          {/* 搜索框 */}
          <div className="search-box">
            <i className="fa-light fa-search search-icon" />
            <input
              type="text"
              placeholder={t('搜索模组...')}
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {filters.searchQuery && (
              <button onClick={handleClearSearch} className="clear-button">
                <i className="fa-light fa-times" />
              </button>
            )}
          </div>

          {/* 分类筛选 */}
          <div className="filter-group">
            <select
              value={filters.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('所有分类')}</option>
              {categories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* 排序 */}
          <div className="filter-group">
            <select
              value={filters.sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="downloads:desc">{t('下载量')}</option>
              <option value="views:desc">{t('浏览量')}</option>
              <option value="likes:desc">{t('点赞数')}</option>
              <option value="last_updated:desc">{t('最新更新')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 模组列表 */}
      <div className="mod-list">
        {loading ? (
          <div className="loading-state">
            <i className="fa-light fa-spinner-third fa-spin fa-2x" style={{ color: '#3b82f6' }} />
            <p>{t('加载中...')}</p>
          </div>
        ) : mods.length === 0 ? (
          <div className="empty-state">
            <i className="fa-light fa-folder-open fa-4x" />
            <h3>{t('未找到模组')}</h3>
            {filters.searchQuery && (
              <p>{t('尝试使用不同的关键词搜索')}</p>
            )}
          </div>
        ) : (
          <>
            <div className="mod-items">
              {mods.map((mod) => (
                <ModListRow
                  key={mod.mid}
                  mod={mod}
                  onModClick={onModClick}
                />
              ))}
            </div>

            {/* 分页控制器 */}
            <div className="pagination-wrapper">
              {/* 每页显示数量选择 */}
              <div className="page-size-selector">
                <span className="page-size-label">{t("每页显示")}</span>
                <select
                  value={filters.size}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="page-size-select"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="page-size-label">{t("条")}</span>
              </div>

              {/* 分页按钮 */}
              {totalPages > 1 && (
                <div className="pagination">
                  {/* 首页 */}
                  <button
                    className="page-button first-page"
                    disabled={filters.page === 1}
                    onClick={() => handlePageChange(1)}
                    title={t("首页")}
                  >
                    <i className="fa-light fa-angles-left" />
                  </button>

                  {/* 上一页 */}
                  <button
                    className="page-button"
                    disabled={filters.page === 1}
                    onClick={() => handlePageChange(filters.page - 1)}
                    title={t("上一页")}
                  >
                    <i className="fa-light fa-chevron-left" />
                  </button>

                  {/* 页码信息 */}
                  <div className="page-info">
                    <span className="current-page">{filters.page}</span>
                    <span className="page-separator">/</span>
                    <span className="total-pages">{totalPages}</span>
                  </div>

                  {/* 下一页 */}
                  <button
                    className="page-button"
                    disabled={filters.page === totalPages}
                    onClick={() => handlePageChange(filters.page + 1)}
                    title={t("下一页")}
                  >
                    <i className="fa-light fa-chevron-right" />
                  </button>

                  {/* 尾页 */}
                  <button
                    className="page-button last-page"
                    disabled={filters.page === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    title={t("尾页")}
                  >
                    <i className="fa-light fa-angles-right" />
                  </button>
                </div>
              )}

              {/* 总数信息 */}
              <div className="total-info">
                {t("共")} <span className="total-count">{total}</span> {t("个模组")}
              </div>
            </div>
          </>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  padding: 20px;

  /* 标题和筛选栏容器 - 一行显示 */
  .header-and-filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #2a2a2a;
    gap: 20px;
  }

  .list-header {
    flex-shrink: 0;
  }

  .list-title {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
  }

  .list-subtitle {
    font-size: 13px;
    color: #999;
    margin: 0;
    white-space: nowrap;
  }

  /* 筛选栏 - 右对齐 */
  .filters-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;
  }

  .search-box {
    position: relative;
    width: 280px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    font-size: 14px;
  }

  .search-input {
    width: 100%;
    padding: 10px 36px 10px 36px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: #333;
  }

  .search-input::placeholder {
    color: #666;
  }

  .clear-button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px 8px;
    transition: color 0.2s;
  }

  .clear-button:hover {
    color: #fff;
  }

  .filter-group {
    min-width: 140px;
  }

  .filter-select {
    width: 100%;
    padding: 10px 12px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .filter-select option {
    background: #2a2a2a;
    color: #fff;
  }

  /* 模组列表 */
  .mod-list {
    min-height: 300px;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #666;
  }

  .loading-state p {
    margin-top: 16px;
    font-size: 14px;
  }

  .empty-state i {
    color: #444;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 18px;
    color: #999;
    margin-bottom: 8px;
  }

  .empty-state p {
    font-size: 14px;
    color: #666;
  }

  .mod-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* 分页控制器 */
  .pagination-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #2a2a2a;
    gap: 16px;
    flex-wrap: wrap;
  }

  /* 每页显示数量选择器 */
  .page-size-selector {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .page-size-label {
    font-size: 14px;
    color: #999;
  }

  .page-size-select {
    padding: 6px 12px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 6px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    outline: none;
  }

  .page-size-select:hover {
    border-color: #3b82f6;
  }

  .page-size-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }

  /* 分页按钮 */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  /* 总数信息 */
  .total-info {
    font-size: 14px;
    color: #999;
  }

  .total-count {
    color: #3b82f6;
    font-weight: 600;
  }

  .page-button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .page-button:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #333;
  }

  .page-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #999;
  }

  .current-page {
    color: #fff;
    font-weight: 600;
  }

  .page-separator {
    color: #666;
  }
`;

export default ModListView;

