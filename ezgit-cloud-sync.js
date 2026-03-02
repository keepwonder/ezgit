/**
 * EzGit Cloud Sync - OpenClaw 集成
 * 双向同步：对话中检测的 GitHub URL 自动保存到 EzGit 云端
 */

const EZGIT_API_URL = 'https://ezgit.keepwonder.top/api/repos';
const EZGIT_TOKEN = process.env.EZGIT_API_TOKEN || 'ezgit-secret-token-2024';

/**
 * 从文本中提取 GitHub URL
 */
function extractGitHubUrls(text) {
  if (!text) return [];
  
  const pattern = /https?:\/\/github\.com\/[^\/\s]+\/[^\/\s\/]+/g;
  const matches = text.match(pattern) || [];
  
  return [...new Set(matches)].map(url => {
    // 清理 URL
    return url.replace(/\.git$/, '').replace(/\/$/, '');
  });
}

/**
 * 解析 GitHub URL
 */
function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
  if (!match) return null;
  return { owner: match[1], name: match[2].replace(/\.git$/, '') };
}

/**
 * 添加仓库到 EzGit 云端
 */
async function addToEzGitCloud(repoData) {
  try {
    const response = await fetch(EZGIT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EZGIT_TOKEN}`
      },
      body: JSON.stringify(repoData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 409) {
        return { exists: true, repo: error.repo };
      }
      throw new Error(error.error || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('EzGit sync error:', error);
    throw error;
  }
}

/**
 * 从云端获取仓库列表
 */
async function getReposFromCloud() {
  try {
    const response = await fetch(EZGIT_API_URL, {
      headers: {
        'Authorization': `Bearer ${EZGIT_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch repos');
    }
    
    const data = await response.json();
    return data.repos || [];
  } catch (error) {
    console.error('EzGit fetch error:', error);
    return [];
  }
}

/**
 * 主处理函数 - 检测 GitHub URL 并同步到云端
 */
async function handleEzGitSync(message, context = {}) {
  const text = message.text || '';
  const urls = extractGitHubUrls(text);
  
  if (urls.length === 0) {
    return null;
  }
  
  const results = [];
  const errors = [];
  
  for (const url of urls) {
    const parsed = parseGitHubUrl(url);
    if (!parsed) continue;
    
    try {
      const result = await addToEzGitCloud({
        url,
        owner: parsed.owner,
        name: parsed.name,
        category: context.category || 'ai', // 默认分类
        title: context.title || `与 AI 讨论的 ${parsed.name}`,
        notes: context.notes || `讨论时间: ${new Date().toLocaleString('zh-CN')}`,
        source: 'ai_chat',
        discussedWithAI: true
      });
      
      results.push({ url, ...result });
    } catch (error) {
      errors.push({ url, error: error.message });
    }
  }
  
  // 生成回复
  let reply = '';
  
  const newRepos = results.filter(r => !r.exists);
  const existingRepos = results.filter(r => r.exists);
  
  if (newRepos.length > 0) {
    reply += `✅ 已同步 ${newRepos.length} 个新仓库到 EzGit 云端\n\n`;
    newRepos.forEach(r => {
      reply += `📦 ${r.repo.owner}/${r.repo.name}\n`;
    });
  }
  
  if (existingRepos.length > 0) {
    if (newRepos.length > 0) reply += '\n';
    reply += `ℹ️ ${existingRepos.length} 个仓库已在 EzGit 中:\n\n`;
    existingRepos.forEach(r => {
      reply += `📦 ${r.repo.owner}/${r.repo.name}\n`;
    });
  }
  
  if (errors.length > 0) {
    reply += `\n❌ ${errors.length} 个同步失败\n`;
  }
  
  reply += `\n🌐 查看全部: https://ezgit.keepwonder.top`;
  
  return reply;
}

/**
 * 命令处理 - /ezgit 命令
 */
async function handleEzGitCommand(message) {
  const text = message.text || '';
  const parts = text.split(' ');
  const command = parts[0];
  
  if (command === '/ezgit' || command === '/eg') {
    const subCommand = parts[1];
    
    switch (subCommand) {
      case 'list':
      case 'ls': {
        const repos = await getReposFromCloud();
        if (repos.length === 0) {
          return '📦 EzGit 云端暂无仓库\n\n添加仓库: 直接发送 GitHub URL 或访问 https://ezgit.keepwonder.top';
        }
        
        let reply = `📦 EzGit 云端仓库 (${repos.length}个)\n\n`;
        repos.slice(0, 10).forEach((r, i) => {
          reply += `${i + 1}. ${r.owner}/${r.name}\n`;
          if (r.title) reply += `   ${r.title}\n`;
        });
        
        if (repos.length > 10) {
          reply += `\n... 还有 ${repos.length - 10} 个仓库\n`;
        }
        
        reply += `\n🌐 查看全部: https://ezgit.keepwonder.top`;
        return reply;
      }
      
      case 'sync':
        return ' EzGit 已配置自动同步，发送 GitHub URL 即可自动保存到云端';
      
      default:
        return `📦 EzGit 命令\n\n/ezgit list - 查看云端仓库列表\n/ezgit sync - 同步状态\n\n或直接发送 GitHub URL 自动保存`;
    }
  }
  
  return null;
}

// 导出模块
module.exports = {
  extractGitHubUrls,
  parseGitHubUrl,
  addToEzGitCloud,
  getReposFromCloud,
  handleEzGitSync,
  handleEzGitCommand,
  EZGIT_API_URL,
  EZGIT_TOKEN
};

// 测试
if (require.main === module) {
  // 测试 URL 提取
  const testText = '看看这个项目 https://github.com/user/repo';
  console.log('提取的 URL:', extractGitHubUrls(testText));
}
