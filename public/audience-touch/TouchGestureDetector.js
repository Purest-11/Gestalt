/**
 * 触摸手势检测器
 * 识别滑动方向、速度、多点触控等
 */
export default class TouchGestureDetector {
  constructor() {
    this.isActive = false;
    this.touchStart = null;
    this.currentTouch = null;
    this.gestureHistory = [];
    this.maxHistoryLength = 10;
    
    this.callbacks = {
      onGestureStart: null,
      onGestureMove: null,
      onGestureEnd: null,
      onMultiTouch: null
    };
  }
  
  /**
   * 启动检测
   */
  start(canvas) {
    this.canvas = canvas;
    this.isActive = true;
    
    // 绑定触摸事件
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
    
    console.log('✅ 触摸手势检测器已启动');
  }
  
  /**
   * 停止检测
   */
  stop() {
    this.isActive = false;
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
      this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }
  }
  
  /**
   * 触摸开始
   */
  handleTouchStart(e) {
    e.preventDefault();
    
    const touches = Array.from(e.touches).map(t => ({
      x: t.clientX,
      y: t.clientY,
      id: t.identifier
    }));
    
    this.touchStart = {
      touches: touches,
      time: Date.now(),
      position: touches[0]
    };
    
    this.currentTouch = { ...this.touchStart };
    
    // 多点触控
    if (touches.length > 1) {
      this.triggerCallback('onMultiTouch', {
        fingerCount: touches.length,
        touches: touches,
        center: this.calculateCenter(touches)
      });
    }
    
    this.triggerCallback('onGestureStart', {
      position: touches[0],
      fingerCount: touches.length
    });
  }
  
  /**
   * 触摸移动
   */
  handleTouchMove(e) {
    e.preventDefault();
    
    if (!this.touchStart) return;
    
    const touches = Array.from(e.touches).map(t => ({
      x: t.clientX,
      y: t.clientY,
      id: t.identifier
    }));
    
    const currentPos = touches[0];
    const startPos = this.touchStart.position;
    
    // 计算移动距离和方向
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // 计算速度
    const timeDelta = Date.now() - this.touchStart.time;
    const velocity = distance / Math.max(timeDelta, 1);
    
    // 识别手势方向
    const direction = this.getDirection(angle);
    
    // 计算强度（基于距离，归一化到 0-1）
    const maxDistance = Math.min(window.innerWidth, window.innerHeight);
    const intensity = Math.min(distance / maxDistance, 1);
    
    const gestureData = {
      gesture: direction,
      direction: angle,
      distance: distance,
      velocity: velocity,
      intensity: intensity,
      position: currentPos,
      fingerCount: touches.length,
      delta: { x: dx, y: dy }
    };
    
    // 添加到历史记录
    this.addToHistory(gestureData);
    
    this.currentTouch = {
      touches: touches,
      time: Date.now(),
      position: currentPos
    };
    
    this.triggerCallback('onGestureMove', gestureData);
  }
  
  /**
   * 触摸结束
   */
  handleTouchEnd(e) {
    e.preventDefault();
    
    if (!this.touchStart) return;
    
    const endTime = Date.now();
    const duration = endTime - this.touchStart.time;
    
    // 获取最后的手势数据
    const lastGesture = this.gestureHistory[this.gestureHistory.length - 1] || {};
    
    this.triggerCallback('onGestureEnd', {
      ...lastGesture,
      duration: duration
    });
    
    // 重置
    this.touchStart = null;
    this.currentTouch = null;
    this.gestureHistory = [];
  }
  
  /**
   * 根据角度获取方向
   */
  getDirection(angle) {
    // 将角度转换为 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    if (normalizedAngle >= 45 && normalizedAngle < 135) {
      return 'swipe_down';
    } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
      return 'swipe_left';
    } else if (normalizedAngle >= 225 && normalizedAngle < 315) {
      return 'swipe_up';
    } else {
      return 'swipe_right';
    }
  }
  
  /**
   * 计算多个触点的中心
   */
  calculateCenter(touches) {
    const sumX = touches.reduce((sum, t) => sum + t.x, 0);
    const sumY = touches.reduce((sum, t) => sum + t.y, 0);
    return {
      x: sumX / touches.length,
      y: sumY / touches.length
    };
  }
  
  /**
   * 添加到历史记录
   */
  addToHistory(gestureData) {
    this.gestureHistory.push(gestureData);
    if (this.gestureHistory.length > this.maxHistoryLength) {
      this.gestureHistory.shift();
    }
  }
  
  /**
   * 注册回调
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }
  
  /**
   * 触发回调
   */
  triggerCallback(callbackName, data) {
    const callback = this.callbacks[callbackName];
    if (callback && typeof callback === 'function') {
      callback(data);
    }
  }
  
  /**
   * 获取当前手势数据
   */
  getCurrentGesture() {
    return this.gestureHistory[this.gestureHistory.length - 1] || null;
  }
  
  /**
   * 获取平均速度
   */
  getAverageVelocity() {
    if (this.gestureHistory.length === 0) return 0;
    
    const totalVelocity = this.gestureHistory.reduce((sum, g) => sum + (g.velocity || 0), 0);
    return totalVelocity / this.gestureHistory.length;
  }
  
  /**
   * 获取主导方向
   */
  getDominantDirection() {
    if (this.gestureHistory.length === 0) return null;
    
    const directionCounts = {};
    this.gestureHistory.forEach(g => {
      const dir = g.gesture || 'unknown';
      directionCounts[dir] = (directionCounts[dir] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominantDir = null;
    for (const [dir, count] of Object.entries(directionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantDir = dir;
      }
    }
    
    return dominantDir;
  }
}
