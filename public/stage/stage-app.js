/**
 * 🎭 Cyber Stage - 演员视觉舞台
 * 高性能3D骨骼渲染 + 粒子系统 + 后期处理
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ==================== 配置 ====================
const CONFIG = {
  // 性能优化
  targetFPS: 60,
  maxParticles: 300,
  
  // 骨骼连接定义
  BODY_CONNECTIONS: [
    // 躯干
    [11, 12], [11, 23], [12, 24], [23, 24],
    // 右臂
    [12, 14], [14, 16],
    // 左臂  
    [11, 13], [13, 15],
    // 右腿
    [24, 26], [26, 28],
    // 左腿
    [23, 25], [25, 27],
    // 面部（可选）
    [0, 1], [1, 2], [2, 3], [3, 7],
    [0, 4], [4, 5], [5, 6], [6, 8]
  ],
  
  // 主要关节（显示更大）
  MAJOR_JOINTS: [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28],
  
  // 手部连接
  HAND_CONNECTIONS: [
    [0, 1], [1, 2], [2, 3], [3, 4],    // 拇指
    [0, 5], [5, 6], [6, 7], [7, 8],    // 食指
    [0, 9], [9, 10], [10, 11], [11, 12], // 中指
    [0, 13], [13, 14], [14, 15], [15, 16], // 无名指
    [0, 17], [17, 18], [18, 19], [19, 20], // 小指
    [5, 9], [9, 13], [13, 17]           // 掌心横向
  ],
  
  // 预设配置
  PRESETS: {
    1: {
      name: '霓虹骨架',
      skeleton: { visible: true, jointRadius: 0.04, boneRadius: 0.015, emissive: 2.0 },
      particles: { enabled: true, count: 200, size: 0.03 },
      bloom: { strength: 1.5, radius: 0.8, threshold: 0.2 },
      trails: { enabled: false },
      colors: { primary: 0xff2d95, secondary: 0x00f0ff }
    },
    2: {
      name: '粒子云',
      skeleton: { visible: false, jointRadius: 0.02, boneRadius: 0.008, emissive: 1.0 },
      particles: { enabled: true, count: 500, size: 0.05 },
      bloom: { strength: 2.0, radius: 1.0, threshold: 0.1 },
      trails: { enabled: false },
      colors: { primary: 0x00f0ff, secondary: 0xb026ff }
    },
    3: {
      name: '能量脉冲',
      skeleton: { visible: true, jointRadius: 0.05, boneRadius: 0.02, emissive: 3.0 },
      particles: { enabled: true, count: 150, size: 0.04 },
      bloom: { strength: 2.5, radius: 1.2, threshold: 0.0 },
      trails: { enabled: true },
      colors: { primary: 0xffff00, secondary: 0xff6600 }
    },
    4: {
      name: '数据流',
      skeleton: { visible: true, jointRadius: 0.03, boneRadius: 0.012, emissive: 1.5 },
      particles: { enabled: true, count: 300, size: 0.02 },
      bloom: { strength: 1.2, radius: 0.5, threshold: 0.3 },
      trails: { enabled: true },
      colors: { primary: 0x00ff88, secondary: 0x0088ff }
    },
    5: {
      name: '幽灵影',
      skeleton: { visible: true, jointRadius: 0.035, boneRadius: 0.014, emissive: 0.8 },
      particles: { enabled: false, count: 0, size: 0 },
      bloom: { strength: 3.0, radius: 2.0, threshold: 0.0 },
      trails: { enabled: true },
      colors: { primary: 0xffffff, secondary: 0xaaaaff }
    },
    6: {
      name: '极光',
      skeleton: { visible: true, jointRadius: 0.045, boneRadius: 0.018, emissive: 2.5 },
      particles: { enabled: true, count: 400, size: 0.035 },
      bloom: { strength: 1.8, radius: 1.5, threshold: 0.1 },
      trails: { enabled: false },
      colors: { primary: 0x00ffaa, secondary: 0xff00ff }
    }
  }
};

// ==================== 主应用类 ====================
class CyberStageApp {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.bloomPass = null;
    
    // 骨骼模型
    this.joints = [];
    this.bones = [];
    this.jointMaterial = null;
    this.boneMaterial = null;
    
    // 手部模型
    this.leftHandJoints = [];
    this.leftHandBones = [];
    this.rightHandJoints = [];
    this.rightHandBones = [];
    
    // 粒子系统
    this.particles = null;
    this.particlePositions = null;
    this.particleVelocities = [];
    
    // 运动轨迹
    this.trails = {
      leftHand: [],
      rightHand: []
    };
    this.trailLines = {
      leftHand: null,
      rightHand: null
    };
    
    // 状态
    this.currentPreset = 1;
    this.isConnected = false;
    this.landmarks = null;
    this.handLandmarks = null;
    this.performerId = 1;
    
    // 性能监控
    this.fpsCounter = { frames: 0, lastTime: Date.now(), fps: 0 };
    this.lastFrameTime = 0;
    
    // UI元素
    this.showSkeleton = true;
    this.showParticles = true;
    this.showTrails = false;
    this.showBloom = true;
    this.showInfo = false;
    
    // 平滑处理
    this.smoothedLandmarks = null;
    this.smoothingFactor = 0.3;
    
    // WebSocket
    this.ws = null;
    
    // 初始化
    this.init();
  }
  
  async init() {
    try {
      this.updateLoadingProgress(10, '初始化场景...');
      await this.initThreeJS();
      
      this.updateLoadingProgress(30, '创建骨骼模型...');
      await this.createSkeletonModel();
      
      this.updateLoadingProgress(50, '初始化粒子系统...');
      await this.createParticleSystem();
      
      this.updateLoadingProgress(70, '设置后期处理...');
      await this.initPostProcessing();
      
      this.updateLoadingProgress(85, '连接服务器...');
      await this.connectWebSocket();
      
      this.updateLoadingProgress(95, '绑定事件...');
      this.bindEvents();
      this.initCustomCursor();
      
      this.updateLoadingProgress(100, '启动完成');
      
      // 隐藏加载界面
      setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
      }, 500);
      
      // 开始渲染循环
      this.animate();
      
      console.log('🎭 Cyber Stage 初始化完成');
    } catch (error) {
      console.error('初始化失败:', error);
      this.updateLoadingProgress(0, '初始化失败: ' + error.message);
    }
  }
  
  updateLoadingProgress(percent, text) {
    const progressBar = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');
    if (progressBar) progressBar.style.width = percent + '%';
    if (loadingText) loadingText.textContent = text;
  }
  
  // ==================== Three.js 初始化 ====================
  async initThreeJS() {
    this.container = document.getElementById('three-container');
    
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050508);
    this.scene.fog = new THREE.FogExp2(0x050508, 0.015);
    
    // 创建相机
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // 添加点光源
    const pointLight1 = new THREE.PointLight(0xff2d95, 1, 10);
    pointLight1.position.set(2, 2, 2);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00f0ff, 1, 10);
    pointLight2.position.set(-2, -1, 2);
    this.scene.add(pointLight2);
    
    // 添加地面网格
    const gridHelper = new THREE.GridHelper(10, 20, 0x00f0ff, 0x1a1a2e);
    gridHelper.position.y = -1.5;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  // ==================== 骨骼模型创建 ====================
  async createSkeletonModel() {
    const preset = CONFIG.PRESETS[this.currentPreset];
    
    // 创建关节材质（发光）
    this.jointMaterial = new THREE.MeshStandardMaterial({
      color: preset.colors.primary,
      emissive: preset.colors.primary,
      emissiveIntensity: preset.skeleton.emissive,
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    
    // 创建骨骼材质
    this.boneMaterial = new THREE.MeshStandardMaterial({
      color: preset.colors.secondary,
      emissive: preset.colors.secondary,
      emissiveIntensity: preset.skeleton.emissive * 0.7,
      metalness: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    
    // 创建33个身体关节点
    const jointGeometry = new THREE.SphereGeometry(preset.skeleton.jointRadius, 16, 16);
    for (let i = 0; i < 33; i++) {
      const joint = new THREE.Mesh(jointGeometry, this.jointMaterial.clone());
      joint.visible = false;
      this.scene.add(joint);
      this.joints.push(joint);
    }
    
    // 创建骨骼连接
    for (let i = 0; i < CONFIG.BODY_CONNECTIONS.length; i++) {
      const boneGeometry = new THREE.CylinderGeometry(
        preset.skeleton.boneRadius,
        preset.skeleton.boneRadius,
        1, 8
      );
      const bone = new THREE.Mesh(boneGeometry, this.boneMaterial.clone());
      bone.visible = false;
      this.scene.add(bone);
      this.bones.push(bone);
    }
    
    // 创建手部关节和骨骼（左手）
    await this.createHandModel('left');
    // 创建手部关节和骨骼（右手）
    await this.createHandModel('right');
  }
  
  async createHandModel(hand) {
    const preset = CONFIG.PRESETS[this.currentPreset];
    const handColor = hand === 'left' ? 0xff2d95 : 0x00f0ff;
    
    const handJointMaterial = new THREE.MeshStandardMaterial({
      color: handColor,
      emissive: handColor,
      emissiveIntensity: preset.skeleton.emissive * 1.2,
      metalness: 0.5,
      roughness: 0.2
    });
    
    const handBoneMaterial = new THREE.MeshStandardMaterial({
      color: handColor,
      emissive: handColor,
      emissiveIntensity: preset.skeleton.emissive * 0.8,
      metalness: 0.6,
      roughness: 0.3
    });
    
    const joints = hand === 'left' ? this.leftHandJoints : this.rightHandJoints;
    const bones = hand === 'left' ? this.leftHandBones : this.rightHandBones;
    
    // 21个手部关键点
    const jointGeometry = new THREE.SphereGeometry(preset.skeleton.jointRadius * 0.5, 12, 12);
    for (let i = 0; i < 21; i++) {
      const joint = new THREE.Mesh(jointGeometry, handJointMaterial.clone());
      joint.visible = false;
      this.scene.add(joint);
      joints.push(joint);
    }
    
    // 手部骨骼连接
    for (let i = 0; i < CONFIG.HAND_CONNECTIONS.length; i++) {
      const boneGeometry = new THREE.CylinderGeometry(
        preset.skeleton.boneRadius * 0.4,
        preset.skeleton.boneRadius * 0.4,
        1, 6
      );
      const bone = new THREE.Mesh(boneGeometry, handBoneMaterial.clone());
      bone.visible = false;
      this.scene.add(bone);
      bones.push(bone);
    }
  }
  
  // ==================== 粒子系统 ====================
  async createParticleSystem() {
    const preset = CONFIG.PRESETS[this.currentPreset];
    const count = preset.particles.count;
    
    if (count === 0) return;
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const primaryColor = new THREE.Color(preset.colors.primary);
    const secondaryColor = new THREE.Color(preset.colors.secondary);
    
    for (let i = 0; i < count; i++) {
      // 初始位置在场景中心附近
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      // 颜色渐变
      const mixFactor = Math.random();
      const color = primaryColor.clone().lerp(secondaryColor, mixFactor);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // 随机大小
      sizes[i] = preset.particles.size * (0.5 + Math.random());
      
      // 初始速度
      this.particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // 粒子材质
    const material = new THREE.PointsMaterial({
      size: preset.particles.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.particlePositions = positions;
    this.scene.add(this.particles);
  }
  
  // ==================== 后期处理 ====================
  async initPostProcessing() {
    const preset = CONFIG.PRESETS[this.currentPreset];
    
    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      preset.bloom.strength,
      preset.bloom.radius,
      preset.bloom.threshold
    );
    this.composer.addPass(this.bloomPass);
  }
  
  // ==================== WebSocket 连接 ====================
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔗 WebSocket 已连接');
        this.isConnected = true;
        this.updateConnectionStatus(true);
        
        // 注册为视觉舞台客户端
        this.ws.send(JSON.stringify({
          type: 'register_stage'
        }));
        
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('消息解析错误:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('❌ WebSocket 已断开');
        this.isConnected = false;
        this.updateConnectionStatus(false);
        
        // 自动重连
        setTimeout(() => this.connectWebSocket(), 3000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        this.updateConnectionStatus(false);
        resolve(); // 不阻止初始化
      };
      
      // 超时处理
      setTimeout(() => {
        if (!this.isConnected) {
          resolve();
        }
      }, 5000);
    });
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'pose_update':
        this.landmarks = data.landmarks;
        this.handLandmarks = data.handLandmarks;
        this.performerId = data.performerId || 1;
        this.updatePerformerInfo();
        break;
        
      case 'stage_registered':
        console.log('🎬 视觉舞台注册成功');
        break;
    }
  }
  
  updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    
    if (statusElement) {
      statusElement.className = 'status-badge ' + (connected ? 'connected' : 'disconnected');
    }
    if (statusText) {
      statusText.textContent = connected ? '已连接' : '等待连接';
    }
  }
  
  updatePerformerInfo() {
    const avatar = document.getElementById('performerAvatar');
    const name = document.getElementById('performerName');
    const status = document.getElementById('performerStatus');
    
    if (avatar) avatar.textContent = this.performerId;
    if (name) name.textContent = `演员 ${this.performerId}`;
    if (status) status.textContent = '实时追踪中';
  }
  
  // ==================== 骨骼更新 ====================
  updateSkeleton() {
    if (!this.landmarks || !this.showSkeleton) {
      // 隐藏所有骨骼
      this.joints.forEach(j => j.visible = false);
      this.bones.forEach(b => b.visible = false);
      return;
    }
    
    // 平滑处理
    if (!this.smoothedLandmarks) {
      this.smoothedLandmarks = JSON.parse(JSON.stringify(this.landmarks));
    } else {
      for (let i = 0; i < this.landmarks.length; i++) {
        this.smoothedLandmarks[i].x += (this.landmarks[i].x - this.smoothedLandmarks[i].x) * this.smoothingFactor;
        this.smoothedLandmarks[i].y += (this.landmarks[i].y - this.smoothedLandmarks[i].y) * this.smoothingFactor;
        this.smoothedLandmarks[i].z += (this.landmarks[i].z - this.smoothedLandmarks[i].z) * this.smoothingFactor;
      }
    }
    
    const landmarks = this.smoothedLandmarks;
    const preset = CONFIG.PRESETS[this.currentPreset];
    
    // 更新关节位置
    for (let i = 0; i < Math.min(landmarks.length, this.joints.length); i++) {
      const lm = landmarks[i];
      const joint = this.joints[i];
      
      if (lm.visibility > 0.5) {
        // 转换坐标：MediaPipe -> Three.js
        const x = (0.5 - lm.x) * 2;  // 水平翻转
        const y = (0.5 - lm.y) * 2;  // 垂直翻转
        const z = -lm.z * 0.5;       // 深度
        
        joint.position.set(x, y, z);
        joint.visible = preset.skeleton.visible;
        
        // 主要关节显示更大
        const isMajor = CONFIG.MAJOR_JOINTS.includes(i);
        const scale = isMajor ? 1.5 : 1.0;
        joint.scale.setScalar(scale);
      } else {
        joint.visible = false;
      }
    }
    
    // 更新骨骼连接
    CONFIG.BODY_CONNECTIONS.forEach((conn, index) => {
      const [startIdx, endIdx] = conn;
      const startLm = landmarks[startIdx];
      const endLm = landmarks[endIdx];
      const bone = this.bones[index];
      
      if (startLm && endLm && startLm.visibility > 0.5 && endLm.visibility > 0.5) {
        const startPos = new THREE.Vector3(
          (0.5 - startLm.x) * 2,
          (0.5 - startLm.y) * 2,
          -startLm.z * 0.5
        );
        const endPos = new THREE.Vector3(
          (0.5 - endLm.x) * 2,
          (0.5 - endLm.y) * 2,
          -endLm.z * 0.5
        );
        
        // 计算骨骼位置和方向
        const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(endPos, startPos);
        const length = direction.length();
        
        bone.position.copy(midPoint);
        bone.scale.set(1, length, 1);
        bone.lookAt(endPos);
        bone.rotateX(Math.PI / 2);
        bone.visible = preset.skeleton.visible;
      } else {
        bone.visible = false;
      }
    });
    
    // 更新手部
    this.updateHands();
    
    // 更新信息面板
    this.updateInfoPanel();
  }
  
  updateHands() {
    if (!this.handLandmarks) {
      this.leftHandJoints.forEach(j => j.visible = false);
      this.leftHandBones.forEach(b => b.visible = false);
      this.rightHandJoints.forEach(j => j.visible = false);
      this.rightHandBones.forEach(b => b.visible = false);
      return;
    }
    
    const preset = CONFIG.PRESETS[this.currentPreset];
    
    this.handLandmarks.forEach(hand => {
      const isLeft = hand.handedness === 'Left';
      const joints = isLeft ? this.leftHandJoints : this.rightHandJoints;
      const bones = isLeft ? this.leftHandBones : this.rightHandBones;
      const landmarks = hand.landmarks;
      
      // 更新手部关节
      for (let i = 0; i < Math.min(landmarks.length, joints.length); i++) {
        const lm = landmarks[i];
        const joint = joints[i];
        
        const x = (0.5 - lm.x) * 2;
        const y = (0.5 - lm.y) * 2;
        const z = -lm.z * 0.5;
        
        joint.position.set(x, y, z);
        joint.visible = preset.skeleton.visible;
      }
      
      // 更新手部骨骼连接
      CONFIG.HAND_CONNECTIONS.forEach((conn, index) => {
        const [startIdx, endIdx] = conn;
        if (startIdx < landmarks.length && endIdx < landmarks.length) {
          const startLm = landmarks[startIdx];
          const endLm = landmarks[endIdx];
          const bone = bones[index];
          
          if (bone) {
            const startPos = new THREE.Vector3(
              (0.5 - startLm.x) * 2,
              (0.5 - startLm.y) * 2,
              -startLm.z * 0.5
            );
            const endPos = new THREE.Vector3(
              (0.5 - endLm.x) * 2,
              (0.5 - endLm.y) * 2,
              -endLm.z * 0.5
            );
            
            const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
            const direction = new THREE.Vector3().subVectors(endPos, startPos);
            const length = direction.length();
            
            bone.position.copy(midPoint);
            bone.scale.set(1, length, 1);
            bone.lookAt(endPos);
            bone.rotateX(Math.PI / 2);
            bone.visible = preset.skeleton.visible;
          }
        }
      });
      
      // 更新轨迹
      if (this.showTrails && preset.trails.enabled) {
        const wristPos = landmarks[0];
        const trailKey = isLeft ? 'leftHand' : 'rightHand';
        
        this.trails[trailKey].push({
          x: (0.5 - wristPos.x) * 2,
          y: (0.5 - wristPos.y) * 2,
          z: -wristPos.z * 0.5
        });
        
        // 保持轨迹长度
        if (this.trails[trailKey].length > 50) {
          this.trails[trailKey].shift();
        }
        
        this.updateTrailLine(trailKey);
      }
    });
  }
  
  updateTrailLine(hand) {
    const trail = this.trails[hand];
    const color = hand === 'leftHand' ? 0xff2d95 : 0x00f0ff;
    
    // 移除旧的轨迹线
    if (this.trailLines[hand]) {
      this.scene.remove(this.trailLines[hand]);
      this.trailLines[hand].geometry.dispose();
      this.trailLines[hand].material.dispose();
    }
    
    if (trail.length < 2) return;
    
    // 创建新的轨迹线
    const points = trail.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      linewidth: 2
    });
    
    this.trailLines[hand] = new THREE.Line(geometry, material);
    this.scene.add(this.trailLines[hand]);
  }
  
  // ==================== 粒子更新 ====================
  updateParticles() {
    if (!this.particles || !this.showParticles) {
      if (this.particles) this.particles.visible = false;
      return;
    }
    
    this.particles.visible = true;
    
    const positions = this.particles.geometry.attributes.position.array;
    const count = positions.length / 3;
    
    // 获取目标位置（手腕）
    let leftTarget = null;
    let rightTarget = null;
    
    if (this.smoothedLandmarks) {
      // 左手腕 (15)
      const leftWrist = this.smoothedLandmarks[15];
      if (leftWrist && leftWrist.visibility > 0.5) {
        leftTarget = new THREE.Vector3(
          (0.5 - leftWrist.x) * 2,
          (0.5 - leftWrist.y) * 2,
          -leftWrist.z * 0.5
        );
      }
      
      // 右手腕 (16)
      const rightWrist = this.smoothedLandmarks[16];
      if (rightWrist && rightWrist.visibility > 0.5) {
        rightTarget = new THREE.Vector3(
          (0.5 - rightWrist.x) * 2,
          (0.5 - rightWrist.y) * 2,
          -rightWrist.z * 0.5
        );
      }
    }
    
    // 更新粒子位置
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const velocity = this.particleVelocities[i];
      
      // 选择目标（一半粒子追左手，一半追右手）
      const target = i < count / 2 ? leftTarget : rightTarget;
      
      if (target) {
        // 计算吸引力
        const dx = target.x - positions[idx];
        const dy = target.y - positions[idx + 1];
        const dz = target.z - positions[idx + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist > 0.1) {
          const force = 0.003;
          velocity.x += (dx / dist) * force;
          velocity.y += (dy / dist) * force;
          velocity.z += (dz / dist) * force;
        }
      }
      
      // 随机扰动
      velocity.x += (Math.random() - 0.5) * 0.001;
      velocity.y += (Math.random() - 0.5) * 0.001;
      velocity.z += (Math.random() - 0.5) * 0.001;
      
      // 阻尼
      velocity.x *= 0.98;
      velocity.y *= 0.98;
      velocity.z *= 0.98;
      
      // 限速
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
      if (speed > 0.05) {
        velocity.x = (velocity.x / speed) * 0.05;
        velocity.y = (velocity.y / speed) * 0.05;
        velocity.z = (velocity.z / speed) * 0.05;
      }
      
      // 更新位置
      positions[idx] += velocity.x;
      positions[idx + 1] += velocity.y;
      positions[idx + 2] += velocity.z;
      
      // 边界检查
      if (Math.abs(positions[idx]) > 3) positions[idx] *= 0.9;
      if (Math.abs(positions[idx + 1]) > 3) positions[idx + 1] *= 0.9;
      if (Math.abs(positions[idx + 2]) > 3) positions[idx + 2] *= 0.9;
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
  
  // ==================== 信息面板更新 ====================
  updateInfoPanel() {
    if (!this.showInfo || !this.smoothedLandmarks) return;
    
    const landmarks = this.smoothedLandmarks;
    
    // 左手高度
    const leftWrist = landmarks[15];
    const leftShoulder = landmarks[11];
    if (leftWrist && leftShoulder) {
      const leftHeight = Math.max(0, Math.min(1, (leftShoulder.y - leftWrist.y) * 2));
      const el = document.getElementById('leftHandHeight');
      if (el) el.textContent = leftHeight.toFixed(2);
    }
    
    // 右手高度
    const rightWrist = landmarks[16];
    const rightShoulder = landmarks[12];
    if (rightWrist && rightShoulder) {
      const rightHeight = Math.max(0, Math.min(1, (rightShoulder.y - rightWrist.y) * 2));
      const el = document.getElementById('rightHandHeight');
      if (el) el.textContent = rightHeight.toFixed(2);
    }
    
    // 身体倾斜
    if (leftShoulder && rightShoulder) {
      const tilt = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
      const tiltDeg = (tilt * 180 / Math.PI).toFixed(1);
      const el = document.getElementById('bodyTilt');
      if (el) el.textContent = tiltDeg + '°';
    }
  }
  
  // ==================== 预设切换 ====================
  switchPreset(presetId) {
    if (!CONFIG.PRESETS[presetId]) return;
    
    this.currentPreset = presetId;
    const preset = CONFIG.PRESETS[presetId];
    
    console.log(`🎨 切换预设: ${preset.name}`);
    
    // 更新材质颜色
    const primaryColor = new THREE.Color(preset.colors.primary);
    const secondaryColor = new THREE.Color(preset.colors.secondary);
    
    this.joints.forEach(joint => {
      if (joint.material) {
        joint.material.color = primaryColor;
        joint.material.emissive = primaryColor;
        joint.material.emissiveIntensity = preset.skeleton.emissive;
      }
    });
    
    this.bones.forEach(bone => {
      if (bone.material) {
        bone.material.color = secondaryColor;
        bone.material.emissive = secondaryColor;
        bone.material.emissiveIntensity = preset.skeleton.emissive * 0.7;
      }
    });
    
    // 更新Bloom参数
    if (this.bloomPass) {
      this.bloomPass.strength = preset.bloom.strength;
      this.bloomPass.radius = preset.bloom.radius;
      this.bloomPass.threshold = preset.bloom.threshold;
    }
    
    // 更新粒子
    this.showParticles = preset.particles.enabled;
    
    // 更新轨迹
    this.showTrails = preset.trails.enabled;
    if (!this.showTrails) {
      this.trails.leftHand = [];
      this.trails.rightHand = [];
    }
    
    // 更新UI按钮状态
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === String(presetId));
    });
  }
  
  // ==================== 事件绑定 ====================
  bindEvents() {
    // 控制按钮
    document.getElementById('toggleSkeletonBtn')?.addEventListener('click', () => {
      this.showSkeleton = !this.showSkeleton;
      document.getElementById('toggleSkeletonBtn').classList.toggle('active', this.showSkeleton);
    });
    
    document.getElementById('toggleParticlesBtn')?.addEventListener('click', () => {
      this.showParticles = !this.showParticles;
      document.getElementById('toggleParticlesBtn').classList.toggle('active', this.showParticles);
    });
    
    document.getElementById('toggleTrailsBtn')?.addEventListener('click', () => {
      this.showTrails = !this.showTrails;
      document.getElementById('toggleTrailsBtn').classList.toggle('active', this.showTrails);
      if (!this.showTrails) {
        this.trails.leftHand = [];
        this.trails.rightHand = [];
      }
    });
    
    document.getElementById('toggleBloomBtn')?.addEventListener('click', () => {
      this.showBloom = !this.showBloom;
      document.getElementById('toggleBloomBtn').classList.toggle('active', this.showBloom);
      if (this.bloomPass) {
        this.bloomPass.enabled = this.showBloom;
      }
    });
    
    document.getElementById('toggleInfoBtn')?.addEventListener('click', () => {
      this.showInfo = !this.showInfo;
      document.getElementById('toggleInfoBtn').classList.toggle('active', this.showInfo);
      document.getElementById('infoPanel')?.classList.toggle('hidden', !this.showInfo);
    });
    
    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
    
    // 预设按钮
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetId = parseInt(btn.dataset.preset);
        this.switchPreset(presetId);
      });
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '6') {
        this.switchPreset(parseInt(e.key));
      }
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    });
  }
  
  initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursorDot');
    
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX - 10 + 'px';
      cursor.style.top = e.clientY - 10 + 'px';
      cursorDot.style.left = e.clientX - 2 + 'px';
      cursorDot.style.top = e.clientY - 2 + 'px';
    });
    
    document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.borderColor = '#ff2d95';
      });
      btn.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = '#00f0ff';
      });
    });
  }
  
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }
  
  // ==================== 渲染循环 ====================
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const now = Date.now();
    const delta = now - this.lastFrameTime;
    
    // 帧率限制
    if (delta < 1000 / CONFIG.targetFPS) return;
    this.lastFrameTime = now;
    
    // 更新场景
    this.updateSkeleton();
    this.updateParticles();
    
    // 渲染
    if (this.showBloom && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    
    // FPS计数
    this.fpsCounter.frames++;
    if (now - this.fpsCounter.lastTime >= 1000) {
      this.fpsCounter.fps = this.fpsCounter.frames;
      this.fpsCounter.frames = 0;
      this.fpsCounter.lastTime = now;
      
      const fpsDisplay = document.getElementById('fpsDisplay');
      if (fpsDisplay) {
        fpsDisplay.textContent = `FPS: ${this.fpsCounter.fps}`;
      }
    }
  }
}

// ==================== 启动应用 ====================
window.addEventListener('load', () => {
  console.log('🎭 Cyber Stage 启动中...');
  new CyberStageApp();
});
