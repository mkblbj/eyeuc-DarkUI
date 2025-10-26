"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useModDetail } from "@/lib/hooks/useModDetail";
import { ModVersion } from "@/lib/mcenterService";
import ImageGallery from "./ImageGallery";
import VersionSelector from "./VersionSelector";

interface ModDetailViewProps {
  mid: number;
  onBack: () => void;
}

export default function ModDetailView({ mid, onBack }: ModDetailViewProps) {
  const { t } = useTranslation();
  const { mod, loading, error } = useModDetail(mid);
  
  // 状态管理
  const [selectedVersion, setSelectedVersion] = useState<ModVersion | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // 自动选择默认版本
  useEffect(() => {
    if (mod && mod.versions.length > 0 && !selectedVersion) {
      const defaultVersion = mod.versions.find(v => v.isDefault) || mod.versions[0];
      setSelectedVersion(defaultVersion);
      console.log('Auto-selected default version:', defaultVersion.versionName || 'Unnamed');
    }
  }, [mod, selectedVersion]);
  
  // 拦截模组描述中的链接点击，在新标签页打开
  useEffect(() => {
    if (!mod) return;
    
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        e.preventDefault();
        e.stopPropagation();
        
        // 使用 Web 原生方式打开链接
        import('@/lib/webOnly').then(({ openExternal }) => {
          openExternal(link.href);
        }).catch((err) => {
          console.error('Failed to open link:', err);
        });
      }
    };
    
    // 短暂延迟后添加事件监听（等待DOM渲染）
    const timer = setTimeout(() => {
      const descElement = document.querySelector('.description-content');
      if (descElement) {
        descElement.addEventListener('click', handleLinkClick as EventListener);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      const descElement = document.querySelector('.description-content');
      if (descElement) {
        descElement.removeEventListener('click', handleLinkClick as EventListener);
      }
    };
  }, [mod, isDescExpanded]);
  
  // 加载状态
  if (loading) {
    return (
      <StyledWrapper>
        <div className="loading-container">
          <i className="fa-light fa-spinner-third fa-spin fa-3x" style={{ color: '#3b82f6' }} />
          <p>{t('加载中...')}</p>
        </div>
      </StyledWrapper>
    );
  }
  
  // 错误状态
  if (error || !mod) {
    return (
      <StyledWrapper>
        <div className="error-container">
          <i className="fa-light fa-exclamation-triangle fa-3x" />
          <h3>{t('加载失败')}</h3>
          <p>{error?.message || t('未知错误')}</p>
          <button onClick={onBack} className="back-button">
            {t('返回列表')}
          </button>
        </div>
      </StyledWrapper>
    );
  }
  
  // 描述文本处理
  const shouldTruncateDesc = mod.intro && mod.intro.length > 300;
  const displayedDesc = shouldTruncateDesc && !isDescExpanded 
    ? (mod.intro?.substring(0, 300) || '') + '...'
    : (mod.intro || '');
  
  return (
    <StyledWrapper>
      {/* 返回按钮 */}
      <button onClick={onBack} className="back-button-top">
        <i className="fa-light fa-arrow-left" />
        {t('返回列表')}
      </button>
      
      {/* 主内容区：左右分栏 */}
      <div className="detail-container">
        {/* 左侧：图集 + 描述 */}
        <div className="left-content">
          {/* 图片轮播 */}
          <ImageGallery 
            images={mod.images} 
            cover={mod.cover}
            title={mod.title}
          />
          
          {/* 模组描述 */}
          {mod.intro && (
            <div className="description-section">
              <h3 className="section-title">{t('模组介绍')}</h3>
              <div 
                className="description-content"
                dangerouslySetInnerHTML={{ __html: displayedDesc }}
              />
              {shouldTruncateDesc && (
                <button 
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="expand-button"
                >
                  {isDescExpanded ? (
                    <>
                      <i className="fa-light fa-chevron-up" />
                      {t('收起')}
                    </>
                  ) : (
                    <>
                      <i className="fa-light fa-chevron-down" />
                      {t('展开全文')}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* 右侧：信息 + 操作 */}
        <div className="right-sidebar">
          {/* 基本信息卡片 */}
          <div className="info-card">
            <h3 className="card-title">{t('模组信息')}</h3>
            
            {/* 统计数据（横向3列） */}
            <div className="stats-grid">
              <div className="stat-item">
                <i className="fa-solid fa-download" />
                <span className="stat-label">{t('下载')}</span>
                <span className="stat-value">{mod.stats.downloads.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <i className="fa-solid fa-eye" />
                <span className="stat-label">{t('浏览')}</span>
                <span className="stat-value">{mod.stats.views.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <i className="fa-solid fa-heart" />
                <span className="stat-label">{t('喜欢')}</span>
                <span className="stat-value">{mod.stats.likes}</span>
              </div>
            </div>
            
            {/* 作者和发布者信息（两列布局） */}
            <div className="info-row-double">
              {/* 左侧：作者 */}
              <div className="info-col">
                <div className="info-label">
                  <i className="fa-solid fa-user" />
                  {t('作者')}
                </div>
                {mod.author?.name ? (
                  <a 
                    href={mod.author.url || '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-link"
                    title={mod.author.name}
                  >
                    {mod.author.name}
                    <i className="fa-light fa-external-link" />
                  </a>
                ) : (
                  <span className="info-value">-</span>
                )}
              </div>
              
              {/* 右侧：发布者 */}
              <div className="info-col">
                <div className="info-label">
                  <i className="fa-solid fa-upload" />
                  {t('发布者')}
                </div>
                {mod.publisher?.name ? (
                  <a 
                    href={mod.publisher.url || '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-link"
                    title={mod.publisher.name}
                  >
                    {mod.publisher.name}
                    <i className="fa-light fa-external-link" />
                  </a>
                ) : (
                  <span className="info-value">-</span>
                )}
              </div>
            </div>
            
            {/* 最后更新 + 查看原网站（同行） */}
            <div className="info-row-combined">
              {mod.lastUpdated && (
                <div className="info-item">
                  <div className="info-label">
                    <i className="fa-light fa-clock" />
                    {t('最后更新')}
                  </div>
                  <div className="info-value">
                    {new Date(mod.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              {mod.detailUrl && (
                <a 
                  href={mod.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-original-link"
                >
                  <i className="fa-light fa-external-link" />
                  {t('查看原网站')}
                </a>
              )}
            </div>
          </div>
          
          {/* 版本选择器 */}
          <VersionSelector
            versions={mod.versions}
            selectedVersion={selectedVersion}
            onSelectVersion={setSelectedVersion}
          />
          
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  padding: 20px;
  
  /* 返回按钮 */
  .back-button-top {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #444;
    border-radius: 8px;
    color: #999;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 20px;
    
    &:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
    }
    
    i {
      font-size: 14px;
    }
  }
  
  /* 主容器：左右分栏（3:2 比例 - 60% : 40%） */
  .detail-container {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 24px;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
  
  /* 左侧内容区 */
  .left-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }
  
  /* 描述区域 */
  .description-section {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 20px;
  }
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:before {
      content: '';
      width: 4px;
      height: 18px;
      background: #3b82f6;
      border-radius: 2px;
    }
  }
  
  .description-content {
    color: #ccc;
    line-height: 1.8;
    font-size: 14px;
    
    /* HTML 内容样式 */
    p {
      margin-bottom: 12px;
    }
    
    a {
      color: #3b82f6;
      text-decoration: underline;
      
      &:hover {
        color: #60a5fa;
      }
    }
    
    img {
      max-width: 100%;
      border-radius: 8px;
      margin: 12px 0;
    }
    
    ul, ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    li {
      margin-bottom: 6px;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #fff;
      margin: 16px 0 8px 0;
    }
    
    blockquote {
      border-left: 3px solid #3b82f6;
      padding-left: 12px;
      margin: 12px 0;
      color: #999;
    }
    
    code {
      background: #2a2a2a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
    }
    
    pre {
      background: #2a2a2a;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
      
      code {
        background: none;
        padding: 0;
      }
    }
  }
  
  .expand-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    margin-top: 16px;
    padding: 10px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #3b82f6;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
    }
    
    i {
      font-size: 12px;
    }
  }
  
  /* 右侧边栏 */
  .right-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
    max-width: 100%;
    
    /* 固定滚动（桌面端） */
    @media (min-width: 1024px) {
      position: sticky;
      top: 20px;
      align-self: flex-start;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      
      /* 自定义滚动条 */
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 3px;
        
        &:hover {
          background: #555;
        }
      }
    }
  }
  
  /* 信息卡片 */
  .info-card {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 20px;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16px;
  }
  
  /* 统计网格（精简版） */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #2a2a2a;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 6px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.25);
    }
    
    i {
      font-size: 16px;
      color: #3b82f6;
    }
    
    .stat-label {
      font-size: 10px;
      color: #888;
    }
    
    .stat-value {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }
  }
  
  /* 信息行格式（精简版） */
  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 12px;
    border-bottom: 1px solid #2a2a2a;
    
    .info-label {
      color: #888;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      
      i {
        font-size: 14px;
        color: #666;
      }
    }
    
    .info-value {
      color: #ccc;
      font-weight: 500;
    }
    
    .info-link {
      color: #3b82f6;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.3s ease;
      
      &:hover {
        color: #60a5fa;
      }
      
      i {
        font-size: 10px;
      }
    }
  }
  
  /* 双列信息行（作者和发布者） */
  .info-row-double {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #2a2a2a;
    
    .info-col {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      
      .info-label {
        color: #888;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        flex-shrink: 0;
        
        i {
          font-size: 14px;
          color: #666;
        }
      }
      
      .info-link {
        color: #3b82f6;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        transition: color 0.3s ease;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
        
        &:hover {
          color: #60a5fa;
        }
        
        i {
          font-size: 10px;
          flex-shrink: 0;
        }
      }
      
      .info-value {
        color: #666;
        font-size: 12px;
      }
    }
  }
  
  /* 组合信息行（更新时间 + 原网站按钮） */
  .info-row-combined {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0 0 0;
    border-top: 1px solid #2a2a2a;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      
      .info-label {
        color: #888;
        display: flex;
        align-items: center;
        gap: 6px;
        
        i {
          font-size: 14px;
          color: #666;
        }
      }
      
      .info-value {
        color: #ccc;
        font-weight: 500;
      }
    }
    
    .view-original-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: transparent;
      border: 1px solid #444;
      border-radius: 6px;
      color: #ccc;
      font-size: 12px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      
      &:hover {
        border-color: #3b82f6;
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }
      
      i {
        font-size: 11px;
      }
    }
  }
  
  /* 加载状态 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;
    
    p {
      color: #999;
      font-size: 14px;
    }
  }
  
  /* 错误状态 */
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;
    
    i {
      color: #ef4444;
    }
    
    h3 {
      color: #fff;
      font-size: 20px;
      margin: 0;
    }
    
    p {
      color: #999;
      font-size: 14px;
      margin: 0;
    }
    
    .back-button {
      margin-top: 16px;
      padding: 10px 20px;
      background: #3b82f6;
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.3s ease;
      
      &:hover {
        background: #2563eb;
      }
    }
  }
`;

