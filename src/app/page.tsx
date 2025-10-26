"use client";

import { useEffect, useState } from "react";
import { SimpleLicenseStatus } from '@/components/license/SimpleLicenseStatus';
import { ModernLanguagePicker } from '@/components/ui/modern-language-picker';
import { CyberpunkButton } from '@/components/ui/cyberpunk-button';
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t, i18n } = useTranslation();
  const [status] = useState<string>("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setMounted(true);
    }
  }, [i18n.isInitialized]);

  // Web 版本：移除 Tauri 依赖的功能
  // addByDialog 与窗口控制逻辑已移除

  // 拖拽功能暂时下线（保留"选择文件夹添加"入口）

  // Prevent hydration mismatch by not rendering until i18n is ready
  if (!mounted) {
    // 提供一个最小的加载状态，但不要阻止渲染太久
    return null;
  }

  return (
    <div className="h-[calc(100vh-44px)] m-2">
      <main className="relative h-full overflow-hidden rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 vignette" />

      <div className="relative h-full">
        <div className="p-8 md:p-12 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            {t("Mods 管理器(WEB版)")}
          </div>
          <SimpleLicenseStatus />
        </div>

        <h1
          className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight"
          style={{ fontFamily: "Bebas Neue, system-ui, sans-serif" }}
        >
          <span className="bg-gradient-to-r from-red-500 via-orange-400 to-red-600 bg-clip-text text-transparent">
            Mods Locker
          </span>
        </h1>
        <p className="mt-3 text-neutral-300 max-w-prose welcome-text">
          {t("欢迎使用 Mods Locker（WEB版）")}
        </p>


        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* <CyberpunkButton 
            variant="neon" 
            size="lg" 
            asChild 
            className="w-full"
          >
            <a href="/mods">
              <i className="fa-regular fa-shelves fa-lg mr-2" />
              {t("Mods 库")}
            </a>
          </CyberpunkButton>

          <CyberpunkButton 
            variant="neon" 
            size="lg" 
            asChild 
            className="w-full"
          >
            <a href="/manage">
              <i className="fa-regular fa-gamepad-modern fa-lg mr-2" />
              {t("Mods 管理")}
            </a>
          </CyberpunkButton> */}

          <CyberpunkButton 
            variant="neon" 
            size="lg" 
            asChild 
            className="w-full"
          >
            <a href="/mcenter">
              <i className="fa-regular fa-shop-24 fa-lg mr-2" />
              {t("模组中心")}
            </a>
          </CyberpunkButton>

          {/* <CyberpunkButton 
            variant="neon" 
            size="lg" 
            asChild 
            className="w-full"
          >
            <a href="/lists">
              <i className="fa-regular fa-list-radio fa-lg mr-2" />
              {t("清单")}
            </a>
          </CyberpunkButton>
          
          <CyberpunkButton 
            variant="neon" 
            size="lg" 
            asChild 
            className="w-full"
          >
            <a href="/store">
              <i className="fa-regular fa-puzzle-piece fa-lg mr-2" />
              {t("插件")}
            </a>
          </CyberpunkButton>

          <CyberpunkButton 
            variant="neon" 
            size="lg" 
            asChild 
            className="w-full"
          >
            <a href="/profiles">
              <i className="fa-regular fa-users fa-lg mr-2" />
              {t("配置集")}
            </a>
          </CyberpunkButton>

          <CyberpunkButton 
            variant="neon" 
            size="lg" 
            asChild 
            className="w-full"
          >
            <a href="/settings">
              <i className="fa-regular fa-screwdriver-wrench fa-lg mr-2" />
              {t("设置")}
            </a>
          </CyberpunkButton>

          <CyberpunkButton 
            variant="neon" 
            size="lg" 
            asChild 
            className="w-full"
          >
            <a href="/modium">
              <i className="fa-regular fa-rectangle-beta fa-lg mr-2" />
              {t("Modium 集成(测试)")}
            </a>
          </CyberpunkButton> */}
        </div>

        {/* 语言选择器 */}
        <div className="mt-8 flex justify-center">
          <ModernLanguagePicker />
        </div>
        </div>
      </div>
      </main>
    </div>
  );
}
