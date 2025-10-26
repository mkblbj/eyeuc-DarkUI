"use client";
import React from "react";
import MCenterSidebar from "@/components/mcenter/MCenterSidebar";

export default function MCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* 左侧侧边栏 - 垂直居中 */}
      <div className="flex items-center justify-center fixed left-4 top-1/2 -translate-y-1/2 z-10">
        <MCenterSidebar />
      </div>
      
      {/* 主内容区 - 减小左边距 */}
      <div className="flex-1 pl-16">
        {children}
      </div>
    </div>
  );
}

