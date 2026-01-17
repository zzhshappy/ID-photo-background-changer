# 证件照背景替换工具 / ID Photo Background Changer

Quickly change the background of your ID photo to any color.

## 功能说明
这是一个使用 AI 技术精确识别证件照背景的工具，可以自动识别人物并替换背景颜色。

## 安装说明

1. 安装 Python 依赖：
```bash
cd /Users/zhengzaiheshui/codeeeee/证件照
pip3 install -r requirements.txt
```

2. 启动后端服务器（端口5000）：
```bash
python3 server.py
```

3. 在新终端启动前端服务器（端口8001）：
```bash
python3 -m http.server 8001
```

4. 访问网站：
打开浏览器访问 http://localhost:8001

## 技术栈
- **前端**: HTML + CSS + JavaScript
- **后端**: Flask + Python
- **AI模型**: rembg（基于 U2-Net 深度学习模型）

## 特点
✅ 使用 AI 精确识别人物和背景
✅ 自动分离前景和背景
✅ 不会误把衣服当作背景
✅ 支持多种预设颜色和自定义颜色
✅ 实时预览效果
✅ 一键下载处理后的照片
