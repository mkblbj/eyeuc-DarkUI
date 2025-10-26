# MCenter - 模组中心前端

> 🎮 基于 Next.js 14 的现代化游戏模组浏览器 | Modern Game Mod Browser

## ✨ 特性

- 🚀 **现代化技术栈**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- 🌐 **国际化支持**: 中文 / English / 日本語
- 📱 **响应式设计**: 完美适配桌面端与移动端
- ⚡ **高性能**: 服务端渲染 (SSR) + 代理优化，彻底规避 CORS
- 🎨 **精美 UI**: Styled Components + 现代化动画
- 🔍 **强大搜索**: 支持关键词搜索、分类筛选、多维度排序

## 📦 目录结构

```
src/
├── app/(shell)/mcenter/          # 模组中心页面
│   ├── layout.tsx                # 布局（侧边栏）
│   ├── page.tsx                  # 首页
│   ├── overview/                 # 概览页（待实现）
│   └── eyeuc/                    # EyeUC 模组浏览器
├── components/mcenter/           # 模组中心组件
│   ├── MCenterSidebar.tsx        # 侧边栏导航
│   ├── GameBrowserTabs.tsx       # 游戏选择标签页
│   ├── ModListView.tsx           # 模组列表视图
│   └── ModDetailView.tsx         # 模组详情视图
├── lib/
│   ├── mcenterService.ts         # 模组中心 API 服务
│   ├── config.ts                 # 配置管理
│   └── hooks/
│       └── usePersistedPagination.ts  # 分页状态持久化
├── pages/api/mcenter/eyeuc/      # Next.js API 代理（规避 CORS）
│   └── [...path].ts
└── i18n/locales/                 # 国际化翻译文件
    ├── zh/mcenter.json
    ├── en/mcenter.json
    └── ja/mcenter.json
```

## 🚀 快速开始

### 环境要求

- Node.js 20+
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000/mcenter/eyeuc`

### 生产构建

```bash
npm run build
npm start
```

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
# 后端 API 地址（可选，默认 http://127.0.0.1:12481）
NEXT_PUBLIC_API_BASE_URL=http://your-backend-api:12481

# 启用 API 代理（推荐，规避 CORS）
NEXT_PUBLIC_USE_API_PROXY=1

# Docker 部署时：容器内网地址（前端 SSR 直连后端）
BACKEND_INTERNAL_BASE_URL=http://backend:port
```

### API 代理说明

项目内置 Next.js API 路由代理 (`/api/mcenter/eyeuc/*`)，将浏览器请求转发到后端：

- **浏览器端**: 请求 `/api/mcenter/eyeuc/games` → 同源，无 CORS 问题
- **服务端**: Next.js 代理转发到 `BACKEND_INTERNAL_BASE_URL` 或 `NEXT_PUBLIC_API_BASE_URL`

这种架构：
- ✅ 彻底规避浏览器跨域问题
- ✅ 减少网络跳转，提升稳定性
- ✅ 支持容器内网直连（Docker 部署）

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t mcenter-frontend -f Dockerfile.frontend .

# 运行容器
docker run -d \
  -p 18124:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-backend:12481 \
  -e NEXT_PUBLIC_USE_API_PROXY=1 \
  mcenter-frontend
```

访问 `http://your-ip:18124/mcenter/eyeuc`

## 🎨 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 14.x | React SSR 框架 |
| [React](https://react.dev/) | 18.x | UI 库 |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | 原子化 CSS |
| [Styled Components](https://styled-components.com/) | 6.x | CSS-in-JS |
| [i18next](https://www.i18next.com/) | 23.x | 国际化 |
| [ahooks](https://ahooks.js.org/) | 3.x | React Hooks 工具集 |

## 📝 开发规范

### 代码风格

- 使用 ESLint + Prettier 保持代码一致性
- 组件优先使用函数式 + Hooks
- CSS 优先使用 Tailwind，复杂动画使用 Styled Components

### 提交规范

```
feat: 新增功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [EyeUC](https://www.eyeuc.com/) - 模组数据来源
- [Font Awesome](https://fontawesome.com/) - 图标库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

**注意**: 本仓库仅包含模组中心 (MCenter) 的前端代码，不包含后端 API 实现。如需完整功能，请自行对接后端服务或使用 Mock 数据。

