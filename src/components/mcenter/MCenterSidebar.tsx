"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { BasketballLoader } from "@/components/ui/BasketballLoader";

const MCenterSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  const menuItems = [
    {
      id: "home",
      label: t("模组中心"),
      href: "/mcenter",
      icon: <i className="fa-light fa-house-heart fa-lg" />,
      color: "#3b82f6", // blue-500
    },
    {
      id: "overview",
      label: t("概览"),
      href: "/mcenter/overview",
      icon: <i className="fa-light fa-rocket-launch fa-lg" />,
      color: "#3b82f6", // blue-500
    },
    {
      id: "eyeuc",
      label: "EyeUC",
      href: "/mcenter/eyeuc",
      icon: <i className="fa-light fa-cloud-arrow-down fa-lg" />,
      color: "#22c55e", // green-500
    },
  ];

  const isActive = (href: string) => {
    if (href === "/mcenter") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleClick = (href: string) => {
    router.push(href);
  };

  // 监听 Font Awesome 加载完成
  useEffect(() => {
    let mounted = true;
    
    // 检查 Font Awesome 是否已加载
    const checkFontAwesome = () => {
      try {
        // 方法1: 检查全局 FontAwesome 对象
        if (typeof window !== 'undefined' && (window as any).FontAwesome) {
          return true;
        }
        
        // 方法2: 检查字体是否已加载
        const testElement = document.createElement('i');
        testElement.className = 'fa-light fa-house-heart';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        document.body.appendChild(testElement);
        
        const styles = window.getComputedStyle(testElement);
        const fontFamily = styles.fontFamily;
        const content = styles.getPropertyValue('content');
        
        document.body.removeChild(testElement);
        
        // 如果 font-family 包含 "Font Awesome" 或 content 不为 "none"，说明已加载
        if ((fontFamily && fontFamily.includes('Font Awesome')) || 
            (content && content !== 'none' && content !== '')) {
          return true;
        }
        
        return false;
      } catch (error) {
        console.warn('[MCenterSidebar] Font Awesome 检测失败:', error);
        return true; // 出错时假定已加载，避免永久卡在加载状态
      }
    };

    // 🔧 生产环境优化：使用更短的初始延迟，直接显示侧栏
    // Tauri 打包后字体通常已嵌入，不需要长时间等待
    const initialDelay = typeof window !== 'undefined' && '__TAURI__' in window ? 100 : 200;
    
    const initialTimer = setTimeout(() => {
      if (mounted) {
        setIsLoaded(true);
      }
    }, initialDelay);

    // 立即检查一次（如果已加载，取消延迟）
    if (checkFontAwesome()) {
      clearTimeout(initialTimer);
      if (mounted) setIsLoaded(true);
      return () => {
        mounted = false;
        clearTimeout(initialTimer);
      };
    }

    // 监听字体加载事件（作为补充检测）
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (mounted && checkFontAwesome()) {
          clearTimeout(initialTimer);
          setIsLoaded(true);
        }
      });
    }

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
    };
  }, []);

  // 如果未加载，显示加载动画
  if (!isLoaded) {
    return (
      <StyledWrapper>
        <div className="sidebar-loading">
          <BasketballLoader size="sm" />
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <ul className="sidebar-vertical">
        {menuItems.map((item) => (
          <li key={item.id} className="icon-content">
            <button
              onClick={() => handleClick(item.href)}
              aria-label={item.label}
              data-color={item.id}
              className={`link ${isActive(item.href) ? "active" : ""}`}
              style={{
                "--hover-color": item.color,
              } as React.CSSProperties}
            >
              {item.icon}
            </button>
            <div className="tooltip">{item.label}</div>
          </li>
        ))}
      </ul>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* 加载状态容器 */
  .sidebar-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
    border-radius: 20px;
    padding: 20px 12px;
    width: 56px;
    height: 140px;
  }

  .sidebar-vertical {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: bolder;
    background-color: #000;
    border-radius: 20px; /* 减小圆角 */
    padding: 12px 8px; /* 减小 padding */
    width: auto; /* 自动宽度 */
    height: auto;
  }

  .sidebar-vertical .icon-content {
    margin: 6px 0; /* 减小上下间距 */
    position: relative;
    font-weight: bolder;
  }

  .sidebar-vertical .icon-content .tooltip {
    position: absolute;
    top: 50%;
    left: 55px; /* 调整为更近的位置 */
    transform: translateY(-50%);
    background-color: #fff;
    color: #000;
    padding: 6px 10px;
    border-radius: 5px;
    opacity: 0;
    visibility: hidden;
    font-size: 14px;
    transition: all 0.3s ease;
    font-weight: bolder;
    white-space: nowrap;
    z-index: 10;
  }

  .sidebar-vertical .icon-content:hover .tooltip {
    opacity: 1;
    visibility: visible;
    left: 65px; /* hover 时向右移动 */
  }

  .sidebar-vertical .icon-content .link {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px; /* 缩小按钮尺寸 */
    height: 40px;
    border-radius: 50%;
    color: #fff;
    background-color: #000;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    font-weight: bolder;
  }

  .sidebar-vertical .icon-content .link:hover {
    box-shadow: 3px 2px 45px 0px rgb(0 0 0 / 12%);
    color: var(--hover-color);
  }

  .sidebar-vertical .icon-content .link.active {
    color: var(--hover-color);
    box-shadow: 0 0 20px var(--hover-color);
  }

  /* 允许 Font Awesome 类控制大小（如 fa-2xl）*/
`;

export default MCenterSidebar;

