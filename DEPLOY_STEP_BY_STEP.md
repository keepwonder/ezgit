# EzGit Vercel 部署步骤（详细版）

## ✅ 前置准备

确保你已经在本地完成了：
- Git 已安装
- GitHub 账号
- Vercel 账号（可用 GitHub 登录）

---

## 📋 Step 1: 创建 GitHub 仓库

### 1.1 打开 GitHub
访问 https://github.com/new

### 1.2 填写仓库信息
```
Repository name: ezgit
Description: GitHub 仓库管家 - 记录和 AI 讨论过的项目
Public / Private: Public（推荐，免费）
✅ Add a README file: 不要勾选
✅ Add .gitignore: 不要勾选
✅ Choose a license: 不要勾选
```

### 1.3 点击 "Create repository"

---

## 📋 Step 2: 推送代码到 GitHub

### 2.1 打开终端，进入项目目录

```bash
cd /home/jone/.openclaw/workspace-research/projects/ezgit
```

### 2.2 添加远程仓库

```bash
git remote add origin https://github.com/keepwonder/ezgit.git
```

> 💡 注意：将 `keepwonder` 替换为你的 GitHub 用户名

### 2.3 切换到 main 分支并推送

```bash
# 重命名分支为 main
git branch -m main

# 推送到 GitHub
git push -u origin main
```

### 2.4 验证推送成功

打开浏览器访问：
```
https://github.com/keepwonder/ezgit
```

你应该能看到所有文件：
- index.html
- ezgit-integration.js
- data/repos.json
- 等等...

---

## 📋 Step 3: Vercel 部署

### 3.1 登录 Vercel

访问 https://vercel.com/login
- 选择 "Continue with GitHub"
- 授权 Vercel 访问你的 GitHub 仓库

### 3.2 导入项目

1. 点击 "Add New..." → "Project"
2. 在 "Import Git Repository" 列表中找到 `ezgit`
3. 点击 "Import"

### 3.3 配置项目

```
Project Name: ezgit（自动填充）
Framework Preset: Other（纯静态网站）
Root Directory: ./（默认）
Build Command: 留空
Output Directory: 留空
```

**不需要修改任何配置**，直接点击 **"Deploy"**

### 3.4 等待部署完成

- 部署通常需要 30-60 秒
- 你会看到绿色的 "Congratulations!" 页面
- 默认域名：`https://ezgit.vercel.app`

---

## 📋 Step 4: 配置自定义域名

### 4.1 在 Vercel 添加域名

1. 进入项目 dashboard：https://vercel.com/dashboard
2. 点击 `ezgit` 项目
3. 点击顶部 "Settings" 标签
4. 左侧选择 "Domains"
5. 输入：`ezgit.keepwonder.top`
6. 点击 "Add"

### 4.2 Vercel 会显示 DNS 配置信息

你会看到类似这样的信息：
```
Type: A
Name: ezgit
Value: 76.76.21.21

或者

Type: CNAME
Name: ezgit
Value: cname.vercel-dns.com
```

### 4.3 在阿里云配置 DNS

1. 登录阿里云控制台：https://dc.console.aliyun.com/
2. 进入 "域名解析"
3. 找到 `keepwonder.top`
4. 点击 "解析设置"
5. 点击 "添加记录"

填写信息：
```
记录类型: CNAME
主机记录: ezgit
解析线路: 默认
记录值: cname.vercel-dns.com
TTL: 10 分钟（600秒）
```

6. 点击 "确认"

### 4.4 等待 DNS 生效

- 通常需要 5-30 分钟
- 你可以访问 https://ezgit.keepwonder.top 测试

---

## 📋 Step 5: 验证部署

### 5.1 测试网站

打开浏览器访问：
```
https://ezgit.keepwonder.top
```

你应该看到：
- EzGit 首页
- 可以添加仓库
- 统计数据正常显示

### 5.2 测试功能

1. 点击 "添加仓库"
2. 输入 GitHub URL，比如：`https://github.com/keepwonder/ezimage`
3. 添加标签：`tool`, `vscode`
4. 添加备注：VS Code 图床插件
5. 点击 "添加"

如果成功显示在列表中，说明一切正常！

---

## 🔄 后续更新

当你修改代码后，推送到 GitHub 会自动触发重新部署：

```bash
cd /home/jone/.openclaw/workspace-research/projects/ezgit

# 修改代码后
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel 会自动重新部署
```

---

## 🆘 常见问题

### Q: 部署失败，显示 "Build Failed"

A: 检查 Framework Preset 是否为 "Other"，纯静态网站不需要构建命令

### Q: 域名显示 "Invalid Configuration"

A: 等待 DNS 生效，或者检查阿里云的记录类型是否为 CNAME

### Q: 页面显示 404

A: 确保 `index.html` 在仓库根目录，且文件名正确

### Q: 数据没有保存

A: 正常！LocalStorage 是浏览器本地存储，换浏览器/清缓存会丢失
  （后续可以添加云端同步功能）

---

## ✅ 完成！

部署完成后，你可以：
- 访问 https://ezgit.keepwonder.top 使用
- 在对话中分享 GitHub 链接，AI 会自动记录
- 在主页看到状态变为 "已发布"

祝使用愉快！🎉
