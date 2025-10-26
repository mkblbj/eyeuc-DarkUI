import type { NextConfig } from "next";

// 检测是否为生产构建
const isBuild =
  process.env.npm_lifecycle_event === "build:web" ||
  process.env.npm_lifecycle_event === "build" ||
  process.env.NEXT_BUILD === "true";

const config: NextConfig = {
  // Web 版本：使用服务器渲染，无需静态导出
  output: 'standalone', // Docker 部署优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.eyeassets.com',
      },
    ],
  },
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
    // 生产构建自动移除 console.log/debug/info/warn
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error'] } 
      : false,
  },
  experimental: {
    optimizePackageImports: ["ahooks"],
  },
  // 确保i18n资源文件被正确包含在构建中
  webpack: (config, { isServer }) => {
    // 确保JSON翻译文件被正确处理
    config.module.rules.push({
      test: /\.json$/,
      include: /src\/i18n\/locales/,
      type: 'json',
      parser: {
        parse: JSON.parse,
      },
    });
    
    return config;
  },
};

export default config;
