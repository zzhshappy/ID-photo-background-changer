from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from rembg import remove, new_session
from PIL import Image
import numpy as np
import io
import base64
import cv2
import logging
import os

# 隐私保护说明：
# 1. 所有图片处理完全在内存中进行，不保存任何文件到磁盘
# 2. 使用 io.BytesIO() 进行内存操作
# 3. 处理完成后，Python的垃圾回收会自动清理内存
# 4. 不记录任何用户图片相关的日志

app = Flask(__name__)
CORS(app)

# 禁用Flask的请求日志（保护隐私）
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# 创建一个持久的会话以提高性能
session = new_session()

@app.route('/api/remove-background', methods=['POST'])
def remove_background():
    try:
        # 获取上传的图片
        if 'file' not in request.files:
            return jsonify({'error': '没有上传文件'}), 400
        
        file = request.files['file']
        
        # 读取图片
        img_bytes = file.read()
        input_image = Image.open(io.BytesIO(img_bytes))
        
        # 保存原图的副本，确保颜色模式正确
        # 如果是调色板模式(P)或其他模式，转换为RGB以保留颜色
        if input_image.mode == 'P':
            input_image = input_image.convert('RGB')
        elif input_image.mode not in ('RGB', 'RGBA', 'L'):
            input_image = input_image.convert('RGB')
        
        # 使用rembg移除背景，获取带透明通道的图片
        output_image = remove(input_image, session=session)
        
        # 转换为numpy数组
        output_np = np.array(output_image)
        
        # 提取alpha通道（透明度）作为mask
        # alpha通道中，255表示前景，0表示背景
        if output_np.shape[2] == 4:  # RGBA
            alpha_channel = output_np[:, :, 3]
        else:
            # 如果没有alpha通道，返回错误
            return jsonify({'error': '无法生成透明蒙版'}), 500
        
        # 创建二值mask（0表示背景，255表示前景）
        mask = (alpha_channel > 128).astype(np.uint8) * 255
        
        # 将原图和mask转换为base64
        # 原图 - 直接保存，已经在前面确保了正确的模式
        original_buffer = io.BytesIO()
        input_image.save(original_buffer, format='PNG', optimize=False)
        original_base64 = base64.b64encode(original_buffer.getvalue()).decode('utf-8')
        
        # Mask
        mask_image = Image.fromarray(mask)
        mask_buffer = io.BytesIO()
        mask_image.save(mask_buffer, format='PNG')
        mask_base64 = base64.b64encode(mask_buffer.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'original': f'data:image/png;base64,{original_base64}',
            'mask': f'data:image/png;base64,{mask_base64}'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/replace-background', methods=['POST'])
def replace_background():
    try:
        data = request.get_json()
        
        # 获取base64编码的图片和mask
        original_data = data.get('original')
        mask_data = data.get('mask')
        target_color = data.get('targetColor', '#FFFFFF')
        
        if not original_data or not mask_data:
            return jsonify({'error': '缺少必要参数'}), 400
        
        # 解码base64图片
        original_bytes = base64.b64decode(original_data.split(',')[1])
        mask_bytes = base64.b64decode(mask_data.split(',')[1])
        
        # 转换为PIL Image
        original_image = Image.open(io.BytesIO(original_bytes)).convert('RGB')
        mask_image = Image.open(io.BytesIO(mask_bytes)).convert('L')
        
        # 转换为numpy数组
        original_np = np.array(original_image)
        mask_np = np.array(mask_image)
        
        # 解析目标颜色
        target_color = target_color.lstrip('#')
        r = int(target_color[0:2], 16)
        g = int(target_color[2:4], 16)
        b = int(target_color[4:6], 16)
        
        # 创建背景图像
        background = np.full_like(original_np, (r, g, b), dtype=np.uint8)
        
        # 使用mask合成图像
        # mask_np中，255表示前景（保留原图），0表示背景（使用新颜色）
        mask_3d = np.stack([mask_np] * 3, axis=2) / 255.0
        result = (original_np * mask_3d + background * (1 - mask_3d)).astype(np.uint8)
        
        # 转换回PIL Image
        result_image = Image.fromarray(result)
        
        # 转换为base64
        result_buffer = io.BytesIO()
        result_image.save(result_buffer, format='PNG')
        result_base64 = base64.b64encode(result_buffer.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'result': f'data:image/png;base64,{result_base64}'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

# 静态文件路由 - 用于部署到生产环境
@app.route('/')
def index():
    return send_file('index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_file(path)

if __name__ == '__main__':
    # 从环境变量获取端口（Railway/Heroku等会设置）
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print("正在启动证件照背景替换服务...")
    print(f"服务地址: http://0.0.0.0:{port}")
    print("请确保已安装rembg库: pip install rembg[cpu]")
    app.run(host='0.0.0.0', port=port, debug=debug)
