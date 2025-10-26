"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ModVersion } from "@/lib/mcenterService";
import DownloadButton from "./DownloadButton";

interface VersionSelectorProps {
  versions: ModVersion[];
  selectedVersion: ModVersion | null;
  onSelectVersion: (version: ModVersion) => void;
}

export default function VersionSelector({ versions, selectedVersion, onSelectVersion }: VersionSelectorProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalVersion, setModalVersion] = useState<ModVersion | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // 客户端挂载标记
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 拦截Sheet中的链接点击，在新标签页打开
  useEffect(() => {
    if (!modalVersion) return;
    
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
      const descElement = document.querySelector('.sheet-description');
      if (descElement) {
        descElement.addEventListener('click', handleLinkClick as EventListener);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      const descElement = document.querySelector('.sheet-description');
      if (descElement) {
        descElement.removeEventListener('click', handleLinkClick as EventListener);
      }
    };
  }, [modalVersion]);
  
  // 默认版本（优先级：isDefault > 第一个）
  const defaultVersion = versions.find(v => v.isDefault) || versions[0];
  
  // 显示的版本列表
  const displayedVersions = isExpanded ? versions : [defaultVersion];
  
  // 截断描述（3行预览，约120字符）- 去除HTML标签
  const truncateDesc = (text: string, maxLength: number = 120) => {
    if (!text) return '';
    
    // 去除HTML标签
    const strippedText = text.replace(/<[^>]*>/g, '');
    
    // 截断文本
    if (strippedText.length <= maxLength) return strippedText;
    return strippedText.substring(0, maxLength) + '...';
  };
  
  return (
    <StyledWrapper>
      <h3 className="section-title">{t('版本选择')}</h3>
      
      <div className="versions-list">
        {displayedVersions.map((version) => (
          <div
            key={version.versionId}
            className={`version-item ${selectedVersion?.versionId === version.versionId ? 'selected' : ''}`}
            onClick={() => onSelectVersion(version)}
          >
            {/* 版本号 + 默认标签 */}
            <div className="version-header">
              <div className="version-radio">
                {selectedVersion?.versionId === version.versionId ? '●' : '○'}
              </div>
              <div className="version-name">
                {version.versionName || t('默认版本')}
                {version.isDefault && <span className="default-badge">[{t('默认')}]</span>}
              </div>
              {selectedVersion?.versionId === version.versionId && (
                <i className="fa-solid fa-check check-icon" />
              )}
            </div>
            
            {/* 更新日期 + 统计数据 */}
            <div className="version-meta">
              {version.updatedAt && (
                <span className="version-date">
                  <i className="fa-light fa-calendar" />
                  {new Date(version.updatedAt).toLocaleDateString()}
                </span>
              )}
              {version.stats && (
                <>
                  <span className="version-stat">
                    <i className="fa-solid fa-download" />
                    {version.stats.downloads.toLocaleString()}
                  </span>
                  <span className="version-stat">
                    <i className="fa-solid fa-eye" />
                    {version.stats.views.toLocaleString()}
                  </span>
                </>
              )}
            </div>
            
            {/* 描述预览（3行） */}
            {version.intro && (
              <div className="version-desc-preview">
                {truncateDesc(version.intro)}
              </div>
            )}
            
            {/* 查看详情按钮（统一显示） */}
            <button
              className="view-detail-button"
              onClick={(e) => {
                e.stopPropagation();
                setModalVersion(version);
              }}
            >
              {version.intro && version.intro.length > 120 
                ? t('查看完整更新说明') 
                : t('查看详情与下载')
              }
              <i className="fa-light fa-arrow-right" />
            </button>
          </div>
        ))}
      </div>
      
      {/* 展开/收起按钮 */}
      {versions.length > 1 && (
        <button
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              {t('收起版本列表')} <i className="fa-light fa-chevron-up" />
            </>
          ) : (
            <>
              {t('查看所有版本')} ({versions.length}{t('个')}) <i className="fa-light fa-chevron-down" />
            </>
          )}
        </button>
      )}
      
      {/* Sheet：完整版本描述 - 使用Portal渲染到body */}
      {mounted && modalVersion && createPortal(
        <StyledSheetPortal>
          <div className="sheet-overlay" onClick={() => setModalVersion(null)}>
            <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-header">
                <div className="header-left">
                  <h3>{modalVersion.versionName || t('版本说明')}</h3>
                  {modalVersion.isDefault && <span className="default-badge">[{t('默认')}]</span>}
                  {modalVersion.updatedAt && (
                    <span className="header-date">
                      · {new Date(modalVersion.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                  {/* 统计数据 - 移到标题栏 */}
                  {modalVersion.stats && (
                    <div className="header-stats">
                      <span>
                        <i className="fa-solid fa-download" />
                        {modalVersion.stats.downloads.toLocaleString()}
                      </span>
                      <span>
                        <i className="fa-solid fa-eye" />
                        {modalVersion.stats.views.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <button className="sheet-close" onClick={() => setModalVersion(null)}>
                  <i className="fa-light fa-times" />
                </button>
              </div>
              
              <div className="sheet-body">
                {/* 完整描述（支持HTML） */}
                <div 
                  className="sheet-description"
                  dangerouslySetInnerHTML={{ __html: modalVersion.intro || '' }}
                />
                
                {/* Sheet 中的下载按钮 */}
                {modalVersion.downloads && modalVersion.downloads.length > 0 && (
                  <div className="sheet-downloads">
                    <h4 className="sheet-download-title">
                      <i className="fa-solid fa-download" />
                      {t('下载文件')}
                    </h4>
                    <div className="sheet-download-list">
                      {modalVersion.downloads.map((download, index) => (
                        <DownloadButton key={index} download={download} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </StyledSheetPortal>,
        document.body
      )}
    </StyledWrapper>
  );
}

const StyledSheetPortal = styled.div`
  /* Sheet（从右侧滑出） - Portal渲染到body */
  .sheet-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 999999;
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease;
  }
  
  .sheet-content {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 90%;
    max-width: 900px;
    background: #1a1a1a;
    border-left: 1px solid #3b82f6;
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
    animation: slideInRight 0.3s ease;
    z-index: 1000000;
    
    @media (max-width: 768px) {
      width: 100%;
      max-width: 100%;
    }
  }
  
  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    border-bottom: 1px solid #2a2a2a;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);
    gap: 16px;
  }
  
  .header-left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    min-width: 0;
    
    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      
      &::before {
        content: '';
        width: 4px;
        height: 24px;
        background: #3b82f6;
        border-radius: 2px;
        flex-shrink: 0;
      }
    }
    
    .default-badge {
      font-size: 12px;
      color: #3b82f6;
      font-weight: 500;
      padding: 2px 8px;
      background: rgba(59, 130, 246, 0.15);
      border-radius: 4px;
      flex-shrink: 0;
    }
    
    .header-date {
      font-size: 14px;
      color: #888;
      flex-shrink: 0;
    }
  }
  
  .header-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: 8px;
    
    span {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #aaa;
      
      i {
        font-size: 14px;
        color: #3b82f6;
      }
    }
  }
  
  .sheet-close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #444;
    color: #999;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 16px;
    }
    
    &:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      color: #ef4444;
      transform: rotate(90deg);
    }
  }
  
  .sheet-body {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
    
    /* 自定义滚动条 */
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #3b82f6;
      border-radius: 4px;
      
      &:hover {
        background: #60a5fa;
      }
    }
  }
  
  .sheet-description {
    color: #ccc;
    line-height: 1.8;
    font-size: 15px;
    margin-bottom: 24px;
    
    p {
      margin-bottom: 16px;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #fff;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    
    ul, ol {
      margin-left: 20px;
      margin-bottom: 16px;
    }
    
    li {
      margin-bottom: 8px;
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
      margin: 16px 0;
      border: 1px solid #2a2a2a;
    }
    
    code {
      background: rgba(59, 130, 246, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 14px;
      color: #60a5fa;
    }
    
    pre {
      background: #0a0a0a;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid #2a2a2a;
      
      code {
        background: none;
        padding: 0;
      }
    }
  }
  
  /* Sheet 中的下载区域 */
  .sheet-downloads {
    margin-top: 32px;
    padding: 24px;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 12px;
  }
  
  .sheet-download-title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    i {
      font-size: 18px;
      color: #3b82f6;
    }
  }
  
  .sheet-download-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const StyledWrapper = styled.div`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16px;
  }
  
  .versions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 12px;
  }
  
  .version-item {
    padding: 12px;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: rgba(59, 130, 246, 0.4);
      background: rgba(59, 130, 246, 0.1);
    }
    
    &.selected {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.15);
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
    }
  }
  
  .version-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  
  .version-radio {
    font-size: 18px;
    color: #3b82f6;
  }
  
  .version-name {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .default-badge {
    font-size: 11px;
    color: #3b82f6;
    font-weight: 500;
  }
  
  .check-icon {
    color: #3b82f6;
    font-size: 14px;
  }
  
  /* 版本元信息（日期 + 统计数据） */
  .version-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    margin-left: 26px;
    flex-wrap: wrap;
  }
  
  .version-date {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #888;
    
    i {
      font-size: 12px;
    }
  }
  
  .version-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #aaa;
    
    i {
      font-size: 12px;
      color: #3b82f6;
    }
  }
  
  .version-desc-preview {
    font-size: 12px;
    color: #aaa;
    line-height: 1.5;
    margin-left: 26px;
    margin-bottom: 8px;
  }
  
  .view-detail-button {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #3b82f6;
    background: transparent;
    border: none;
    cursor: pointer;
    margin-left: 26px;
    padding: 4px 0;
    transition: color 0.3s ease;
    
    &:hover {
      color: #60a5fa;
    }
  }
  
  .expand-button {
    width: 100%;
    padding: 10px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #3b82f6;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
    }
  }
`;
