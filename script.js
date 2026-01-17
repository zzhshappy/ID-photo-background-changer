// 全局变量
let originalImageData = null;
let maskImageData = null;
let targetColor = '#FFFFFF'; // 默认白色
let canvas, ctx;
// 自动检测环境：如果是 localhost 使用本地 API，否则使用相对路径
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5001/api' 
    : '/api';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    initializeEventListeners();
    checkServerStatus();
});

async function checkServerStatus() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            console.log('后端服务连接成功');
        }
    } catch (error) {
        console.error('无法连接到后端服务，请确保Python服务器正在运行');
        alert('无法连接到后端服务！\n请在终端运行: python3 server.py');
    }
}

function initializeEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const colorItems = document.querySelectorAll('.color-item');
    const customColor = document.getElementById('customColor');
    const applyCustomBtn = document.getElementById('applyCustomColor');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // 上传区域点击
    uploadArea.addEventListener('click', () => fileInput.click());

    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 颜色选择
    colorItems.forEach(item => {
        item.addEventListener('click', function() {
            colorItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            targetColor = this.dataset.color;
            updateTargetColorPreview();
            if (maskImageData) {
                replaceBackground();
            }
        });
    });

    // 自定义颜色
    applyCustomBtn.addEventListener('click', () => {
        targetColor = customColor.value;
        colorItems.forEach(i => i.classList.remove('active'));
        updateTargetColorPreview();
        if (maskImageData) {
            replaceBackground();
        }
    });

    // 移除灵敏度控制（不再需要）
    const toleranceControl = document.querySelector('.tolerance-control');
    if (toleranceControl) {
        toleranceControl.style.display = 'none';
    }

    // 重置按钮
    resetBtn.addEventListener('click', resetApp);

    // 下载按钮
    downloadBtn.addEventListener('click', downloadImage);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

async function handleFile(file) {
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }

    // 显示加载提示
    const clickHint = document.getElementById('clickHint');
    clickHint.textContent = '正在使用AI识别背景，请稍候...';
    clickHint.style.display = 'block';
    
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('canvasContainer').style.display = 'flex';

    try {
        // 创建FormData
        const formData = new FormData();
        formData.append('file', file);

        // 调用后端API移除背景
        const response = await fetch(`${API_URL}/remove-background`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('背景识别失败');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || '背景识别失败');
        }

        // 保存原图和mask
        originalImageData = data.original;
        maskImageData = data.mask;

        // 显示原图
        const img = new Image();
        img.onload = function() {
            displayImage(img);
            clickHint.style.display = 'none';
            
            // 自动执行背景替换
            replaceBackground();
        };
        img.src = originalImageData;

    } catch (error) {
        console.error('处理图片失败:', error);
        alert('处理图片失败: ' + error.message + '\n请确保Python后端服务正在运行！');
        resetApp();
    }
}

function displayImage(img) {
    // 设置 canvas 大小
    const maxWidth = 500;
    const maxHeight = 500;
    let width = img.width;
    let height = img.height;

    // 等比例缩放
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
    }

    canvas.width = width;
    canvas.height = height;

    // 绘制图片
    ctx.drawImage(img, 0, 0, width, height);
}

async function replaceBackground() {
    if (!originalImageData || !maskImageData) return;

    try {
        // 调用后端API替换背景
        const response = await fetch(`${API_URL}/replace-background`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                original: originalImageData,
                mask: maskImageData,
                targetColor: targetColor
            })
        });

        if (!response.ok) {
            throw new Error('背景替换失败');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || '背景替换失败');
        }

        // 显示结果
        const resultImg = new Image();
        resultImg.onload = function() {
            ctx.drawImage(resultImg, 0, 0, canvas.width, canvas.height);
        };
        resultImg.src = data.result;

    } catch (error) {
        console.error('替换背景失败:', error);
        alert('替换背景失败: ' + error.message);
    }
}

function updateTargetColorPreview() {
    const preview = document.getElementById('targetBgColor');
    preview.style.backgroundColor = targetColor;
}

function downloadImage() {
    if (!canvas) return;

    // 创建下载链接
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `证件照_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

function resetApp() {
    originalImageData = null;
    maskImageData = null;
    targetColor = '#FFFFFF';
    
    // 重置 UI
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('canvasContainer').style.display = 'none';
    document.getElementById('clickHint').style.display = 'block';
    document.getElementById('clickHint').textContent = '正在自动识别背景颜色...';
    document.getElementById('fileInput').value = '';
    document.querySelectorAll('.color-item').forEach(i => i.classList.remove('active'));
    
    // 清空 canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// 初始化目标颜色预览
updateTargetColorPreview();
