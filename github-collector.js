const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'repos.json');

// 读取现有数据
function loadRepos() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// 保存数据
function saveRepos(repos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(repos, null, 2), 'utf8');
}

// 添加新的 GitHub 仓库
async function addGitHubRepo(url, notes = '') {
  // 提取 owner 和 repo
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    return { success: false, error: '无效的 GitHub URL' };
  }
  
  const [, owner, name] = match;
  const cleanName = name.replace(/\.git$/, '');
  
  const repos = loadRepos();
  
  // 检查是否已存在
  const exists = repos.find(r => r.url === url.replace(/\.git$/, ''));
  if (exists) {
    return { success: false, error: '该仓库已存在', repo: exists };
  }
  
  // 尝试获取 GitHub 信息
  let description = '';
  let language = '';
  let stars = '';
  
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${cleanName}`);
    if (response.ok) {
      const data = await response.json();
      description = data.description || '';
      language = data.language || '';
      stars = data.stargazers_count ? formatStars(data.stargazers_count) : '';
    }
  } catch (e) {
    // 静默失败，继续保存
  }
  
  // 创建新记录
  const newRepo = {
    id: Date.now().toString(),
    url: url.replace(/\.git$/, ''),
    owner,
    name: cleanName,
    description,
    language,
    stars,
    category: '', // 待分类
    title: '',
    notes: notes || `与 AI 讨论于 ${new Date().toLocaleString('zh-CN')}`,
    starred: false,
    source: 'ai_chat',
    addedAt: new Date().toISOString()
  };
  
  repos.unshift(newRepo);
  saveRepos(repos);
  
  return { success: true, repo: newRepo };
}

function formatStars(count) {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
}

// 主函数
async function main() {
  const url = process.argv[2];
  const notes = process.argv[3] || '';
  
  if (!url) {
    console.log('用法: node github-collector.js <github-url> [notes]');
    process.exit(1);
  }
  
  const result = await addGitHubRepo(url, notes);
  
  if (result.success) {
    console.log('✅ 已保存:', result.repo.owner + '/' + result.repo.name);
    if (result.repo.description) {
      console.log('   描述:', result.repo.description.substring(0, 50) + '...');
    }
  } else {
    console.log('❌', result.error);
    if (result.repo) {
      console.log('   已存在于:', result.repo.addedAt);
    }
  }
}

main();
