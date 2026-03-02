import { kv } from '@vercel/kv';

// 简单的 token 验证
const API_TOKEN = process.env.ezgit_API_TOKEN || 'ezgit-secret-token-2026';

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 验证 token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (token !== API_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  try {
    const key = 'ezgit:repos';
    
    switch (req.method) {
      case 'GET': {
        // 获取所有仓库
        const repos = await kv.get(key) || [];
        return res.status(200).json({ repos, count: repos.length });
      }
      
      case 'POST': {
        // 添加新仓库
        const newRepo = {
          id: Date.now().toString(),
          ...req.body,
          addedAt: new Date().toISOString()
        };
        
        const existing = await kv.get(key) || [];
        
        // 检查是否已存在
        const exists = existing.find(r => r.url === newRepo.url);
        if (exists) {
          return res.status(409).json({ error: 'Repository already exists', repo: exists });
        }
        
        const updated = [newRepo, ...existing];
        await kv.set(key, updated);
        
        return res.status(201).json({ 
          success: true, 
          repo: newRepo,
          message: 'Repository added successfully'
        });
      }
      
      case 'PUT': {
        // 更新仓库
        const { id, ...updates } = req.body;
        const repos = await kv.get(key) || [];
        
        const updatedRepos = repos.map(r => 
          r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        );
        
        await kv.set(key, updatedRepos);
        return res.status(200).json({ success: true });
      }
      
      case 'DELETE': {
        // 删除仓库
        const { id } = req.body;
        const repos = await kv.get(key) || [];
        
        const filtered = repos.filter(r => r.id !== id);
        await kv.set(key, filtered);
        
        return res.status(200).json({ success: true });
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
