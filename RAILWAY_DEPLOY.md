# Railway 部署教程

## 📝 步骤

### 1. 准备 GitHub 仓库

```bash
# 进入项目目录
cd /Users/zhengzaiheshui/codeeeee/证件照

# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 证件照背景替换工具"

# 在 GitHub 创建新仓库后，关联并推送
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 2. 部署到 Railway

1. 访问 [railway.app](https://railway.app)
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 授权 GitHub 并选择你的仓库
5. Railway 会自动检测 Python 项目并开始部署

### 3. 配置环境变量（可选）

在 Railway 项目设置中添加：
- `PORT`: Railway 自动设置，无需手动配置
- `DEBUG`: 设为 `False`（生产环境）

### 4. 获取部署地址

部署完成后，Railway 会提供一个地址，例如：
```
https://your-project.up.railway.app
```

### 5. 更新前端 API 地址

修改 `script.js` 中的 API_URL：

```javascript
const API_URL = 'https://your-project.up.railway.app/api';
```

然后重新提交并推送：
```bash
git add script.js
git commit -m "Update API URL for Railway"
git push
```

### 6. 部署前端到 Vercel（可选）

前端可以单独部署到 Vercel：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 按照提示操作
```

## ⚙️ 常见问题

### Q: 部署很慢？
A: 第一次部署需要下载 AI 模型（约100MB），需要3-5分钟。之后会缓存，速度会快很多。

### Q: 内存不足？
A: Railway 免费版提供 512MB-1GB 内存，足够运行。如果不够，可以升级到 Pro 版。

### Q: 如何查看日志？
A: 在 Railway 项目页面点击 "View Logs" 查看运行日志。

### Q: 如何自定义域名？
A: 在 Railway 项目设置中的 "Settings" → "Domains" 添加自定义域名。

## 🎉 完成！

现在你的证件照背景替换工具已经在线运行了！
分享你的链接给朋友试试吧！
