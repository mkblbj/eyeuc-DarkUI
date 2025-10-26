"use client";
import "./globals.css";
import "@/i18n"; // 初始化i18n
import { Titlebar } from "@/components/shell/Titlebar";
import { Toaster } from "sonner";
import { ContextMenuDisabler } from "@/components/ContextMenuDisabler";
import { useTranslation } from "react-i18next";
import { I18nProvider } from "@/components/I18nProvider";
import { UpdaterBootstrapper } from "@/components/UpdaterBootstrapper";
import { AddonProvider } from "@/contexts/AddonContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  // Web 版本：移除备份警告功能

  return (
    <html lang="zh" className="dark">
      <head>
        <title>Mods Locker</title>
        <meta name="description" content="Mods Locker for NBA 2K25" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />

        {/* Font Awesome Pro v7.0 */}
        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v7.0.0/css/all.css"
        />
        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v7.0.0/css/sharp-solid.css"
        />
        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v7.0.0/css/sharp-regular.css"
        />
        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v7.0.0/css/sharp-light.css"
        />
        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v7.0.0/css/duotone.css"
        />
      </head>
      <body className="h-screen bg-neutral-950/80 text-neutral-100 antialiased overflow-hidden">
        {/* 主应用内容 */}
        <div>
          <Titlebar />
          <Toaster
            position="top-right"
            richColors
            closeButton
            offset={56}
            toastOptions={{
              classNames: {
                toast: "toast-frosted",
                title: "toast-title",
                description: "toast-desc",
              },
            }}
          />
          <ContextMenuDisabler />
          <UpdaterBootstrapper />
          
          <I18nProvider>
            <AddonProvider>
              {children}
            </AddonProvider>
          </I18nProvider>
        </div>
      </body>
    </html>
  );
}
