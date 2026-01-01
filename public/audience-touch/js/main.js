import Visualizer from './Visualizer.js';
import TouchHandler from './TouchHandler.js';
import Network from './Network.js';

// 初始化
const container = document.getElementById('canvas-container');
const visualizer = new Visualizer(container);

// UI 元素
const ui = {
    loader: document.getElementById('loader'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    count: document.getElementById('audience-count'),
    intensity: document.getElementById('intensity-fill'),
    gestureName: document.getElementById('gesture-name')
};

// 触摸逻辑
const touchHandler = new TouchHandler(visualizer, (data) => {
    // 更新 UI
    if (data.intensity !== undefined) {
        ui.intensity.style.height = `${data.intensity * 100}%`;
    }
    
    if (data.gesture) {
        const names = {
            'idle': 'IDLE',
            'swipe_up': 'SWIPE UP',
            'swipe_down': 'SWIPE DOWN',
            'swipe_left': 'SWIPE LEFT',
            'swipe_right': 'SWIPE RIGHT',
            'unknown': 'DETECTING...'
        };
        ui.gestureName.textContent = names[data.gesture] || data.gesture;
        
        // 文字发光效果增强
        ui.gestureName.style.textShadow = `0 0 20px ${data.intensity > 0.5 ? '#00ffff' : 'rgba(0,255,255,0.3)'}`;
    }

    // 发送网络数据
    // 🎹 修复：必须发送所有阶段的数据，特别是 touchstart（屏幕键盘需要）
    // Network.js 中已有节流逻辑，这里不需要过滤
    network.sendGesture(data);
});

// 网络逻辑
const network = new Network({
    onConnect: () => {
        ui.statusDot.classList.remove('disconnected');
        ui.statusText.textContent = 'ONLINE';
        // 隐藏加载屏
        setTimeout(() => {
            ui.loader.classList.add('hidden');
        }, 500);
    },
    onDisconnect: () => {
        ui.statusDot.classList.add('disconnected');
        ui.statusText.textContent = 'OFFLINE';
    },
    onCount: (count) => {
        ui.count.textContent = count;
    }
});

// 禁止默认的触摸滚动
document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

console.log('System Initialized');
