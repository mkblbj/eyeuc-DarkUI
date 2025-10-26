"use client";
import { useTranslation } from "react-i18next";
import BracketsIcon from "@/components/icons/brackets";

export default function ModCenterOverviewPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      {/* 页面头部 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BracketsIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">{t("模组中心概览")}</h1>
        </div>
        <p className="text-neutral-400">{t("统计与数据分析")}</p>
      </div>

      {/* 占位内容 */}
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <i className="fa-regular fa-chart-line text-6xl text-neutral-600 mb-4" />
          <p className="text-xl text-neutral-400">
            {t("概览页面即将推出")}
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            {t("将展示模组统计、趋势分析等内容")}
          </p>
        </div>
      </div>
    </div>
  );
}

