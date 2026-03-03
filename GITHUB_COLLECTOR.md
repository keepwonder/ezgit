# GitHub 链接自动收集系统

## 工作原理

```
用户发送 GitHub URL
    ↓
自动检测并提取信息
    ↓
追加到 data/repos.json
    ↓
通知用户已保存
    ↓
用户定期导入到 EzGit 网页
```

## 保存格式

```json
{
  "id": "时间戳",
  "url": "https://github.com/owner/repo",
  "owner": "owner",
  "name": "repo",
  "description": "从 GitHub API 获取的描述",
  "language": "编程语言",
  "stars": "star 数量",
  "category": "待分类",
  "title": "",
  "notes": "与 AI 讨论于 2026/3/3",
  "starred": false,
  "source": "ai_chat",
  "addedAt": "2026-03-03T15:19:00Z"
}
```

## 使用说明

1. **发送 GitHub 链接给我**
   - 我会自动识别并保存
   - 回复确认已保存

2. **查看已保存的链接**
   - 文件位置：`/home/jone/.openclaw/workspace-research/projects/ezgit/data/repos.json`
   - 可随时查看累积的仓库列表

3. **导入到 EzGit 网页**
   - 访问 https://ezgit.keepwonder.top
   - 点击「导入」按钮
   - 选择 `data/repos.json` 文件
   - 完成导入后自动分类整理

4. **定期同步**
   - 建议每周同步一次
   - 或积累一定数量后统一导入

## 当前已保存数量

查看 data/repos.json 文件统计
