/**
 * 触摸交互应用主程序
 */
import TouchGestureDetector from './TouchGestureDetector.js';
import TouchOSCExporter from './TouchOSCExporter.js';
import BackgroundRenderer from './BackgroundRenderer.js';
import TouchTrailRenderer from './TouchTrailRenderer.js';

/**
 * Wake Lock 管理器
 * 防止页面在后台时被浏览器节流（对于观众监控页面尤其重要）
 */
class WakeLockManager {
  constructor() {
    this.wakeLock = null;
    this.isSupported = 'wakeLock' in navigator;
  }

  async request() {
    if (!this.isSupported) {
      console.warn('⚠️ 此浏览器不支持 Wake Lock API');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      console.log('🔒 Wake Lock 已激活');
      
      this.wakeLock.addEventListener('release', () => {
        console.log('🔓 Wake Lock 已释放');
      });

      // 页面重新可见时自动重新请求
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && !this.wakeLock) {
          await this.request();
        }
      });

      return true;
    } catch (err) {
      console.warn('Wake Lock 请求失败:', err.message);
      return false;
    }
  }

  async release() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }
}

export class TouchApp {
  constructor() {
    this.gestureDetector = null;
    this.oscExporter = null;
    this.bgRenderer = null;
    this.trailRenderer = null;
    
    this.isInteracting = false;
    this.currentGesture = null;
    
    // DOM 元素
    this.elements = {};
    
    // Wake Lock 管理器（防止后台页面被节流）
    this.wakeLockManager = new WakeLockManager();
  }
  
  /**
   * 启动应用
   */
  async start() {
    console.log('🚀 启动触摸交互应用...');
    
    // 获取 DOM 元素
    this.initElements();
    
    // 初始化背景渲染器
    const bgCanvas = document.getElementById('bg-canvas');
    this.bgRenderer = new BackgroundRenderer(bgCanvas);
    this.bgRenderer.start();
    
    // 初始化触摸轨迹渲染器
    const touchCanvas = document.getElementById('touch-canvas');
    this.trailRenderer = new TouchTrailRenderer(touchCanvas);
    this.trailRenderer.start();
    
    // 初始化手势检测器
    this.gestureDetector = new TouchGestureDetector();
    this.gestureDetector.start(touchCanvas);
    
    // 绑定手势事件
    this.bindGestureEvents();
    
    // 初始化 OSC 导出器
    this.oscExporter = new TouchOSCExporter();
    this.bindOSCEvents();
    
    // 连接到服务器
    this.oscExporter.connect();
    
    // 激活 Wake Lock（防止后台被节流）
    await this.wakeLockManager.request();
    
    console.log('✅ 触摸交互应用启动完成');
  }
  
  /**
   * 初始化 DOM 元素引用
   */
  initElements() {
    this.elements = {
      loadingScreen: document.getElementById('loadingScreen'),
      connectionStatus: document.getElementById('connectionStatus'),
      connectionDot: document.getElementById('connectionDot'),
      onlineCount: document.getElementById('onlineCount'),
      totalAudience: document.getElementById('totalAudience'),
      centerHint: document.getElementById('centerHint'),
      directionArrows: document.getElementById('directionArrows'),
      gestureIndicator: document.getElementById('gestureIndicator'),
      gestureIcon: document.getElementById('gestureIcon'),
      gestureName: document.getElementById('gestureName'),
      intensityBar: document.getElementById('intensityBar'),
      intensityFill: document.getElementById('intensityFill')
    };
  }
  
  /**
   * 绑定手势事件
   */
  bindGestureEvents() {
    // 手势开始
    this.gestureDetector.on('gestureStart', (data) => {
      this.isInteracting = true;
      this.hideHint();
      this.showGestureIndicator();
      this.showIntensityBar();
      
      // 添加背景粒子效果
      this.bgRenderer.addInteractionParticles(data.position.x, data.position.y, 10);
    });
    
    // 手势移动
    this.gestureDetector.on('gestureMove', (data) => {
      this.currentGesture = data;
      
      // 更新 UI
      this.updateGestureDisplay(data);
      this.updateIntensity(data.intensity);
      
      // 添加触摸轨迹
      this.trailRenderer.addTouchPoint(data.position.x, data.position.y, data.intensity);
      
      // 发送 OSC 数据
      this.oscExporter.sendGesture(data);
      
      // 添加交互粒子
      if (data.intensity > 0.3) {
        this.bgRenderer.addInteractionParticles(data.position.x, data.position.y, 3);
      }
    });
    
    // 手势结束
    this.gestureDetector.on('gestureEnd', (data) => {
      this.isInteracting = false;
      
      // 延迟隐藏指示器
      setTimeout(() => {
        if (!this.isInteracting) {
          this.hideGestureIndicator();
          this.hideIntensityBar();
          this.showHint();
        }
      }, 1000);
      
      // 结束触摸轨迹
      this.trailRenderer.endCurrentTrail();
      
      // 发送结束状态
      this.oscExporter.sendGesture({
        gesture: 'idle',
        intensity: 0
      });
    });
    
    // 多点触控
    this.gestureDetector.on('multiTouch', (data) => {
      console.log(`👆 多点触控: ${data.fingerCount} 指`);
      this.updateGestureDisplay({
        gesture: `multi_touch_${data.fingerCount}`,
        fingerCount: data.fingerCount
      });
    });
  }
  
  /**
   * 绑定 OSC 事件
   */
  bindOSCEvents() {
    // 连接成功
    this.oscExporter.on('connect', () => {
      this.updateConnectionStatus(true);
      this.hideLoadingScreen();
    });
    
    // 连接断开
    this.oscExporter.on('disconnect', () => {
      this.updateConnectionStatus(false);
    });
    
    // 观众人数更新
    this.oscExporter.on('audienceCount', (count) => {
      this.updateAudienceCount(count);
    });
    
    // 错误
    this.oscExporter.on('error', (error) => {
      console.error('❌ OSC 错误:', error);
    });
  }
  
  /**
   * 更新连接状态
   */
  updateConnectionStatus(connected) {
    if (connected) {
      this.elements.connectionStatus.textContent = '已连接';
      this.elements.connectionDot.classList.remove('disconnected');
    } else {
      this.elements.connectionStatus.textContent = '连接中...';
      this.elements.connectionDot.classList.add('disconnected');
    }
  }
  
  /**
   * 更新观众人数
   */
  updateAudienceCount(count) {
    this.elements.onlineCount.textContent = count;
    this.elements.totalAudience.textContent = count;
  }
  
  /**
   * 更新手势显示
   */
  updateGestureDisplay(gestureData) {
    const gestureNames = {
      'swipe_up': '向上滑动',
      'swipe_down': '向下滑动',
      'swipe_left': '向左滑动',
      'swipe_right': '向右滑动',
      'multi_touch_2': '双指触控',
      'multi_touch_3': '三指触控',
      'multi_touch_4': '四指触控',
      'multi_touch_5': '五指触控'
    };
    
    const gestureIcons = {
      'swipe_up': '⬆️',
      'swipe_down': '⬇️',
      'swipe_left': '⬅️',
      'swipe_right': '➡️',
      'multi_touch_2': '✌️',
      'multi_touch_3': '🤟',
      'multi_touch_4': '🖖',
      'multi_touch_5': '🖐️'
    };
    
    const gesture = gestureData.gesture || 'unknown';
    const name = gestureNames[gesture] || '滑动中';
    const icon = gestureIcons[gesture] || '✨';
    
    this.elements.gestureName.textContent = name;
    this.elements.gestureIcon.textContent = icon;
    
    // 触发动画
    this.elements.gestureIcon.style.animation = 'none';
    setTimeout(() => {
      this.elements.gestureIcon.style.animation = 'bounce 0.5s ease-in-out';
    }, 10);
  }
  
  /**
   * 更新强度显示
   */
  updateIntensity(intensity) {
    const percent = Math.min(intensity * 100, 100);
    this.elements.intensityFill.style.height = `${percent}%`;
  }
  
  /**
   * 显示/隐藏 UI 元素
   */
  showHint() {
    this.elements.centerHint.classList.remove('hidden');
    this.elements.directionArrows.style.opacity = '0.3';
  }
  
  hideHint() {
    this.elements.centerHint.classList.add('hidden');
    this.elements.directionArrows.style.opacity = '0';
  }
  
  showGestureIndicator() {
    this.elements.gestureIndicator.classList.remove('hidden');
  }
  
  hideGestureIndicator() {
    this.elements.gestureIndicator.classList.add('hidden');
  }
  
  showIntensityBar() {
    this.elements.intensityBar.classList.remove('hidden');
  }
  
  hideIntensityBar() {
    this.elements.intensityBar.classList.add('hidden');
  }
  
  hideLoadingScreen() {
    setTimeout(() => {
      this.elements.loadingScreen.classList.add('hidden');
    }, 500);
  }
  
  /**
   * 停止应用
   */
  stop() {
    if (this.gestureDetector) {
      this.gestureDetector.stop();
    }
    
    if (this.oscExporter) {
      this.oscExporter.disconnect();
    }
    
    if (this.bgRenderer) {
      this.bgRenderer.stop();
    }
    
    if (this.trailRenderer) {
      this.trailRenderer.stop();
    }
    
    console.log('👋 触摸交互应用已停止');
  }
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  if (window.touchApp) {
    window.touchApp.stop();
  }
});
