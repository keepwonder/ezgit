# EzGit

🗂️ 个人 GitHub 仓库管理工具

一款简洁优雅的 GitHub 仓库收藏与管理工具，帮助你整理、分类和追踪有价值的开源项目。

界面与 [kiang.website](https://kiang.website) / [EzTutorial](https://eztutorial.kiang.website) 共用一套视觉体系：白纸面、Georgia 衬线标题、emerald 品牌色、4 档字号 / 4 档圆角 / 8 档间距，跟随系统深浅色。

🌐 **在线体验**: https://ezgit.kiang.website

> 原域名 `ezgit.keepwonder.top` 已弃用，主域名统一迁移到 `kiang.website`。Vercel 项目 `prj_QLuxLuJWoXdsgIaQdehfQSHIbXZl`，Cloudflare CNAME 指向 Vercel。

---

## ✨ 核心功能

### 📁 智能分类
- **四大认知维度**: 效率工具、学习资源、参考灵感、基础建设
- **自定义分类**: 支持添加个性化分类标签
- **分类管理**: 可删除自定义分类（系统分类不可删除）

### ⭐ 精选收藏
- 一键标记精选仓库
- 精选筛选功能，快速查看重要项目
- 精选数量实时显示

### 🔍 快速搜索
- 实时搜索仓库名称、作者、描述
- 支持分类 + 精选组合筛选

### 🎨 视图切换
- 网格视图：卡片式浏览
- 列表视图：紧凑式浏览
- 拖拽排序：自定义仓库排列顺序
- 深浅色主题：跟随系统，可在 header 手动覆盖

### 📊 GitHub 集成
- 自动获取仓库信息（描述、语言、Stars）
- 一键跳转到 GitHub 页面

### 💾 数据管理
- 本地存储（LocalStorage）
- 导入/导出 JSON 数据
- 数据备份与迁移

---

## 🚀 使用指南

### 添加仓库
1. 点击右上角 **"+ 添加仓库"** 按钮
2. 输入 GitHub URL（如 `https://github.com/user/repo`）
3. 系统自动获取仓库信息
4. 选择分类、填写评价（可选）
5. 点击添加

### 管理分类
- **添加自定义分类**: 在添加仓库时，分类下拉框选择 "+ 添加自定义分类"
- **删除分类**: 鼠标悬停在自定义分类按钮上，点击出现的删除图标
- ⚠️ 删除分类前需要先移动或删除该分类下的仓库

### 标记精选
- 点击卡片上的星星图标即可标记/取消精选
- 点击顶部的 **"☆ 精选"** 按钮可筛选只显示精选仓库

### 拖拽排序
- 按住卡片即可拖拽到目标位置
- 支持网格视图和列表视图
- 排序结果自动保存

### 导入导出
- **导出**: 页脚「导出备份」，将数据保存为 JSON 文件
- **导入**: 页脚「导入备份」，选择之前导出的 JSON 文件

---

## 🏗️ 项目架构

```
ezgit/
├── index.html              # 主页面（单文件 HTML + 内联 CSS/JS + 内联 SVG 图标）
├── data/
│   └── repos.json          # 默认仓库数据
├── api/
│   └── repos.js            # Vercel Serverless Function（预留，未接入前端）
├── ezgit-cloud-sync.js     # GitHub Gist 同步逻辑
├── ezgit-integration.js    # GitHub OAuth / 集成
├── github-collector.js     # 仓库信息采集
├── package.json            # @vercel/kv 依赖（给 api/repos.js 用）
├── vercel.json             # Vercel 构建配置
└── README.md               # 项目说明
```

---

## 🛠️ 技术栈

- **前端**: HTML5 + 原生 CSS + Vanilla JavaScript（零框架）
- **样式**: 内联 CSS，设计 token 与主站 / EzTutorial 同源
- **图标**: 内联 SVG sprite（无外部字体 / CDN）
- **部署**: Vercel + Cloudflare
- **云端同步**: GitHub Gist API
- **视觉系统**: Kiang（`--paper:#ffffff` / `--emerald:#047a55`，支持暗色）

---

## 📝 开发计划

- [x] 基础 CRUD 功能
- [x] 分类管理
- [x] 精选功能
- [x] 搜索筛选
- [x] 拖拽排序
- [x] 导入导出
- [x] GitHub API 集成
- [x] 自定义分类
- [ ] 批量操作
- [ ] 标签系统
- [ ] 阅读状态追踪
- [ ] 笔记功能增强

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License © 2026 Kiang

---

Made with ❤️ by [Kiang](https://kiang.website)
