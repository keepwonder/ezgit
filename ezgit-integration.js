/**
 * EzGit AI Integration - 自动记录讨论的 GitHub 仓库
 */

const fs = require('fs').promises;
const path = require('path');

const EZGIT_DATA_FILE = '/home/jone/.openclaw/workspace-research/projects/ezgit/data/repos.json';

/**
 * 从文本中提取 GitHub URL
 */
function extractGitHubUrls(text) {
  if (!text) return [];
  
  // 匹配 github.com 的各种 URL 格式
  const patterns = [
    /https?:\/\/github\.com\/[^\/\s]+\/[^\/\s\/]+/g,
    /github\.com\/[^\/\s]+\/[^\/\s\/]+/g
  ];
  
  const urls = new Set();
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(url => {
      // 清理 URL
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      // 移除末尾的 .git 或 /
      cleanUrl = cleanUrl.replace(/\.git$/, '').replace(/\/$/, '');
      urls.add(cleanUrl);
    });
  });
  
  return Array.from(urls);
}

/**
 * 解析 GitHub URL
 */
function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
  if (!match) return null;
  
  return {
    owner: match[1],
    name: match[2].replace(/\.git$/, '').replace(/\/$/, '')
  };
}

/**
 * 加载现有仓库数据
 */
async function loadRepos() {
  try {
    const data = await fs.readFile(EZGIT_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * 保存仓库数据
 */
async function saveRepos(repos) {
  // 确保目录存在
  await fs.mkdir(path.dirname(EZGIT_DATA_FILE), { recursive: true });
  await fs.writeFile(EZGIT_DATA_FILE, JSON.stringify(repos, null, 2));
}

/**
 * 添加仓库记录
 */
async function addRepository(data) {
  const repos = await loadRepos();
  
  // 检查是否已存在
  const exists = repos.some(r => r.url === data.url);
  if (exists) {
    // 更新现有记录
    const index = repos.findIndex(r => r.url === data.url);
    repos[index] = {
      ...repos[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    await saveRepos(repos);
    return { added: false, repo: repos[index] };
  }
  
  // 解析 URL
  const parsed = parseGitHubUrl(data.url);
  if (!parsed) {
    throw new Error('无效的 GitHub URL');
  }
  
  const repo = {
    id: Date.now().toString(),
    url: data.url,
    owner: parsed.owner,
    name: parsed.name,
    tags: data.tags || [],
    notes: data.notes || '',
    status: data.status || 'unread',
    starred: data.starred || false,
    discussedWithAI: data.discussedWithAI || false,
    source: data.source || 'manual',
    addedAt: new Date().toISOString(),
    ...data
  };
  
  repos.unshift(repo);
  await saveRepos(repos);
  
  return { added: true, repo };
}

/**
 * 处理消息中的 GitHub URL
 */
async function handleMessageWithGitHub(message, context = {}) {
  const text = message.text || '';
  const urls = extractGitHubUrls(text);
  
  if (urls.length === 0) {
    return null;
  }
  
  const results = [];
  
  for (const url of urls) {
    const result = await addRepository({
      url,
      source: 'ai_chat',
      discussedWithAI: true,
      notes: context.notes || `与 AI 讨论于 ${new Date().toLocaleString('zh-CN')}`,
      tags: context.tags || []
    });
    
    results.push({
      url,
      ...result
    });
  }
  
  return results;
}

/**
 * 生成回复消息
 */
function generateResponse(results) {
  const newRepos = results.filter(r => r.added);
  const existingRepos = results.filter(r => !r.added);
  
  let response = '';
  
  if (newRepos.length > 0) {
    response += `✅ 已记录 ${newRepos.length} 个新仓库到 EzGit\n\n`;
    newRepos.forEach(r => {
      response += `📦 ${r.repo.owner}/${r.repo.name}\n`;
    });
  }
  
  if (existingRepos.length > 0) {
    if (newRepos.length > 0) response += '\n';
    response += `ℹ️ ${existingRepos.length} 个仓库已在记录中\n\n`;
    existingRepos.forEach(r => {
      response += `📦 ${r.repo.owner}/${r.repo.name}\n`;
    });
  }
  
  response += `\n🌐 查看全部: https://ezgit.keepwonder.top`;
  
  return response;
}

/**
 * 主处理函数 - 集成到 OpenClaw
 */
async function handleEzGitIntegration(message) {
  const results = await handleMessageWithGitHub(message);
  
  if (!results || results.length === 0) {
    return null; // 没有 GitHub URL，不处理
  }
  
  return generateResponse(results);
}

/**
 * 手动添加命令
 */
async function handleEzGitCommand(message) {
  const text = message.text || '';
  const parts = text.split(' ');
  const command = parts[0];
  
  if (command === '/ezgit' || command === '/addrepo') {
    const url = parts[1];
    
    if (!url) {
      return `📦 EzGit 仓库管理

用法:
/addrepo https://github.com/user/repo

查看全部: https://ezgit.keepwonder.top`;
    }
    
    try {
      const result = await addRepository({
        url,
        source: 'manual'
      });
      
      if (result.added) {
        return `✅ 已添加: ${result.repo.owner}/${result.repo.name}

🌐 查看全部: https://ezgit.keepwonder.top`;
      } else {
        return `ℹ️ 仓库已存在: ${result.repo.owner}/${result.repo.name}`;
      }
    } catch (error) {
      return `❌ 添加失败: ${error.message}`;
    }
  }
  
  return null;
}

// 导出模块
module.exports = {
  extractGitHubUrls,
  parseGitHubUrl,
  addRepository,
  handleMessageWithGitHub,
  handleEzGitIntegration,
  handleEzGitCommand,
  loadRepos,
  saveRepos
};

// 测试
if (require.main === module) {
  // 测试 URL 提取
  const testText = `
    看看这个项目 https://github.com/dongbeixiaohuo/writing-agent
    还有一个是 https://github.com/keepwonder/ezimage
  `;
  
  const urls = extractGitHubUrls(testText);
  console.log('提取的 URL:', urls);
}
