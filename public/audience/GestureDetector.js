/**
 * 手势识别模块
 * 基于手机陀螺仪和加速度计检测挥动手势
 */

export class GestureDetector {
  constructor() {
    // 加速度数据
    this.acceleration = { x: 0, y: 0, z: 0 };
    this.lastAcceleration = { x: 0, y: 0, z: 0 };
    
    // 方向数据
    this.rotation = { alpha: 0, beta: 0, gamma: 0 };
    
    // 手势阈值配置
    this.SHAKE_THRESHOLD = 15; // 摇晃阈值
    this.ROTATION_THRESHOLD = 30; // 旋转阈值
    this.IDLE_TIMEOUT = 500; // 静止超时（毫秒）
    
    // 当前手势状态
    this.currentGesture = 'idle';
    this.gestureIntensity = 0;
    this.lastGestureTime = Date.now();
    
    // 回调函数
    this.onGestureChange = null;
    
    // 平滑处理
    this.smoothingFactor = 0.3;
  }

  /**
   * 请求传感器权限（已废弃 - 权限请求现在在 audience-app.js 中直接处理）
   * 保留此方法以保持兼容性
   */
  async requestPermission() {
    console.log('⚠️ requestPermission() 已废弃，权限应在点击事件中直接请求');
    return true;
  }

  /**
   * 开始监听传感器
   */
  start() {
    console.log('🎮 启动手势检测...');
    
    // 监听加速度（包含重力）
    window.addEventListener('devicemotion', (event) => {
      if (event.accelerationIncludingGravity) {
        const acc = event.accelerationIncludingGravity;
        
        // 平滑处理
        this.acceleration = {
          x: this.smoothValue(acc.x || 0, this.acceleration.x),
          y: this.smoothValue(acc.y || 0, this.acceleration.y),
          z: this.smoothValue(acc.z || 0, this.acceleration.z)
        };
        
        this.detectGesture();
      }
    }, { passive: true });

    // 监听方向
    window.addEventListener('deviceorientation', (event) => {
      this.rotation = {
        alpha: event.alpha || 0,  // 0-360 (指南针方向)
        beta: event.beta || 0,    // -180 到 180 (前后倾斜)
        gamma: event.gamma || 0   // -90 到 90 (左右倾斜)
      };
    }, { passive: true });

    console.log('✅ 手势检测已启动');
  }

  /**
   * 平滑处理值
   */
  smoothValue(newValue, oldValue) {
    return oldValue + (newValue - oldValue) * this.smoothingFactor;
  }

  /**
   * 检测手势
   */
  detectGesture() {
    const now = Date.now();
    
    // 计算加速度变化量
    const deltaX = Math.abs(this.acceleration.x - this.lastAcceleration.x);
    const deltaY = Math.abs(this.acceleration.y - this.lastAcceleration.y);
    const deltaZ = Math.abs(this.acceleration.z - this.lastAcceleration.z);

    // 计算总加速度变化（运动强度）
    const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    
    let gesture = 'idle';
    let intensity = 0;
    let hint = '跟随音乐节奏摇晃手机';

    // 检测手势类型
    if (totalDelta > this.SHAKE_THRESHOLD * 1.8) {
      // 强烈震动（所有方向）
      gesture = 'shake_intense';
      intensity = Math.min(1, totalDelta / 50);
      hint = '太棒了！继续保持这个强度！';
      this.lastGestureTime = now;
    } else if (deltaX > deltaY && deltaX > deltaZ && deltaX > this.SHAKE_THRESHOLD) {
      // 水平摇晃（左右）
      gesture = 'shake_horizontal';
      intensity = Math.min(1, deltaX / 30);
      hint = '左右摇晃控制声像和滤波器';
      this.lastGestureTime = now;
    } else if (deltaY > deltaX && deltaY > deltaZ && deltaY > this.SHAKE_THRESHOLD) {
      // 垂直摇晃（上下）
      gesture = 'shake_vertical';
      intensity = Math.min(1, deltaY / 30);
      hint = '上下摇晃控制音量和混响';
      this.lastGestureTime = now;
    } else if (deltaZ > deltaX && deltaZ > deltaY && deltaZ > this.SHAKE_THRESHOLD) {
      // 前后摇晃
      gesture = 'shake_forward';
      intensity = Math.min(1, deltaZ / 30);
      hint = '前后摇晃控制效果器强度';
      this.lastGestureTime = now;
    } else if (now - this.lastGestureTime > this.IDLE_TIMEOUT) {
      // 静止状态
      gesture = 'idle';
      intensity = 0;
      hint = '挥动手机参与表演';
    } else {
      // 保持上一个手势（避免频繁切换）
      gesture = this.currentGesture;
      intensity = this.gestureIntensity * 0.9; // 逐渐衰减
    }

    // 更新手势状态
    const gestureChanged = gesture !== this.currentGesture;
    const intensityChanged = Math.abs(intensity - this.gestureIntensity) > 0.05;
    
    if (gestureChanged || intensityChanged) {
      this.currentGesture = gesture;
      this.gestureIntensity = intensity;
      
      // 触发回调
      if (this.onGestureChange) {
        this.onGestureChange({
          gesture,
          intensity,
          hint,
          acceleration: { ...this.acceleration },
          rotation: { ...this.rotation },
          orientation: this.getNormalizedOrientation(),
          timestamp: now
        });
      }
    }

    // 更新上一次的加速度
    this.lastAcceleration = { ...this.acceleration };
  }

  /**
   * 获取归一化的方向值 (0-1)
   */
  getNormalizedOrientation() {
    return {
      tilt: Math.max(0, Math.min(1, (this.rotation.beta + 90) / 180)),  // 前后倾斜 (0-1)
      roll: Math.max(0, Math.min(1, (this.rotation.gamma + 90) / 180)), // 左右倾斜 (0-1)
      spin: this.rotation.alpha / 360  // 旋转 (0-1)
    };
  }

  /**
   * 停止监听
   */
  stop() {
    // 注意：无法直接移除 devicemotion 和 deviceorientation 监听器
    // 因为我们使用了匿名函数，这里只是重置状态
    this.currentGesture = 'idle';
    this.gestureIntensity = 0;
    console.log('⏹️ 手势检测已停止');
  }
}
