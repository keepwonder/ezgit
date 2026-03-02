# EzGit 项目规划

## 🎯 核心痛点

浏览器开了大量 GitHub 仓库标签：
- 忘了哪个看了，哪个没看
- 想回顾某个仓库找不到
- 和 AI 讨论过的仓库没有记录

## 💡 解决方案

EzGit - 智能 GitHub 仓库管理与发现平台

## 🏗️ 功能架构

### 核心功能

| 功能模块 | 说明 | 优先级 |
|---------|------|--------|
| **仓库记录** | 自动/手动添加 GitHub 仓库 | P0 |
| **阅读状态** | 未读/已读/收藏/归档 | P0 |
| **AI 讨论同步** | 和 AI 聊过的自动入库 | P0 |
| **智能标签** | 自动提取语言、主题、关键词 | P1 |
| **笔记系统** | 记录讨论要点和想法 | P1 |
| **批量导入** | 从浏览器书签导入 | P2 |
| **相似推荐** | 基于浏览历史推荐 | P2 |

### 数据模型

```javascript
// Repository 记录
{
  id: "uuid",
  url: "https://github.com/user/repo",
  owner: "user",
  name: "repo",
  description: "项目描述",
  language: "JavaScript",
  stars: 1234,
  
  // 用户数据
  status: "unread" | "read" | "starred" | "archived",
  tags: ["ai", "writing", "tool"],
  notes: "和 AI 讨论过的写作工具...",
  
  // 时间线
  addedAt: "2026-03-02T10:00:00Z",
  readAt: "2026-03-02T11:30:00Z",
  discussedWithAI: true,
  
  // 元数据
  source: "browser" | "ai_chat" | "manual",
  priority: 1-5
}
```

## 📊 页面设计

### 首页 Dashboard
```
┌─────────────────────────────────────────────┐
│  EzGit                    [+ 添加] [搜索]   │
├─────────────────────────────────────────────┤
│                                             │
│  📊 统计卡片                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ 未读 12│ │已读 45 │ │收藏 8  │         │
│  └────────┘ └────────┘ └────────┘         │
│                                             │
│  🏷️ 快速筛选                               │
│  [全部] [未读] [已读] [收藏] [AI讨论]      │
│  [JavaScript] [Python] [AI] [工具] ...     │
│                                             │
│  📋 最近添加                                 │
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 dongbeixiaohuo/writing-agent     │   │
│  │    AI写作工具 | ⭐2.1k | 刚刚       │   │
│  │    标签: ai, writing, claude        │   │
│  │    💬 AI讨论记录                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### 仓库详情页
```
┌─────────────────────────────────────────────┐
│  ← 返回                                      │
├─────────────────────────────────────────────┤
│                                             │
│  📦 user/repo-name                          │
│  ⭐ 1,234  🟢 JavaScript  👁️ 未读          │
│                                             │
│  [标记已读] [收藏] [归档] [编辑]            │
│                                             │
│  项目描述...                                │
│                                             │
│  🏷️ 标签: ai, agent, writing              │
│                                             │
│  📝 我的笔记                                │
│  ┌─────────────────────────────────────┐   │
│  │ 和 AI 讨论了他们的 Subagent 架构...  │   │
│  │ 值得借鉴的 workflow 设计...          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  💬 AI 讨论记录                             │
│  ├─ 2026-03-02 19:14                       │
│  │  分析了 writing-agent 项目架构...      │
│  └────────────────────────────────────────  │
│                                             │
└─────────────────────────────────────────────┘
```

## 🔌 AI 集成方案

### 自动记录机制

当在对话中讨论 GitHub 仓库时，自动提取并记录：

```javascript
// 在消息处理器中添加
async function handleMessage(message) {
  const text = message.text || '';
  
  // 检测 GitHub URL
  const githubUrls = extractGitHubUrls(text);
  
  if (githubUrls.length > 0) {
    for (const url of githubUrls) {
      await ezgit.addRepository({
        url,
        source: 'ai_chat',
        discussedWithAI: true,
        notes: extractContext(message), // 提取讨论上下文
        addedAt: new Date()
      });
    }
    
    await message.reply(
      `✅ 已记录 ${githubUrls.length} 个仓库到 EzGit\n` +
      `查看: https://ezgit.keepwonder.top`
    );
  }
}
```

### 浏览器插件（未来）

```javascript
// Chrome Extension
// 一键添加当前浏览的 GitHub 仓库
chrome.browserAction.onClicked.addListener(async (tab) => {
  if (tab.url.includes('github.com')) {
    await fetch('https://ezgit.keepwonder.top/api/add', {
      method: 'POST',
      body: JSON.stringify({ url: tab.url })
    });
  }
});
```

## 🛠️ 技术栈

| 层级 | 技术 |
|-----|------|
| 前端 | HTML + Tailwind CSS + Vanilla JS |
| 后端 | Node.js + Express |
| 数据库 | SQLite (简单) / JSON 文件 |
| 部署 | 静态站点 + Cloudflare Workers |
| 域名 | ezgit.keepwonder.top |

## 📋 开发计划

### Phase 1: MVP (本周)
- [ ] 基础页面结构
- [ ] 手动添加仓库
- [ ] 列表展示 + 状态管理
- [ ] 本地存储 (LocalStorage)

### Phase 2: AI 集成 (下周)
- [ ] 自动检测 GitHub URL
- [ ] 消息处理器集成
- [ ] 讨论上下文记录

### Phase 3: 增强功能 (未来)
- [ ] GitHub API 获取仓库信息
- [ ] 浏览器插件
- [ ] 批量导入书签
- [ ] 相似仓库推荐

## 💡 特色功能

### 1. AI 讨论时间线
记录每次和 AI 讨论仓库的时间线和要点

### 2. 智能分类
自动提取仓库的语言、主题、用途

### 3. 阅读进度
- 未读: 红色标记
- 已读: 绿色标记  
- 收藏: 星标
- 归档: 灰色（不再关注）

### 4. 快速笔记
对每个仓库记录简短笔记，方便回顾

## 🎨 UI 风格

延续你的个人主页风格：
- 绿色主题 (#059669)
- 简洁卡片设计
- 响应式布局

## 🚀 下一步

需要我：
1. 创建项目目录结构
2. 实现基础页面
3. 集成到 OpenClaw 自动记录
4. 部署到 ezgit.keepwonder.top
