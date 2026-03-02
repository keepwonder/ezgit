# EzGit 三向同步架构设计

## 🎯 目标
确保数据在三个位置保持一致：
1. **云端** - Vercel KV (主数据源)
2. **网页** - LocalStorage (缓存/离线)
3. **本地** - repos.json (备份/OpenClaw使用)

## 🏗️ 同步架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据流向图                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐                                              │
│   │   Vercel KV  │ ◀──────────────── 主数据源 (Single Source)   │
│   │   (云端)     │                                              │
│   └──────┬───────┘                                              │
│          │                                                       │
│    ┌─────┴─────┐                                                 │
│    │           │                                                 │
│    ▼           ▼                                                 │
│ ┌────────┐  ┌─────────────┐                                     │
│ │浏览器  │  │ OpenClaw    │                                     │
│ │LocalStorage│ │ repos.json  │                                     │
│ └────┬───┘  └──────┬──────┘                                     │
│      │             │                                             │
│      │    ┌────────┘                                             │
│      │    │                                                      │
│      ▼    ▼                                                      │
│   ┌──────────────────┐                                          │
│   │   API Routes     │ ◀── 统一读写入口                          │
│   │   (Next.js)      │                                          │
│   └──────────────────┘                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 同步策略

### 1. 写入流程 (Write)

无论从哪里写入，都通过 API → Vercel KV → 广播到其他端

```
写入请求
    ↓
调用 API POST /api/repos
    ↓
保存到 Vercel KV (主数据)
    ↓
触发同步钩子
    ├─→ 更新浏览器 LocalStorage (实时)
    ├─→ 更新 OpenClaw repos.json (定时/实时)
    └─→ WebSocket 通知其他在线客户端
```

### 2. 读取流程 (Read)

```
读取请求
    ↓
优先检查 LocalStorage (快速)
    ↓
如果有网络，调用 API GET /api/repos 对比
    ↓
如有差异，合并更新
```

### 3. 三端同步机制

| 端 | 角色 | 同步方式 | 频率 |
|----|------|---------|------|
| **云端 KV** | 主数据源 | API 读写 | 实时 |
| **网页 LocalStorage** | 本地缓存 | API 同步 | 启动时/定时 |
| **本地 repos.json** | 备份/OpenClaw | API 拉取/推送 | 定时任务 |

## 🔧 具体实现

### A. 云端 API (Next.js)

```javascript
// pages/api/repos.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const userId = 'kiang'; // 或从 session 获取
  
  switch (req.method) {
    case 'GET':
      // 从 KV 读取
      const repos = await kv.get(`ezgit:repos:${userId}`) || [];
      res.json({ repos });
      break;
      
    case 'POST':
      // 保存到 KV
      const newRepo = req.body;
      const existing = await kv.get(`ezgit:repos:${userId}`) || [];
      existing.push(newRepo);
      await kv.set(`ezgit:repos:${userId}`, existing);
      
      // 触发同步到本地文件
      await syncToLocalFile(userId, existing);
      
      res.json({ success: true, repo: newRepo });
      break;
      
    case 'PUT':
      // 更新
      const { id, updates } = req.body;
      let repos = await kv.get(`ezgit:repos:${userId}`) || [];
      repos = repos.map(r => r.id === id ? { ...r, ...updates } : r);
      await kv.set(`ezgit:repos:${userId}`, repos);
      await syncToLocalFile(userId, repos);
      res.json({ success: true });
      break;
      
    case 'DELETE':
      // 删除
      const { id } = req.body;
      let repos = await kv.get(`ezgit:repos:${userId}`) || [];
      repos = repos.filter(r => r.id !== id);
      await kv.set(`ezgit:repos:${userId}`, repos);
      await syncToLocalFile(userId, repos);
      res.json({ success: true });
      break;
  }
}

// 同步到本地文件
async function syncToLocalFile(userId, repos) {
  // 调用 OpenClaw 所在服务器的 API
  // 或写入共享存储
  await fetch('https://your-server.com/sync', {
    method: 'POST',
    body: JSON.stringify({ userId, repos })
  });
}
```

### B. 网页端 (React)

```javascript
// 数据管理 Hook
function useRepos() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 初始化：先读 LocalStorage，再同步云端
  useEffect(() => {
    const init = async () => {
      // 1. 读本地缓存
      const local = localStorage.getItem('ezgit-repos');
      if (local) {
        setRepos(JSON.parse(local));
        setLoading(false);
      }
      
      // 2. 从云端同步
      await syncFromCloud();
    };
    init();
  }, []);
  
  // 从云端同步
  const syncFromCloud = async () => {
    const response = await fetch('/api/repos');
    const { repos: cloudRepos } = await response.json();
    
    // 合并策略：以云端为准，本地为辅助
    setRepos(cloudRepos);
    localStorage.setItem('ezgit-repos', JSON.stringify(cloudRepos));
  };
  
  // 添加仓库
  const addRepo = async (repoData) => {
    // 1. 先调用 API 保存到云端
    const response = await fetch('/api/repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repoData)
    });
    const { repo } = await response.json();
    
    // 2. 更新本地状态
    const newRepos = [repo, ...repos];
    setRepos(newRepos);
    localStorage.setItem('ezgit-repos', JSON.stringify(newRepos));
    
    return repo;
  };
  
  return { repos, loading, addRepo, syncFromCloud };
}
```

### C. OpenClaw 端 (Node.js)

```javascript
// ezgit-sync.js
const fs = require('fs').promises;
const path = require('path');

const EZGIT_API = 'https://ezgit.keepwonder.top/api';
const LOCAL_FILE = path.join(__dirname, 'data', 'repos.json');

class EzGitSync {
  constructor(userId = 'kiang') {
    this.userId = userId;
  }
  
  // 从云端拉取最新数据
  async pullFromCloud() {
    const response = await fetch(`${EZGIT_API}/repos`);
    const { repos } = await response.json();
    
    // 保存到本地文件
    await fs.writeFile(LOCAL_FILE, JSON.stringify(repos, null, 2));
    
    return repos;
  }
  
  // 推送本地数据到云端
  async pushToCloud() {
    const localData = await fs.readFile(LOCAL_FILE, 'utf8');
    const repos = JSON.parse(localData);
    
    // 批量同步到云端
    for (const repo of repos) {
      await fetch(`${EZGIT_API}/repos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repo)
      });
    }
  }
  
  // 实时同步：当 OpenClaw 添加仓库时
  async addRepo(repoData) {
    // 1. 保存到本地文件
    const repos = JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8') || '[]');
    repos.push(repoData);
    await fs.writeFile(LOCAL_FILE, JSON.stringify(repos, null, 2));
    
    // 2. 同步到云端
    await fetch(`${EZGIT_API}/repos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repoData)
    });
    
    return repoData;
  }
}

// 定时同步任务（每5分钟）
setInterval(async () => {
  const sync = new EzGitSync();
  await sync.pullFromCloud();
  console.log('定时同步完成');
}, 5 * 60 * 1000);

module.exports = EzGitSync;
```

### D. 冲突解决策略

```
场景：网页和 OpenClaw 同时添加仓库

云端 KV: [RepoA, RepoB]
                ↓
┌───────────────┼───────────────┐
▼               │               ▼
网页添加RepoC   │          OpenClaw添加RepoD
                │               │
                ▼               ▼
POST /api/repos │          POST /api/repos
(RepoC)         │          (RepoD)
                │               │
                ▼               ▼
云端合并: [RepoA, RepoB, RepoC, RepoD]
                │
                ▼
广播同步到两端

策略：
1. 以时间戳为准 (addedAt)
2. 自动合并，不覆盖
3. 冲突时保留两个版本
```

## 🚀 实施计划

### Phase 1: 云端 API (2小时)
- [ ] 搭建 Next.js 项目
- [ ] 配置 Vercel KV
- [ ] 实现 CRUD API

### Phase 2: 网页端改造 (2小时)
- [ ] 迁移到 React
- [ ] 实现 useRepos Hook
- [ ] 添加同步状态指示器

### Phase 3: OpenClaw 集成 (1小时)
- [ ] 修改 ezgit-integration.js
- [ ] 实时同步到云端
- [ ] 定时拉取任务

### Phase 4: 测试优化 (1小时)
- [ ] 三端同步测试
- [ ] 冲突场景测试
- [ ] 离线模式测试

**总计：约6小时**

## ⚠️ 注意事项

1. **网络依赖**：必须有网络才能同步
2. **冲突处理**：同时编辑同一仓库以云端为准
3. **备份机制**：定期导出 JSON 备份
4. **限流保护**：API 添加请求频率限制

## 📝 备选方案：简化版

如果不想重构整个项目，可以用 **GitHub Gist** 作为中转：

```
网页 ──▶ Gist ──▶ OpenClaw
  ▲_______________│
```

- 优点：无需后端开发
- 缺点：Gist 有 100MB 限制，不够实时

---

**需要我开始实施吗？** 还是先做一个简化版本（导出/导入）用着？