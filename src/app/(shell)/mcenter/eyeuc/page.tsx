"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import GameBrowserTabs from "@/components/mcenter/GameBrowserTabs";
import { GameInfo, getLastUpdateTime } from "@/lib/mcenterService";

export default function EyeUCHomePage() {
  const { t } = useTranslation();
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  const handleGameSelect = (game: GameInfo) => {
    setSelectedGame(game);
    console.log('Selected game:', game);
  };

  // 加载最后更新时间
  useEffect(() => {
    const fetchLastUpdateTime = async () => {
      try {
        const response = await getLastUpdateTime();
        if (response.success && response.lastUpdateTime) {
          setLastUpdateTime(response.lastUpdateTime);
        }
      } catch (error) {
        console.error("获取最后更新时间失败:", error);
      }
    };

    fetchLastUpdateTime();
  }, []);

  // 格式化为相对时间
  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSeconds < 60) {
        return t("刚刚");
      } else if (diffMinutes < 60) {
        return `${diffMinutes}${t("分钟前")}`;
      } else if (diffHours < 24) {
        return `${diffHours}${t("小时前")}`;
      } else if (diffDays < 7) {
        return `${diffDays}${t("天前")}`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks}${t("周前")}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months}${t("个月前")}`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years}${t("年前")}`;
      }
    } catch {
      return dateStr;
    }
  };

  // Web 版本：直接显示内容，无需插件验证
  return (
    <div className="p-8">
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <i className="fa-light fa-gamepad-modern text-xl" style={{ color: '#3b82f6' }} />
          <h1 className="text-xl font-semibold" suppressHydrationWarning>EyeUC {t("模组中心")}</h1>
          {lastUpdateTime && (
            <span className="text-sm text-muted-foreground ml-4" suppressHydrationWarning>
              {t("数据更新于")} {formatRelativeTime(lastUpdateTime)}
            </span>
          )}
        </div>
      </div>

      {/* 游戏浏览器标签页 */}
      <GameBrowserTabs onGameSelect={handleGameSelect} />
    </div>
  );
}

