/**
 * 触摸轨迹渲染器
 * 绘制炫酷的触摸轨迹效果
 */
export default class TouchTrailRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.trails = [];
    this.maxTrailLength = 30;
    this.animationId = null;
    this.isRunning = false;
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  /**
   * 调整画布大小
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  /**
   * 启动渲染
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
    
    console.log('✅ 触摸轨迹渲染器已启动');
  }
  
  /**
   * 停止渲染
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * 添加触摸点
   */
  addTouchPoint(x, y, intensity = 1) {
    // 创建新轨迹或添加到现有轨迹
    if (this.trails.length === 0 || this.trails[this.trails.length - 1].ended) {
      this.trails.push({
        points: [],
        ended: false,
        hue: Math.random() * 60 + 220, // 蓝紫色调
        startTime: Date.now()
      });
    }
    
    const currentTrail = this.trails[this.trails.length - 1];
    
    currentTrail.points.push({
      x: x,
      y: y,
      intensity: intensity,
      time: Date.now(),
      life: 1.0
    });
    
    // 限制轨迹长度
    if (currentTrail.points.length > this.maxTrailLength) {
      currentTrail.points.shift();
    }
  }
  
  /**
   * 结束当前轨迹
   */
  endCurrentTrail() {
    if (this.trails.length > 0) {
      this.trails[this.trails.length - 1].ended = true;
    }
  }
  
  /**
   * 更新轨迹
   */
  updateTrails() {
    // 更新所有轨迹点的生命值
    this.trails.forEach(trail => {
      trail.points.forEach(point => {
        // 生命值衰减
        point.life -= 0.02;
      });
      
      // 移除生命值为 0 的点
      trail.points = trail.points.filter(point => point.life > 0);
    });
    
    // 移除空轨迹
    this.trails = this.trails.filter(trail => trail.points.length > 0);
    
    // 限制轨迹数量
    const maxTrails = 10;
    if (this.trails.length > maxTrails) {
      this.trails = this.trails.slice(-maxTrails);
    }
  }
  
  /**
   * 绘制轨迹
   */
  drawTrails() {
    this.trails.forEach(trail => {
      if (trail.points.length < 2) return;
      
      // 绘制主轨迹线
      this.ctx.beginPath();
      this.ctx.moveTo(trail.points[0].x, trail.points[0].y);
      
      for (let i = 1; i < trail.points.length; i++) {
        const point = trail.points[i];
        this.ctx.lineTo(point.x, point.y);
      }
      
      // 渐变色
      const gradient = this.ctx.createLinearGradient(
        trail.points[0].x,
        trail.points[0].y,
        trail.points[trail.points.length - 1].x,
        trail.points[trail.points.length - 1].y
      );
      
      gradient.addColorStop(0, `hsla(${trail.hue}, 80%, 60%, 0.1)`);
      gradient.addColorStop(1, `hsla(${trail.hue}, 80%, 60%, 0.8)`);
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 8;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
      
      // 发光效果
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = `hsla(${trail.hue}, 80%, 60%, 0.8)`;
      this.ctx.stroke();
      
      // 重置阴影
      this.ctx.shadowBlur = 0;
      
      // 绘制轨迹点
      trail.points.forEach((point, index) => {
        const size = 6 + point.intensity * 4;
        const opacity = point.life * 0.8;
        
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${trail.hue}, 80%, 70%, ${opacity})`;
        this.ctx.fill();
        
        // 光晕
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${trail.hue}, 80%, 60%, ${opacity * 0.2})`;
        this.ctx.fill();
      });
    });
  }
  
  /**
   * 绘制触摸指示器
   */
  drawTouchIndicator(x, y, intensity = 1) {
    const time = Date.now() % 2000;
    const progress = time / 2000;
    
    // 脉冲圆环
    const rings = 3;
    for (let i = 0; i < rings; i++) {
      const offset = (i / rings);
      const ringProgress = (progress + offset) % 1;
      const radius = 20 + ringProgress * 40;
      const opacity = (1 - ringProgress) * intensity * 0.5;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }
  }
  
  /**
   * 动画循环
   */
  animate() {
    if (!this.isRunning) return;
    
    // 清空画布（使用淡入淡出效果）
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 更新和绘制轨迹
    this.updateTrails();
    this.drawTrails();
    
    // 继续动画
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  /**
   * 清空所有轨迹
   */
  clear() {
    this.trails = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
