'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ModListItem } from '@/lib/mcenterService';

interface ModListRowProps {
  mod: ModListItem;
  onModClick: (mod: ModListItem) => void;
}

const ModListRow: React.FC<ModListRowProps> = ({ mod, onModClick }) => {
  const { t } = useTranslation();
  const [isHovering, setIsHovering] = useState(false);

  // 格式化绝对时间（支持到分钟）
  const formatDateTime = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <StyledWrapper onClick={() => onModClick(mod)}>
      {/* 封面 */}
      <div 
        className="mod-cover"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {mod.cover ? (
          <>
            <img 
              src={mod.cover} 
              alt={mod.title} 
              className="cover-thumbnail"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // 图片加载失败时显示占位符
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                if (placeholder && placeholder.classList.contains('cover-placeholder-fallback')) {
                  placeholder.style.display = 'flex';
                }
              }}
            />
            <div className="cover-placeholder-fallback" style={{ display: 'none' }}>
              <span>{mod.title[0]?.toUpperCase() || 'M'}</span>
            </div>
            {/* 悬停显示大图 */}
            {isHovering && (
              <div className="cover-preview">
                <img 
                  src={mod.cover} 
                  alt={mod.title}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </>
        ) : (
          <div className="cover-placeholder">
            <span>{mod.title[0]?.toUpperCase() || 'M'}</span>
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="mod-info">
        <div className="mod-title-row">
          <h3 className="mod-title">{mod.title}</h3>
          {mod.category && (
            <span className="mod-category">{mod.category}</span>
          )}
        </div>
        
        {mod.author && (
          <div className="mod-author">
            <i className="fa-light fa-user" />
            <span>{mod.author}</span>
          </div>
        )}

        <div className="mod-stats">
          <span className="stat-item">
            <i className="fa-solid fa-download" />
            {mod.downloads.toLocaleString()}
          </span>
          <span className="stat-item">
            <i className="fa-solid fa-eye" />
            {mod.views.toLocaleString()}
          </span>
          <span className="stat-item">
            <i className="fa-solid fa-heart" />
            {mod.likes}
          </span>
          {mod.lastUpdated && (
            <span className="stat-item">
              <i className="fa-light fa-clock" />
              {formatDateTime(mod.lastUpdated)}
            </span>
          )}
        </div>
      </div>

      {/* 查看按钮 */}
      <div className="mod-action">
        <button className="view-button">
          <i className="fa-light fa-arrow-right" />
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #444;
  border: 1px solid #555;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4a4a4a;
    border-color: #3b82f6;
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  /* 封面 */
  .mod-cover {
    position: relative;
    width: 120px;
    height: 90px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: visible; /* 改为 visible 以显示悬停预览 */
  }

  .cover-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #3a3a3a;
  }

  /* 封面悬停预览 */
  .cover-preview {
    position: absolute;
    top: 0;
    left: 130px; /* 在缩略图右侧显示 */
    width: 400px;
    height: 300px;
    z-index: 1000;
    background: #1a1a1a;
    border: 2px solid #3b82f6;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
    overflow: hidden;
    animation: fadeIn 0.2s ease;
    pointer-events: none; /* 防止遮挡鼠标事件 */
  }

  .cover-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #0a0a0a;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .cover-placeholder,
  .cover-placeholder-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    font-size: 28px;
    font-weight: 700;
    color: rgba(59, 130, 246, 0.5);
    position: relative;
    overflow: hidden;
  }

  .cover-placeholder::before,
  .cover-placeholder-fallback::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
  }

  /* 信息区 */
  .mod-info {
    flex: 1;
    min-width: 0;
  }

  .mod-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .mod-title {
    font-size: 17px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mod-category {
    padding: 3px 10px;
    background: rgba(59, 130, 246, 0.25);
    border: 1px solid rgba(59, 130, 246, 0.5);
    border-radius: 6px;
    font-size: 13px;
    color: #93c5fd;
    font-weight: 500;
    white-space: nowrap;
  }

  .mod-author {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #ccc;
    margin-bottom: 8px;
  }

  .mod-author i {
    font-size: 13px;
    color: #aaa;
  }

  .mod-stats {
    display: flex;
    gap: 20px;
    font-size: 14px;
    color: #bbb;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stat-item i {
    font-size: 13px;
    color: #999;
  }

  /* 操作按钮 */
  .mod-action {
    flex-shrink: 0;
  }

  .view-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #3b82f6;
    cursor: pointer;
    transition: all 0.2s;
  }

  .view-button:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
    transform: translateX(4px);
  }
`;

export default ModListRow;

