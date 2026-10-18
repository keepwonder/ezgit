# AGENTS.md · `ezgit/`

> AI Agent 在 EzGit 仓工作时的指南。
> 通用工作区规则见上级目录的 `AGENTS.md`。

## 0. 一句话定位

个人 GitHub 仓库收藏与管理工具（单文件 HTML + 内联 CSS/JS + Vanilla JS，零外部 CDN）。数据目前存在浏览器 `localStorage`，云端同步走 GitHub Gist API。**已部署**到 Vercel。视觉体系与主站 / EzTutorial 对齐（白纸面、衬线标题、emerald、4/8 律、深浅色）。

## 1. 项目结构

```
ezgit/
├── index.html              # 单文件前端（UI + 逻辑 + 内联 SVG sprite）
├── api/
│   └── repos.js            # Vercel Serverless Function（预留，目前前端未调用）
├── data/
│   └── repos.json          # 默认仓库数据（预留）
├── *.js                    # 独立 JS 模块（cloud-sync / integration / collector）
├── package.json            # 只有 @vercel/kv 依赖（给 api/repos.js 用）
├── vercel.json             # Vercel 构建配置
├── README.md
└── AGENTS.md               # 你正在读
```

> **注意**：`api/repos.js` 和 `package.json` 是预留后端，当前前端直接调 GitHub API / Gist / localStorage，**没有走 `/api/repos`**。

## 2. 当前状态

| 项 | 状态 |
| --- | --- |
| 前端 | ✅ 已部署，https://ezgit.kiang.website 可访问 |
| 视觉 | ✅ 已对齐主站 / EzTutorial（白纸面 + emerald + 深浅色） |
| 后端 API | ⚠️ 预留，未接入前端 |
| Vercel KV | ⚠️ 未绑定（如果未来启用 api/repos.js 需要） |
| Git 集成 | ✅ 已连 `keepwonder/ezgit`，`main` 自动部署 |
| Cloudflare | ✅ CNAME `ezgit.kiang.website` → Vercel |

## 3. 本地开发

```bash
cd ezgit

# 本地预览（不要 file:// 打开）
python3 -m http.server 3300
# 浏览器 http://localhost:3300
```

不需要 `npm install`——前端不依赖 node_modules；`@vercel/kv` 只在 Vercel runtime 用。

## 4. 修改工作流

### 改前端

```bash
cd ezgit
$EDITOR index.html
python3 -m http.server 3300   # 本地验证
git add index.html
git commit -m "ui: ..."
git push
# Vercel 自动部署
```

### 改 README/文档

```bash
cd ezgit
$EDITOR README.md AGENTS.md
git add README.md AGENTS.md
git commit -m "docs: ..."
git push
```

## 5. 关键不变量

### 5.1 数据存储

前端目前用 `localStorage`：

| Key | 内容 |
| --- | --- |
| `ezgit-categories` | 自定义分类 |
| `ezgit-repos` | 收藏的仓库列表 |
| `ezgit-view` | 列表 / 网格视图偏好 |
| `ezgit_gist_id` | 当前 Gist ID |
| `github_token` | GitHub Token（仅浏览器本地） |
| `kiang-theme` | 手动主题（light / dark，与主站共用键名） |

**不要改 key 名**，否则用户数据丢失。

### 5.2 云端同步

云端同步走 **GitHub Gist API**（不是 `api/repos.js`）。Gist ID 存在 localStorage，Token 由用户在前端输入。**Token 只存在浏览器**，不要写进代码。

### 5.3 预留后端 `api/repos.js`

如果要启用它：

1. 前端改调 `/api/repos`（当前调 Gist）
2. Vercel 项目绑定 KV Storage 实例
3. 环境变量 `ezgit_API_TOKEN` 必须改成强随机字符串（**当前 fallback `ezgit-secret-token-2026` 必须删掉**）
4. `vercel.json` 里的 `EZGIT_API_TOKEN` 和代码里的 `ezgit_API_TOKEN` 变量名不一致，需要统一

### 5.4 域名

- 当前线上：`https://ezgit.kiang.website`
- 旧域名 `https://ezgit.keepwonder.top` 已弃用
- footer 里的「更多项目」应指向 `https://kiang.website`

## 6. 不要做的事

- ❌ 直接 `file://` 打开 `index.html`（OAuth / Gist / 头像请求在 file:// 下不可靠）
- ❌ 把 GitHub Token 写进代码或 commit
- ❌ 改 localStorage key 名（丢数据）
- ❌ 启用 `api/repos.js` 但不改 fallback token（安全漏洞）
- ❌ 让 `vercel.json` 里的 `EZGIT_API_TOKEN` 明文 hardcode（应放环境变量）

## 7. 部署

已启用 Git 集成，push 即部署：

```bash
cd ezgit
git push git@github.com:keepwonder/ezgit.git main:main
```

手动触发：

```bash
unset NODE_OPTIONS && export NODE_OPTIONS=
export VERCEL_TOKEN=$(cat ~/.workbuddy/secrets/vercel-token)
vercel deploy --prod --yes --non-interactive < /dev/null
```

## 8. 与其他项目的关系

- **上游**：依赖 GitHub API（用户 token）
- **下游**：主页 `site/projects.json` 有 ezgit 条目（截图/链接）
- **风格**：Kiang 视觉系统（白纸面 + emerald，与主站 / EzTutorial 同源）
- **注意**：和 `ezgit-remote` 这个旧目录名无关——目录已改名为 `ezgit`，与仓名一致
