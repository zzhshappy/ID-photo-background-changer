# 证件照背景替换工具 - 部署指南

## 📋 项目特点

✅ **完全隐私保护**：所有图片处理在内存中完成，不保存任何用户照片
✅ **AI智能识别**：使用深度学习模型精确分离人物和背景
✅ **开源透明**：代码完全公开，可审查验证隐私承诺

## 🚀 部署到云服务器

### 方案一：使用 Railway（推荐，免费额度）

1. 注册 [Railway.app](https://railway.app)

2. 创建 `Procfile` 文件：
```
web: gunicorn server:app
```

3. 更新 `requirements.txt` 添加：
```
gunicorn==21.2.0
```

4. 在 Railway 中：
   - New Project → Deploy from GitHub
   - 选择你的代码仓库
   - 自动部署

5. 设置环境变量：
   - `PORT`: 5001

### 方案二：使用 Vercel（前端） + Railway（后端）

**后端部署（Railway）：**
同上

**前端部署（Vercel）：**
1. 安装 Vercel CLI：`npm i -g vercel`
2. 在项目目录运行：`vercel`
3. 更新 `script.js` 中的 API_URL 为后端地址

### 方案三：使用阿里云/腾讯云服务器

```bash
# 1. 连接服务器
ssh root@your-server-ip

# 2. 安装 Python 和依赖
sudo apt update
sudo apt install python3 python3-pip nginx

# 3. 上传代码
scp -r 证件照 root@your-server-ip:/var/www/

# 4. 安装依赖
cd /var/www/证件照
pip3 install -r requirements.txt

# 5. 使用 Gunicorn 运行后端
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 server:app &

# 6. 配置 Nginx（参考下面的配置）
```

## 📝 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/证件照;
        index index.html;
        try_files $uri $uri/ =404;
    }
    
    # 后端 API
    location /api {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # 增加上传文件大小限制
        client_max_body_size 10M;
    }
}
```

## 🔒 隐私保护验证

代码中的隐私保护措施：

1. **不保存文件**：使用 `io.BytesIO()` 在内存中处理
2. **自动清理**：Python 垃圾回收自动清理内存
3. **禁用日志**：不记录用户图片相关信息
4. **HTTPS 加密**：部署时启用 HTTPS（推荐使用 Let's Encrypt）

验证方式：
```bash
# 检查服务器是否有保存的图片文件
find /var/www -name "*.jpg" -o -name "*.png"
```

## 🌐 免费域名和 HTTPS

1. **域名**：
   - Freenom 免费域名
   - Cloudflare（还提供免费 CDN 和 HTTPS）

2. **HTTPS 证书**：
```bash
# 使用 Certbot（Let's Encrypt）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 💰 成本估算

- **Railway 免费版**：500小时/月，足够个人使用
- **阿里云/腾讯云**：学生机约 ¥10/月
- **域名**：免费 或 ¥30-50/年
- **流量**：AI模型首次下载约100MB

## 🛠️ 性能优化建议

1. **启用 CDN**（Cloudflare）加速静态资源
2. **使用 Redis** 缓存处理结果（可选）
3. **增加工作进程数**：`gunicorn -w 4`
4. **图片压缩**：限制上传图片大小

## 📞 技术支持

如遇问题，检查：
- Python 版本 >= 3.9
- 内存 >= 2GB（AI模型需要）
- 防火墙开放 80/443 端口
