# EzGit Vercel 部署指南

## 🚀 快速部署步骤

### 1. 创建 GitHub 仓库

在 GitHub 创建新仓库 `ezgit`

```bash
cd /home/jone/.openclaw/workspace-research/projects/ezgit

# 添加远程仓库
git remote add origin https://github.com/keepwonder/ezgit.git

# 推送到 GitHub
git branch -m main
git push -u origin main
```

### 2. Vercel 部署

**方式 A: Vercel CLI**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd /home/jone/.openclaw/workspace-research/projects/ezgit
vercel --prod
```

**方式 B: Vercel Web 界面** (推荐)

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库 `keepwonder/ezgit`
3. 框架预设选择 **Other** (纯静态)
4. 点击 Deploy

### 3. 配置自定义域名

在 Vercel 项目设置中添加域名：

```
Settings → Domains → Add
Domain: ezgit.keepwonder.top
```

然后在阿里云添加 CNAME 记录：

```
类型: CNAME
主机记录: ezgit
记录值: cname.vercel-dns.com
TTL: 600
```

## 📁 项目结构

```
ezgit/
├── index.html              # 主页面 (纯静态)
├── ezgit-integration.js    # AI 集成模块
├── data/
│   └── repos.json         # 数据存储 (LocalStorage 版本)
├── EZGIT_PLAN.md
└── INTEGRATION.md
```

## ⚠️ 注意

**纯静态版本**：当前 EzGit 使用浏览器 LocalStorage 存储数据

**如果需要持久化存储**，后续需要：
- 添加后端 API (Next.js API Routes 或单独后端)
- 使用数据库 (Vercel Postgres 或 MongoDB Atlas)

## 🌐 部署后地址

| 环境 | 地址 |
|------|------|
| Vercel 默认 | https://ezgit.vercel.app |
| 自定义域名 | https://ezgit.keepwonder.top |

## 🔄 自动部署

每次推送到 main 分支，Vercel 会自动重新部署。

```bash
git add .
git commit -m "更新功能"
git push origin main  # 自动触发部署
```
