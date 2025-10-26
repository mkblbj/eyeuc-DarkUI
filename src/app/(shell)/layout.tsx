"use client";
import "../../app/globals.css";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { useTranslation } from "react-i18next";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  // Web 版本：移除 Tauri 配置守卫逻辑

  // 兜底：每次路由切换时恢复 body 样式，交回全局 class 管理（overflow-hidden）
  React.useEffect(() => {
    try {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    } catch {}
  }, [pathname]);

  return (
    <div>
      <TopNav />
      {children}
    </div>
  );
}
