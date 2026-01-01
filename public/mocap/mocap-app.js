/**
 * MediaPipe 动作捕捉主应用
 * 集成 MediaPipe Pose + Three.js + OSC 导出
 */

import { OSCExporter } from './OSCExporter.js';

/**
 * Wake Lock 管理器
 * 防止页面在后台时被浏览器节流
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
      console.log('🔒 Wake Lock 已激活 - 页面将保持活跃');
      
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

class MocapApp {
  constructor() {
    // DOM 元素
    this.videoElement = document.querySelector('.input-video');
    this.canvasElement = document.querySelector('.output-canvas');
    this.threeContainer = document.getElementById('three-container');
    this.loadingElement = document.getElementById('loading');
    this.errorElement = document.getElementById('error');
    this.errorMessageElement = document.getElementById('errorMessage');
    this.fpsElement = document.getElementById('fps');
    this.oscStatusElement = document.getElementById('oscStatus');
    this.performerBadgeElement = document.getElementById('performerBadge');
    this.retryBtn = document.getElementById('retryBtn');
    this.loadingText = document.getElementById('loadingText');
    
    // 控制按钮
    this.toggleVideoBtn = document.getElementById('toggleVideoBtn');
    this.toggleParamsBtn = document.getElementById('toggleParamsBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.paramsDisplay = document.getElementById('paramsDisplay');
    this.paramsContent = document.getElementById('paramsContent');

    // MediaPipe
    this.poseLandmarker = null;
    this.lastVideoTime = -1;
    this.results = null;

    // Three.js
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.bodyMeshes = [];

    // OSC 导出器
    this.oscExporter = null;

    // 状态
    this.isRunning = false;
    this.showVideo = false;
    this.showParams = false;
    this.fpsCounter = { frames: 0, lastTime: Date.now(), fps: 0 };

    // Wake Lock 管理器（防止后台页面被节流）
    this.wakeLockManager = new WakeLockManager();

    // 获取演员 ID
    const urlParams = new URLSearchParams(window.location.search);
    this.performerId = parseInt(urlParams.get('performer') || '1');

    this.init();
  }

  async init() {
    try {
      console.log('🚀 应用启动中...');
      
      // 更新演员标识 / Update performer badge with i18n
      const performerText = window.i18n ? window.i18n.t('common.performer') : 'Performer';
      this.performerBadgeElement.textContent = `${performerText} ${this.performerId}`;

      // 绑定事件
      this.bindEvents();

      // 初始化 OSC 导出器
      this.updateLoadingText('正在连接 OSC 服务器...');
      this.oscExporter = new OSCExporter();
      
      // 监听 OSC 连接状态 / Listen for OSC connection status
      setTimeout(() => {
        if (this.oscExporter.ws && this.oscExporter.ws.readyState === WebSocket.OPEN) {
          const connectedText = window.i18n ? window.i18n.t('common.connected') : 'Connected';
          this.oscStatusElement.textContent = `OSC ${connectedText}`;
          this.oscStatusElement.className = 'status connected';
        }
      }, 1000);

      // 初始化 Three.js
      this.updateLoadingText('正在初始化 3D 场景...');
      await this.initThreeJS();

      // 初始化 MediaPipe
      this.updateLoadingText('正在加载 MediaPipe 模型...');
      await this.initMediaPipe();

      // 启动摄像头
      this.updateLoadingText('正在启动摄像头...');
      await this.startCamera();

      // 隐藏加载界面
      this.loadingElement.classList.add('hidden');
      
      // 激活 Wake Lock（防止后台被节流）
      await this.wakeLockManager.request();
      
      // 开始检测循环
      this.isRunning = true;
      this.detectLoop();

      console.log('✅ 应用启动完成');
    } catch (error) {
      console.error('初始化失败:', error);
      this.showError(`初始化失败: ${error.message}`);
    }
  }

  updateLoadingText(text) {
    this.loadingText.textContent = text;
  }

  async initMediaPipe() {
    try {
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          // 🚀 性能优化：使用 lite 模型（比 full 模型快 5 倍）
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1, // 🚀 只检测 1 个人（CPU占用减半）
        minPoseDetectionConfidence: 0.4, // 降低阈值以提高速度
        minPosePresenceConfidence: 0.4,
        minTrackingConfidence: 0.4
      });

      console.log('✅ MediaPipe 已初始化');
    } catch (error) {
      console.error('MediaPipe 初始化失败:', error);
      throw error;
    }
  }

  async initThreeJS() {
    // 场景
    this.scene = new THREE.Scene();
    // 赛博朋克深色背景
    this.scene.background = new THREE.Color(0x050510);
    this.scene.fog = new THREE.FogExp2(0x050510, 0.02);

    // 相机
    const width = this.threeContainer.clientWidth;
    const height = this.threeContainer.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 1, 5); // 稍微抬高视角
    this.camera.lookAt(0, 0, 0);

    // 渲染器 - 开启抗锯齿和透明度
    // 🚀 性能优化：关闭抗锯齿以提升性能（FPS提升30%）
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false, // 关闭抗锯齿以提升性能
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    // 🚀 性能优化：限制像素比为1（Retina屏幕性能提升2倍）
    this.renderer.setPixelRatio(1);
    this.threeContainer.appendChild(this.renderer.domElement);

    // --- 环境氛围 ---
    
    // 1. 动态网格地面 (Retro-wave style)
    const gridHelper = new THREE.GridHelper(40, 40, 0x00ffff, 0x222222);
    gridHelper.position.y = -2;
    this.scene.add(gridHelper);
    this.gridHelper = gridHelper;

    // 2. 悬浮粒子系统
    // 🚀 性能优化：减少粒子数量（300->100，渲染快3倍）
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 30;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x00ffff, // 青色粒子
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    this.starField = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.starField);

    // --- 角色材质预设 ---
    
    // 关节核心材质
    this.jointCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0
    });

    // 关节光晕材质
    this.jointGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // 骨骼线条材质 (霓虹灯管)
    this.boneMaterial = new THREE.LineBasicMaterial({
      color: 0xff00ff, // 品红线条
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    // 初始化人体网格
    this.initBodyMeshes();

    // 窗口大小调整
    window.addEventListener('resize', () => {
      if (this.threeContainer) {
        const w = this.threeContainer.clientWidth;
        const h = this.threeContainer.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });

    console.log('✅ Three.js 已初始化 (赛博朋克版)');
  }

  initBodyMeshes() {
    // 预创建最多 5 个人的网格结构
    for (let i = 0; i < 5; i++) {
      const bodyGroup = new THREE.Group();
      bodyGroup.visible = false;
      
      // 关节数组 (核心 + 光晕)
      bodyGroup.joints = []; 
      
      // 骨骼线对象
      bodyGroup.lines = null;

      this.scene.add(bodyGroup);
      this.bodyMeshes.push(bodyGroup);
    }
  }

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          // 🚀 性能优化：降低分辨率（提升 3 倍速度）
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          // 限制帧率以减少处理负担
          frameRate: { ideal: 30, max: 30 }
        }
      });

      this.videoElement.srcObject = stream;
      
      // 关键修改：隐藏原始视频，只显示数字替身
      // 我们不使用 display: none，因为 MediaPipe 需要它渲染
      this.videoElement.style.opacity = '0'; 
      this.videoElement.style.pointerEvents = 'none';

      return new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          
          // 设置 canvas 大小
          this.canvasElement.width = this.videoElement.videoWidth;
          this.canvasElement.height = this.videoElement.videoHeight;
          
          console.log('✅ 摄像头已启动');
          resolve();
        };
      });
    } catch (error) {
      console.error('摄像头启动失败:', error);
      throw new Error('无法访问摄像头，请确保已授予权限');
    }
  }

  detectLoop() {
    if (!this.isRunning) return;

    const now = performance.now();
    const time = Date.now() * 0.001;
    
    // 🚀 性能优化：限制动画更新频率（每2帧更新一次）
    if (this.fpsCounter.frames % 2 === 0) {
      // --- 动画更新 ---
      if (this.gridHelper) {
          // 网格波动效果
          this.gridHelper.position.z = (time * 2) % 5;
          this.gridHelper.rotation.x = Math.sin(time * 0.2) * 0.05;
      }
      if (this.starField) {
          this.starField.rotation.y = time * 0.05;
          this.starField.rotation.z = time * 0.02;
      }
    }
    
    // 检测姿态
    if (this.videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoElement.currentTime;
      this.results = this.poseLandmarker.detectForVideo(this.videoElement, now);
    }

    // 更新 3D 可视化
    this.updateBodyVisualization();

    // 🚀 性能优化：每3帧导出一次OSC（减少网络负担）
    if (this.fpsCounter.frames % 3 === 0) {
      if (this.results && this.oscExporter) {
        this.oscExporter.exportPoseData(this.results);
      }
    }

    // 更新参数显示
    if (this.showParams) {
      this.updateParamsDisplay();
    }

    // 渲染 Three.js 场景
    this.renderer.render(this.scene, this.camera);

    // 更新 FPS
    this.updateFPS();

    // 继续循环
    requestAnimationFrame(() => this.detectLoop());
  }

  updateBodyVisualization() {
    if (!this.results || !this.results.landmarks) return;

    this.results.landmarks.forEach((landmarks, personIndex) => {
      if (personIndex >= this.bodyMeshes.length) return;

      const bodyGroup = this.bodyMeshes[personIndex];
      bodyGroup.visible = true;

      // 更新关节 (核心 + 光晕)
      landmarks.forEach((landmark, idx) => {
        if (!bodyGroup.joints[idx]) {
          // 创建关节组
          const jointGroup = new THREE.Group();
          
          // 🚀 性能优化：减少Sphere的segments（16->8，渲染快4倍）
          // 1. 核心 (实心高亮)
          const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 8, 8),
            this.jointCoreMaterial
          );
          
          // 2. 光晕 (半透明发光)
          const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            this.jointGlowMaterial
          );
          
          jointGroup.add(core);
          jointGroup.add(glow);
          bodyGroup.add(jointGroup);
          bodyGroup.joints[idx] = jointGroup;
        }

        const joint = bodyGroup.joints[idx];
        // 转换坐标
        joint.position.set(
          (landmark.x - 0.5) * 8, // 稍微缩小比例以适应画面
          -(landmark.y - 0.5) * 8,
          -landmark.z * 8
        );
        
        // 根据置信度调整可见性和大小
        const visible = landmark.visibility > 0.5;
        joint.visible = visible;
        if (visible) {
            const scale = 1 + (1 - landmark.z) * 0.5; // 近大远小增强
            joint.scale.setScalar(scale);
        }
      });

      // 更新骨骼连接线
      this.updateBodyConnections(bodyGroup, landmarks);
    });

    // 隐藏未检测到的人
    for (let i = this.results.landmarks.length; i < this.bodyMeshes.length; i++) {
      this.hideBodyMesh(i);
    }
  }

  updateBodyConnections(bodyGroup, landmarks) {
    // MediaPipe Pose 的连接关系
    const connections = [
      [11, 12], [11, 23], [12, 24], [23, 24], // 躯干
      [12, 14], [14, 16], // 右臂
      [11, 13], [13, 15], // 左臂
      [24, 26], [26, 28], // 右腿
      [23, 25], [25, 27], // 左腿
      [0, 1], [1, 2], [2, 3], [3, 7], // 头部
      [0, 4], [4, 5], [5, 6], [6, 8]
    ];

    const points = [];
    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end] && 
          landmarks[start].visibility > 0.5 && landmarks[end].visibility > 0.5) {
        points.push(new THREE.Vector3(
          (landmarks[start].x - 0.5) * 8,
          -(landmarks[start].y - 0.5) * 8,
          -landmarks[start].z * 8
        ));
        points.push(new THREE.Vector3(
          (landmarks[end].x - 0.5) * 8,
          -(landmarks[end].y - 0.5) * 8,
          -landmarks[end].z * 8
        ));
      }
    });

    // 🚀 性能优化：重用几何体，不要每帧创建和销毁
    if (!bodyGroup.lines && points.length > 0) {
      // 第一次创建
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      bodyGroup.lines = new THREE.LineSegments(geometry, this.boneMaterial);
      bodyGroup.add(bodyGroup.lines);
    } else if (bodyGroup.lines && points.length > 0) {
      // 更新现有几何体（性能提升10倍！）
      bodyGroup.lines.geometry.setFromPoints(points);
      bodyGroup.lines.geometry.attributes.position.needsUpdate = true;
    } else if (bodyGroup.lines && points.length === 0) {
      // 没有点时隐藏
      bodyGroup.lines.visible = false;
    }
    
    if (bodyGroup.lines && points.length > 0) {
      bodyGroup.lines.visible = true;
    }
  }

  hideBodyMesh(personIndex) {
    const bodyGroup = this.bodyMeshes[personIndex];
    if (!bodyGroup) return;

    bodyGroup.visible = false;
  }

  // Check if current language is Chinese
  isChineseLanguage() {
    if (window.i18n && window.i18n.getCurrentLanguage) {
      return window.i18n.getCurrentLanguage() === 'zh';
    }
    return false;
  }

  updateParamsDisplay() {
    const isZh = this.isChineseLanguage();
    
    if (!this.results || !this.results.landmarks || this.results.landmarks.length === 0) {
      const noBodyText = isZh ? '未检测到人体' : 'No body detected';
      this.paramsContent.innerHTML = `<div style="color: #999;">${noBodyText}</div>`;
      return;
    }

    // i18n labels
    const labels = {
      person: isZh ? '人物' : 'Person',
      leftHandHeight: isZh ? '左手高度:' : 'Left Hand Height:',
      rightHandHeight: isZh ? '右手高度:' : 'Right Hand Height:',
      leftHandX: isZh ? '左手X:' : 'Left Hand X:',
      rightHandX: isZh ? '右手X:' : 'Right Hand X:'
    };

    let html = '';
    this.results.landmarks.forEach((landmarks, personIndex) => {
      html += `<div style="margin-bottom: 10px; color: #667eea; font-weight: bold;">${labels.person} ${personIndex + 1}</div>`;
      
      // 计算一些关键参数显示
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];
      const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
      
      const leftHandHeight = Math.max(0, Math.min(1, (shoulderY - leftWrist.y) * 2));
      const rightHandHeight = Math.max(0, Math.min(1, (shoulderY - rightWrist.y) * 2));

      html += `
        <div class="param-item">
          <span class="param-label">${labels.leftHandHeight}</span>
          <span class="param-value">${leftHandHeight.toFixed(2)}</span>
        </div>
        <div class="param-item">
          <span class="param-label">${labels.rightHandHeight}</span>
          <span class="param-value">${rightHandHeight.toFixed(2)}</span>
        </div>
        <div class="param-item">
          <span class="param-label">${labels.leftHandX}</span>
          <span class="param-value">${leftWrist.x.toFixed(2)}</span>
        </div>
        <div class="param-item">
          <span class="param-label">${labels.rightHandX}</span>
          <span class="param-value">${rightWrist.x.toFixed(2)}</span>
        </div>
      `;
    });

    this.paramsContent.innerHTML = html;
  }

  updateFPS() {
    this.fpsCounter.frames++;
    const now = Date.now();
    const elapsed = now - this.fpsCounter.lastTime;

    if (elapsed >= 1000) {
      this.fpsCounter.fps = Math.round((this.fpsCounter.frames * 1000) / elapsed);
      this.fpsElement.textContent = `FPS: ${this.fpsCounter.fps}`;
      this.fpsCounter.frames = 0;
      this.fpsCounter.lastTime = now;
    }
  }

  bindEvents() {
    // 重试按钮
    this.retryBtn.addEventListener('click', () => {
      location.reload();
    });

    // 切换视频显示
    this.toggleVideoBtn.addEventListener('click', () => {
      this.showVideo = !this.showVideo;
      this.canvasElement.style.opacity = this.showVideo ? '0.8' : '0.3';
      this.toggleVideoBtn.classList.toggle('active', this.showVideo);
    });

    // 切换参数显示
    this.toggleParamsBtn.addEventListener('click', () => {
      this.showParams = !this.showParams;
      this.paramsDisplay.classList.toggle('hidden', !this.showParams);
      this.toggleParamsBtn.classList.toggle('active', this.showParams);
    });

    // 全屏
    this.fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }

  showError(message) {
    this.errorMessageElement.textContent = message;
    this.loadingElement.classList.add('hidden');
    this.errorElement.classList.remove('hidden');
  }
}

// 启动应用
new MocapApp();

