"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { DownloadLink } from "@/lib/mcenterService";
import { openExternal } from "@/lib/webOnly";
// import { generateDownloadLink } from "@/lib/mcenterService"; // 后续实现下载时启用

interface DownloadButtonProps {
  download: DownloadLink;
  onInternalDownload?: (fileid: number) => void;
}

export default function DownloadButton({ download }: DownloadButtonProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  // 判断按钮是否可用
  const isDisabled = download.type === 'empty' || download.type === 'unknown';
  
  // 获取显示文本
  const getLabel = () => {
    if (download.filename) return download.filename;
    if (download.note) return download.note;
    return t("下载文件");
  };
  
  // 获取辅助信息
  const getSubLabel = () => {
    const parts = [];
    if (download.size) parts.push(download.size);
    if (download.versionLabel) parts.push(download.versionLabel);
    return parts.join(' · ');
  };
  
  // 处理点击
  const handleClick = async () => {
    if (isDisabled) {
      toast.error(t("该文件不可下载"));
      return;
    }
    
    // External / Forum Redirect: 打开外部链接
    if ((download.type === 'external' || download.type === 'forum_redirect') && download.url) {
      setIsLoading(true);
      try {
        openExternal(download.url);
        toast.success(t("已在新标签页打开"));
      } catch (error) {
        console.error('Failed to open external link:', error);
        toast.error(t("打开链接失败"));
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Internal Download - Coming soon
    if (download.type === 'internal') {
      toast.info(t("下载功能即将推出"), { duration: 3000 });
      return;
    }
  };
  
  // Internal 类型暂时显示 Coming soon
  const isInternalComingSoon = download.type === 'internal';
  
  return (
    <StyledWrapper>
      <button 
        className={`button ${isDisabled ? 'disabled' : ''} ${download.type} ${isLoading ? 'loading' : ''} ${isInternalComingSoon ? 'coming-soon' : ''}`}
        onClick={handleClick}
        disabled={isDisabled || isLoading || isInternalComingSoon}
        type="button"
      >
        <span className="button__text">
          <span className="button__text-main">
            {isInternalComingSoon ? t("Coming soon") : getLabel()}
          </span>
          {!isInternalComingSoon && getSubLabel() && (
            <span className="button__text-sub">{getSubLabel()}</span>
          )}
          {isInternalComingSoon && (
            <span className="button__text-sub">
              {t("下载功能即将推出")}
            </span>
          )}
        </span>
        <span className="button__icon">
          {isLoading ? (
            <i className="fa-solid fa-spinner-third fa-spin" />
          ) : isInternalComingSoon ? (
            <i className="fa-solid fa-hourglass-half" />
          ) : download.type === 'internal' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" className="svg">
              <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z" />
              <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z" />
              <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z" />
            </svg>
          ) : (download.type === 'external' || download.type === 'forum_redirect') ? (
            <i className="fa-regular fa-up-right-from-square" />
          ) : (
            <i className="fa-solid fa-ban" />
          )}
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  
  .button {
    position: relative;
    width: 100%;
    min-height: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    overflow: hidden;
    border-radius: 8px;
    transition: all 0.3s;
    
    /* 黑色色调 - 所有类型统一样式 */
    &.internal,
    &.external,
    &.forum_redirect {
      border: 1px solid #333;
      background-color: #1a1a1a;
      
      .button__icon {
        background-color: #0a0a0a;
      }
      
      &:hover {
        background: #0a0a0a;
        border-color: #3b82f6;
        
        .button__icon {
          background-color: #000;
        }
      }
      
      &:active .button__icon {
        background-color: #000;
      }
      
      &:active {
        border: 1px solid #2563eb;
      }
    }
    
    &.disabled,
    &.empty,
    &.unknown {
      border: 1px solid #444;
      background-color: #555;
      cursor: not-allowed;
      opacity: 0.5;
      
      .button__icon {
        background-color: #444;
      }
      
      &:hover {
        background: #555;
      }
      
      .button__text {
        transform: translateX(12px);
      }
      
      .button__icon {
        transform: translateX(calc(100% - 50px));
      }
    }
    
    &.loading {
      cursor: wait;
    }
    
    &.coming-soon {
      border: 1px solid #6b7280;
      background-color: #1a1a1a;
      cursor: not-allowed;
      opacity: 0.6;
      
      .button__icon {
        background-color: #0a0a0a;
        color: #9ca3af;
      }
      
      .button__text-main {
        color: #9ca3af;
      }
      
      .button__text-sub {
        color: #6b7280;
        font-size: 10px;
      }
    }
    
    &:disabled {
      cursor: not-allowed;
    }
  }

  .button__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    transform: translateX(12px);
    color: #fff;
    transition: all 0.3s;
    flex: 1;
    min-width: 0;
    padding-right: 50px;
  }
  
  .button__text-main {
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .button__text-sub {
    font-size: 11px;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .button__icon {
    position: absolute;
    right: 0;
    top: 0;
    transform: translateX(calc(100% - 50px));
    height: 100%;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .button .svg {
    width: 20px;
    height: 20px;
    fill: #fff;
  }
  
  .button__icon i {
    font-size: 20px;
    color: #fff;
  }

  .button:not(.disabled):not(:disabled):hover .button__text {
    color: transparent;
  }

  .button:not(.disabled):not(:disabled):hover .button__icon {
    width: 100%;
    transform: translateX(0);
  }

`;
