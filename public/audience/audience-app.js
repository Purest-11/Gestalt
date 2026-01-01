/**
 * 观众端主应用
 * 整合手势检测和 OSC 导出功能
 */

import { GestureDetector } from './GestureDetector.js';
import { AudienceOSCExporter } from './AudienceOSCExporter.js';

class AudienceApp {
  constructor() {
    console.log('🎬 观众端应用初始化...');
    
    // 初始化模块
    this.gestureDetector = new GestureDetector();
    this.oscExporter = new AudienceOSCExporter();
    
    // 获取 DOM 元素
    this.startScreen = document.getElementById('startScreen');
    this.interactScreen = document.getElementById('interactScreen');
    this.startBtn = document.getElementById('startBtn');
    
    this.gestureFeedback = document.getElementById('gestureFeedback');
    this.gestureText = document.getElementById('gestureText');
    this.gestureHint = document.getElementById('gestureHint');
    this.intensityFill = document.getElementById('intensityFill');
    this.currentGestureSpan = document.getElementById('currentGesture');
    this.connectionStatus = document.getElementById('connectionStatus');
    this.audienceCount = document.getElementById('audienceCount');
    
    // 状态
    this.isActive = false;
    
    // 绑定事件
    this.bindEvents();
    
    // 防止页面滚动和缩放
    this.preventDefaultBehaviors();
    
    console.log('✅ 观众端应用初始化完成');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 开始按钮 - 必须在点击事件中直接调用权限请求
    this.startBtn.addEventListener('click', () => {
      this.start();
    });

    // 手势变化回调
    this.gestureDetector.onGestureChange = (data) => {
      this.onGestureChange(data);
    };

    // WebSocket 连接状态回调
    this.oscExporter.onConnectionChange = (connected) => {
      this.updateConnectionStatus(connected);
    };

    // 观众数量更新回调
    this.oscExporter.onAudienceCountUpdate = (count) => {
      this.updateAudienceCount(count);
    };

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📱 页面进入后台');
      } else {
        console.log('📱 页面回到前台');
        // 重新连接（如果断开）
        if (!this.oscExporter.isConnected()) {
          this.oscExporter.connect();
        }
      }
    });

    // 页面关闭前清理
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * 防止默认行为（滚动、缩放等）
   */
  preventDefaultBehaviors() {
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });

    // 防止页面滚动
    document.addEventListener('touchmove', (event) => {
      if (this.isActive) {
        event.preventDefault();
      }
    }, { passive: false });

    // 防止下拉刷新
    document.body.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
  }

  /**
   * 启动互动
   */
  start() {
    console.log('🚀 启动互动...');
    
    // 检测设备类型
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // iOS 设备必须在点击事件中直接调用权限请求
    if (isIOS && typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      
      console.log('📱 检测到 iOS 设备，直接请求权限...');
      
      // 直接调用权限请求（不使用 await）
      DeviceMotionEvent.requestPermission()
        .then(permission => {
          console.log('DeviceMotion 权限结果:', permission);
          
          if (permission === 'granted') {
            console.log('✅ 权限已授予');
            this.startInteraction();
          } else {
            console.error('❌ 权限被拒绝');
            this.showPermissionError(isIOS, isSafari);
          }
        })
        .catch(error => {
          console.error('❌ 权限请求失败:', error);
          this.showPermissionError(isIOS, isSafari);
        });
    } else {
      // Android 或旧版 iOS，直接启动
      console.log('✅ 无需权限请求，直接启动');
      this.startInteraction();
    }
  }

  startInteraction() {
    console.log('🎉 开始互动...');
    
    // 切换界面
    this.startScreen.classList.add('hidden');
    this.interactScreen.classList.remove('hidden');
    this.isActive = true;

    // 启动手势检测
    this.gestureDetector.start();
    
    // 保持屏幕常亮（如果支持）
    this.requestWakeLock();
    
    console.log('✅ 互动已启动');
  }

  showPermissionError(isIOS, isSafari) {
    let errorMsg = '需要传感器权限才能参与互动\n\n';
    
    if (isIOS) {
      if (isSafari) {
        errorMsg += '📱 iOS Safari 用户：\n';
        errorMsg += '1. 刷新页面\n';
        errorMsg += '2. 再次点击"开始互动"\n';
        errorMsg += '3. 在系统弹窗中选择"允许"\n\n';
        errorMsg += '如果没有弹窗出现：\n';
        errorMsg += '• 可能是网络问题，请刷新重试\n';
        errorMsg += '• 或者尝试使用其他 WiFi 网络';
      } else {
        errorMsg += '❌ 请使用 Safari 浏览器\n\n';
        errorMsg += '当前浏览器不支持传感器访问\n';
        errorMsg += '请复制链接到 Safari 中打开';
      }
    } else {
      errorMsg += '📱 Android 用户：\n';
      errorMsg += '请使用 Chrome 浏览器\n';
      errorMsg += '并确保允许传感器访问';
    }
    
    alert(errorMsg);
  }

  /**
   * 请求屏幕常亮
   */
  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        const wakeLock = await navigator.wakeLock.request('screen');
        console.log('✅ 屏幕常亮已启用');
        
        // 监听释放事件
        wakeLock.addEventListener('release', () => {
          console.log('⚠️ 屏幕常亮已释放');
        });
      } catch (error) {
        console.warn('⚠️ 无法启用屏幕常亮:', error);
      }
    }
  }

  /**
   * 手势变化处理
   */
  onGestureChange(data) {
    // 更新 UI
    this.updateGestureUI(data);
    
    // 发送到服务器
    if (this.oscExporter.isConnected()) {
      this.oscExporter.sendGestureData(data);
    }
  }

  /**
   * 更新手势 UI
   */
  updateGestureUI(data) {
    // 手势映射
    const gestureMap = {
      'idle': {
        emoji: '👋',
        text: '挥动手机',
        color: 'rgba(255,255,255,0.5)'
      },
      'shake_horizontal': {
        emoji: '↔️',
        text: '左右摇晃',
        color: '#60a5fa'
      },
      'shake_vertical': {
        emoji: '↕️',
        text: '上下摇晃',
        color: '#34d399'
      },
      'shake_forward': {
        emoji: '🔄',
        text: '前后摇晃',
        color: '#fbbf24'
      },
      'shake_intense': {
        emoji: '💥',
        text: '强烈震动',
        color: '#f87171'
      }
    };

    const gesture = gestureMap[data.gesture] || gestureMap['idle'];
    
    // 更新 emoji 和文字
    this.gestureFeedback.textContent = gesture.emoji;
    this.gestureText.textContent = gesture.text;
    this.gestureHint.textContent = data.hint || '跟随音乐节奏摇晃手机';
    this.currentGestureSpan.textContent = gesture.text;
    
    // 更新强度条
    this.intensityFill.style.width = `${data.intensity * 100}%`;
    
    // 更新手势区域背景色（根据强度）
    if (data.intensity > 0.1) {
      const gestureArea = document.querySelector('.gesture-area');
      gestureArea.style.background = `linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, ${gesture.color}40 100%)`;
      
      // 添加震动反馈（如果支持）
      if (navigator.vibrate && data.intensity > 0.5) {
        navigator.vibrate(50);
      }
    }
  }

  /**
   * 更新连接状态
   */
  updateConnectionStatus(connected) {
    if (connected) {
      this.connectionStatus.textContent = '已连接';
      this.connectionStatus.className = 'info-value status-connected';
    } else {
      this.connectionStatus.textContent = '未连接';
      this.connectionStatus.className = 'info-value status-disconnected';
    }
  }

  /**
   * 更新观众数量
   */
  updateAudienceCount(count) {
    this.audienceCount.textContent = `${count} 人`;
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('🧹 清理资源...');
    this.gestureDetector.stop();
    this.oscExporter.disconnect();
  }
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
  console.log('📱 页面加载完成');
  
  // 延迟初始化，确保 DOM 完全准备好
  setTimeout(() => {
    try {
      const app = new AudienceApp();
      console.log('✅ 应用启动成功');
      
      // 暴露到全局（调试用）
      window.audienceApp = app;
    } catch (error) {
      console.error('❌ 应用启动失败:', error);
      alert('应用启动失败，请刷新页面重试');
    }
  }, 100);
});
