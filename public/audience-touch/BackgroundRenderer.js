/**
 * 背景渲染器
 * 绘制炫酷的科技感背景动画（粒子、网格等）
 */
export default class BackgroundRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 50;
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
    this.initParticles();
    this.animate();
    
    console.log('✅ 背景渲染器已启动');
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
   * 初始化粒子
   */
  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  /**
   * 创建单个粒子
   */
  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 60 + 220 // 蓝紫色调
    };
  }
  
  /**
   * 更新粒子
   */
  updateParticles() {
    this.particles.forEach(particle => {
      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 边界检测
      if (particle.x < 0 || particle.x > this.width) {
        particle.vx *= -1;
      }
      if (particle.y < 0 || particle.y > this.height) {
        particle.vy *= -1;
      }
      
      // 保持在画布内
      particle.x = Math.max(0, Math.min(this.width, particle.x));
      particle.y = Math.max(0, Math.min(this.height, particle.y));
    });
  }
  
  /**
   * 绘制粒子
   */
  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`;
      this.ctx.fill();
      
      // 发光效果
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`;
    });
    
    // 重置阴影
    this.ctx.shadowBlur = 0;
  }
  
  /**
   * 绘制连线
   */
  drawConnections() {
    const maxDistance = 150;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.3;
          
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }
  
  /**
   * 绘制渐变背景
   */
  drawGradient() {
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
    );
    
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a0a2e');
    gradient.addColorStop(1, '#000000');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  /**
   * 动画循环
   */
  animate() {
    if (!this.isRunning) return;
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 绘制渐变背景
    this.drawGradient();
    
    // 更新和绘制粒子
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    
    // 继续动画
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  /**
   * 添加交互粒子（触摸时）
   */
  addInteractionParticles(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles * 2) {
        this.particles.shift(); // 移除最旧的粒子
      }
      
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 2 + 1;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        opacity: 0.8,
        hue: Math.random() * 60 + 220,
        life: 1.0,
        decay: 0.02
      });
    }
  }
}
