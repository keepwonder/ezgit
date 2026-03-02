# EzGit 双向同步配置指南

## ✅ 已完成

1. ✅ API 路由创建 (`api/repos.js`)
2. ✅ Vercel 配置 (`vercel.json`)
3. ✅ OpenClaw 集成 (`ezgit-cloud-sync.js`)
4. ✅ 网页端更新

## 🔧 需要配置的步骤

### 步骤 1: 配置 Vercel KV

1. 访问 https://vercel.com/dashboard
2. 进入 EzGit 项目
3. 点击 "Storage" → "Create Database"
4. 选择 "KV" 类型，点击 "Create"
5. 选择 "Connect to Project" 连接到 EzGit

### 步骤 2: 设置环境变量

在 Vercel 项目设置中添加：

```
Key: EZGIT_API_TOKEN
Value: ezgit-secret-token-2024
```

### 步骤 3: 在 OpenClaw 中启用同步

在 `todo_handler.js` 或其他消息处理器中添加：

```javascript
const { handleEzGitSync } = require('./projects/ezgit/ezgit-cloud-sync');

async function handleMessage(message) {
  // ... 其他命令处理
  
  // EzGit 同步
  const ezgitResult = await handleEzGitSync(message);
  if (ezgitResult) {
    return ezgitResult;
  }
  
  // ... 其他处理
}
```

### 步骤 4: 配置环境变量

在 OpenClaw 运行环境添加：

```bash
export EZGIT_API_TOKEN='ezgit-secret-token-2024'
```

## 🎯 使用效果

**在 Telegram 发送：**
```
看看这个项目 https://github.com/user/repo
```

**自动发生：**
1. OpenClaw 检测到 GitHub URL
2. 调用 API 保存到 Vercel KV
3. 回复：✅ 已同步到 EzGit 云端
4. 网页立即显示新仓库

## 📋 API 端点

```
GET  /api/repos       - 获取所有仓库
POST /api/repos       - 添加新仓库
PUT  /api/repos       - 更新仓库
DELETE /api/repos     - 删除仓库
```

**认证方式：**
```
Authorization: Bearer ezgit-secret-token-2024
```

## 🔒 安全提示

生产环境请：
1. 更换强密码 token
2. 启用 HTTPS
3. 添加速率限制
4. 使用用户认证（可选）

## 🐛 故障排除

**API 返回 401：**
- 检查 token 是否正确设置

**数据未同步：**
- 检查 Vercel KV 是否正确连接
- 查看 Vercel Function Logs

**网页加载失败：**
- 检查浏览器控制台网络请求
- 确认 API 返回正确数据
