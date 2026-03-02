# EzGit 集成指南

## 🎯 功能概述

EzGit 自动记录你和 AI 讨论过的 GitHub 仓库，解决浏览器标签过多、忘记查看状态的痛点。

## 🚀 已部署

- **网站**: https://keepwonder.top/ezgit/
- **子域名**: ezgit.keepwonder.top (配置中)

## 📋 使用方法

### 1. 手动添加仓库

访问 https://keepwonder.top/ezgit/ 
- 点击"添加仓库"
- 输入 GitHub URL
- 可选：添加标签和备注
- 勾选"和 AI 讨论过"

### 2. 自动记录（推荐）

在对话中分享 GitHub 仓库链接时，AI 会自动检测并记录：

```
你: 看看这个项目 https://github.com/user/repo
AI: [分析项目...]
    ✅ 已记录到 EzGit
```

### 3. 管理状态

- 🔴 未读 - 还没看的仓库
- 🟢 已读 - 已查看的仓库  
- ⭐ 收藏 - 重要的仓库

## 🔌 OpenClaw 集成

将以下代码添加到消息处理器：

```javascript
const { handleEzGitIntegration } = require('./projects/ezgit/ezgit-integration');

async function handleMessage(message) {
  // 先检查 EzGit
  const ezgitResult = await handleEzGitIntegration(message);
  if (ezgitResult) {
    await message.reply(ezgitResult);
    // 继续正常处理...
  }
  
  // 原有处理逻辑...
}
```

## 📁 文件结构

```
projects/ezgit/
├── index.html              # 前端页面
├── ezgit-integration.js    # 后端集成
├── data/
│   └── repos.json         # 仓库数据
└── EZGIT_PLAN.md          # 项目规划
```

## 🎨 功能特性

| 功能 | 状态 |
|-----|------|
| 手动添加仓库 | ✅ 完成 |
| 状态管理 | ✅ 完成 |
| 标签系统 | ✅ 完成 |
| 本地存储 | ✅ 完成 |
| AI 自动记录 | 🔄 待集成 |
| GitHub API | 📋 计划中 |
| 浏览器插件 | 📋 计划中 |

## 💡 未来扩展

- [ ] GitHub API 获取仓库信息（stars, language）
- [ ] Chrome 插件一键添加
- [ ] 批量导入浏览器书签
- [ ] 相似仓库推荐
- [ ] 阅读时间统计

## 🔧 配置

编辑 `ezgit-integration.js` 调整：
- 数据文件路径
- 自动检测规则
- 响应消息格式
