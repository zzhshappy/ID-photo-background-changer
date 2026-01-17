# Railway 部署教程

## 📝 快速部署步骤

### 1. 部署到 Railway（项目已在 GitHub）

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择仓库：`ID-photo-background-changer`
5. Railway 会自动检测 Python 项目并开始部署
6. 等待 3-5 分钟（首次部署需要下载 AI 模型）

### 2. 配置项目

部署完成后，Railway 会自动：
- 安装 requirements.txt 中的依赖
- 使用 Procfile 中的命令启动应用
- 分配一个公开访问的域名

**无需手动配置环境变量**，项目已经自动适配 Railway 环境！

### 3. 获取你的网站地址

在 Railway 项目页面：
1. 点击项目名称
2. 在 "Settings" → "Domains" 中查看你的公开域名
3. 域名格式类似：`your-project.up.railway.app`

🎉 **直接访问这个域名即可使用！**

### 4. 项目特性

✅ **全自动配置**：
- API 地址自动适配（本地/生产环境）
- 前后端集成在一个应用中
- 无需单独部署前端
- 无需修改任何配置文件

✅ **隐私保护**：
- 所有图片处理在内存中完成
- 不保存任何用户上传的照片
- 处理完成后自动清理内存

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
