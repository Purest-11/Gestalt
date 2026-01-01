/**
 * MediaPipe 动作捕捉 - 简化版（无 Three.js）
 * 只保留核心功能：检测、参数计算、OSC 导出
 */

import { OSCExporter } from './OSCExporter.js';
import { DEFAULT_PRESET } from './mappingConfig.js';
import { initMappingEditorUI } from './MappingEditorUI.js';

class SimpleMocapApp {
  constructor(options = {}) {
    console.log('🔧 SimpleMocapApp 构造函数执行');
    
    // ✅ 这里只初始化非 DOM 的属性
    
    // MediaPipe
    this.poseLandmarker = null;
    this.handLandmarker = null;
    this.lastVideoTime = -1;
    this.results = null;
    this.handResults = null;

    // OSC 导出器
    this.oscExporter = null;

    // 状态
    this.isRunning = false;
    this.showSkeleton = true;
    this.showParams = false;
    this.fpsCounter = { frames: 0, lastTime: Date.now(), fps: 0 };

    // 获取演员 ID
    const urlParams = new URLSearchParams(window.location.search);
    this.performerId = parseInt(urlParams.get('performer') || '1');

    // ✅ DOM 相关的属性全部初始化为 null
    this.videoElement = null;
    this.canvasElement = null;
    this.loadingElement = null;
    this.errorElement = null;
    this.errorMessageElement = null;
    this.fpsElement = null;
    this.oscStatusElement = null;
    this.performerBadgeElement = null;
    this.retryBtn = null;
    this.loadingText = null;
    this.toggleSkeletonBtn = null;
    this.toggleParamsBtn = null;
    this.fullscreenBtn = null;
    this.paramsDisplay = null;
    this.paramsContent = null;
    this.canvasCtx = null;

    // ✅ 异步初始化 DOM
    this.initAsync();
  }

  async initAsync() {
    try {
      console.log('🔄 异步初始化开始...');
      
      // ✅ 等待更长时间，确保 DOM 完全加载
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('📦 开始加载 DOM 元素...');
      
      // 现在初始化 DOM 元素
      this.loadDOMElements();
      
      // 再等一下确保所有元素都可用
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 初始化应用
      await this.init();
    } catch (error) {
      console.error('❌ 异步初始化失败:', error);
      console.error('错误堆栈:', error.stack);
      // 即使 showError 失败也要捕获
      try {
        this.showError(error.message || '未知错误');
      } catch (e) {
        console.error('❌ showError 也失败了:', e);
        alert('初始化失败: ' + error.message);
      }
    }
  }

  loadDOMElements() {
    console.log('📦 加载 DOM 元素...');
    try {
      this.videoElement = document.getElementById('videoElement');
      this.canvasElement = document.getElementById('canvasElement');
      this.loadingElement = document.getElementById('loading');
      this.errorElement = document.getElementById('error');
      this.errorMessageElement = document.getElementById('errorMessage');
      this.fpsElement = document.getElementById('fps');
      this.oscStatusElement = document.getElementById('oscStatus');
      this.performerBadgeElement = document.getElementById('performerBadge');
      this.retryBtn = document.getElementById('retryBtn');
      this.loadingText = document.getElementById('loadingText');
      
      this.toggleSkeletonBtn = document.getElementById('toggleSkeletonBtn');
      this.toggleParamsBtn = document.getElementById('toggleParamsBtn');
      this.fullscreenBtn = document.getElementById('fullscreenBtn');
      this.paramsDisplay = document.getElementById('paramsDisplay');
      this.paramsContent = document.getElementById('paramsContent');

      // ✅ 检查关键 DOM 元素
      if (!this.videoElement) throw new Error('videoElement 未找到');
      if (!this.canvasElement) throw new Error('canvasElement 未找到');
      if (!this.loadingElement) throw new Error('loading 元素未找到');

      // 初始化 canvas context
      this.canvasCtx = this.canvasElement.getContext('2d');
      if (!this.canvasCtx) throw new Error('无法获取 canvas context');

      console.log('✅ DOM 元素全部加载成功');
    } catch (error) {
      console.error('❌ DOM 加载失败:', error);
      throw new Error('DOM 元素加载失败: ' + error.message);
    }
  }

  async init() {
    try {
      console.log('🚀 应用初始化中...');
      
      // 更新演员标识 / Update performer badge with i18n
      if (this.performerBadgeElement) {
        const performerText = window.i18n ? window.i18n.t('common.performer') : 'Performer';
        this.performerBadgeElement.textContent = `${performerText} ${this.performerId}`;
      }

      // 绑定事件
      this.bindEvents();

      // 初始化 OSC 导出器
      this.updateLoadingText('正在连接 OSC 服务器...');
      const urlParams = new URLSearchParams(window.location.search);
      const performerId = parseInt(urlParams.get('performer') || '1');
      
      let initialMappingPreset = DEFAULT_PRESET;
      if (performerId === 1) {
        initialMappingPreset = 'performer1_port_mode';
      } else if (performerId === 2) {
        initialMappingPreset = 'performer2_port_mode';
      }
      
      this.oscExporter = new OSCExporter(null, initialMappingPreset);
      
      // 监听观众数量更新
      this.setupAudienceListener();
      
      this.setupDebugInterface();
      
      setTimeout(() => {
        if (this.oscExporter.ws && this.oscExporter.ws.readyState === WebSocket.OPEN) {
          const connectedText = window.i18n ? window.i18n.t('common.connected') : 'Connected';
          this.oscStatusElement.textContent = `OSC ${connectedText}`;
          this.oscStatusElement.className = 'status connected';
        }
      }, 1000);

      // 初始化 MediaPipe
      this.updateLoadingText('正在加载 MediaPipe 模型...');
      await this.initMediaPipe();

      // 启动摄像头
      this.updateLoadingText('正在启动摄像头...');
      await this.startCamera();

      // 隐藏加载界面
      if (this.loadingElement) {
        this.loadingElement.classList.add('hidden');
      }
      
      // 开始检测循环
      this.isRunning = true;
      this.detectLoop();

      // 初始化映射编辑器 UI
      initMappingEditorUI();

      // 监听映射配置变化
      window.addEventListener('performerMappingUpdated', (e) => {
        if (this.oscExporter) {
          this.oscExporter.updateMappingFromEditor(e.detail);
        }
      });

      console.log('✅ 应用初始化完成');
    } catch (error) {
      console.error('❌ 初始化失败:', error);
      this.showError(error.message || '初始化失败');
    }
  }

  updateLoadingText(text) {
    if (this.loadingText) {
      this.loadingText.textContent = text;
    }
  }

  async initMediaPipe() {
    try {
      console.log('📥 导入 MediaPipe 库...');
      
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      console.log('✅ MediaPipe 库导入成功');
      console.log('🔧 初始化 WASM 运行环境...');

      // ✅ 关键：使用 FilesetResolver 创建 vision fileset
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      console.log('✅ WASM 环境初始化成功');
      console.log('🔧 初始化 PoseLandmarker...');

      // 使用本地模型文件
      const poseLandmarkerOptions = {
        baseOptions: {
          modelAssetPath: '/mocap/wasm/pose_landmarker_lite.task',
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      };

      this.poseLandmarker = await PoseLandmarker.createFromOptions(
        vision,
        poseLandmarkerOptions
      );

      console.log('✅ MediaPipe 初始化完成');
      // 初始化 HandLandmarker
const { HandLandmarker } = await import('@mediapipe/tasks-vision');
const handLandmarkerOptions = {
  baseOptions: {
    modelAssetPath: '/mocap/wasm/hand_landmarker.task',
    delegate: "GPU"
  },
  runningMode: "VIDEO",
  numHands: 2  // 最多检测 2 只手
};

this.handLandmarker = await HandLandmarker.createFromOptions(
  vision,
  handLandmarkerOptions
);

console.log('✅ HandLandmarker 初始化完成');

    } catch (error) {
      console.error('❌ MediaPipe 初始化失败:', error);
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
      throw new Error('MediaPipe 初始化失败: ' + error.message);
    }
  }

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (this.videoElement) {
        this.videoElement.srcObject = stream;
      }
      
      return new Promise((resolve) => {
        if (this.videoElement) {
          this.videoElement.onloadedmetadata = () => {
            this.videoElement.play();
            
            // 设置 canvas 大小
            if (this.canvasElement) {
              this.canvasElement.width = this.videoElement.videoWidth;
              this.canvasElement.height = this.videoElement.videoHeight;
            }
            
            console.log('✅ 摄像头已启动');
            resolve();
          };
        }
      });
    } catch (error) {
      console.error('摄像头启动失败:', error);
      throw new Error('无法访问摄像头，请确保已授予权限');
    }
  }

  detectLoop() {
    if (!this.isRunning) return;

    const now = performance.now();
    
    // 检测姿态
    if (this.videoElement && this.videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoElement.currentTime;
      
      if (this.poseLandmarker) {
        this.results = this.poseLandmarker.detectForVideo(this.videoElement, now);
      }
      
      
      if (this.handLandmarker) {
      this.handResults = this.handLandmarker.detectForVideo(this.videoElement, now);
      }
    }

    // 清空 canvas
    if (this.canvasCtx) {
      if (this.canvasElement) {
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      }
    }

    // 绘制骨骼（如果启用）
    if (this.showSkeleton && this.results && this.results.landmarks) {
      this.drawSkeleton();
    }

    // 导出 OSC 数据 - 姿态
    if (this.results && this.oscExporter) {
      this.oscExporter.exportPoseData(this.results, this.handResults);
    }

    // 更新参数显示
    if (this.showParams) {
      this.updateParamsDisplay();
    }

    // 更新 FPS
    this.updateFPS();

    // 继续循环
    requestAnimationFrame(() => this.detectLoop());
  }

  drawSkeleton() {
    if (!this.results || !this.results.landmarks) return;

    this.results.landmarks.forEach((landmarks, personIndex) => {

      if (personIndex !== 0) return;

      const color = personIndex === 0 ? '#ff6b9d' : '#4ecdc4'; // 粉红色和青色

      // 绘制连接线
      const connections = [
        // 躯干
        [11, 12], [11, 23], [12, 24], [23, 24],
        // 右臂
        [12, 14], [14, 16],
        // 左臂
        [11, 13], [13, 15],
        // 右腿
        [24, 26], [26, 28],
        // 左腿
        [23, 25], [25, 27]
      ];

      if (this.canvasCtx) {
        this.canvasCtx.strokeStyle = color;
        this.canvasCtx.lineWidth = 3;

        connections.forEach(([start, end]) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          
          if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(
              (1 - startPoint.x) * this.canvasElement.width,  // ← 改成这样
              startPoint.y * this.canvasElement.height
            );
            this.canvasCtx.lineTo(
              (1 - endPoint.x) * this.canvasElement.width,   // ← 改成这样
              endPoint.y * this.canvasElement.height
            );
            this.canvasCtx.stroke();
          }
        });
        
        // 绘制关键点
        this.canvasCtx.fillStyle = color;
        landmarks.forEach((landmark) => {
          if (landmark && landmark.visibility > 0.5) {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
              (1 - landmark.x) * this.canvasElement.width,  // ← 改成这样
              landmark.y * this.canvasElement.height,
              5,
              0,
              2 * Math.PI
            );
            this.canvasCtx.fill();
          }
        });
      }
    });
  }

  // Get i18n text helper
  getI18nText(key, fallback) {
    if (window.i18n && window.i18n.t) {
      const text = window.i18n.t(key);
      return text !== key ? text : fallback;
    }
    return fallback;
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
      if (this.paramsContent) {
        const noBodyText = isZh ? '未检测到人体' : 'No body detected';
        this.paramsContent.innerHTML = `<div style="color: #999;">${noBodyText}</div>`;
      }
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

      if (personIndex !== 0) return;
      
      html += `<div style="margin-bottom: 10px; color: #667eea; font-weight: bold;">${labels.person} ${personIndex + 1}</div>`;
      
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

    if (this.paramsContent) {
      this.paramsContent.innerHTML = html;
    }
  }

  updateFPS() {
    this.fpsCounter.frames++;
    const now = Date.now();
    const elapsed = now - this.fpsCounter.lastTime;

    if (elapsed >= 1000) {
      this.fpsCounter.fps = Math.round((this.fpsCounter.frames * 1000) / elapsed);
      if (this.fpsElement) {
        this.fpsElement.textContent = `FPS: ${this.fpsCounter.fps}`;
      }
      this.fpsCounter.frames = 0;
      this.fpsCounter.lastTime = now;
    }
  }

  /**
   * 监听观众数量更新
   */
  setupAudienceListener() {
    if (this.oscExporter && this.oscExporter.ws) {
      this.oscExporter.ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'audience_count') {
            // 更新观众数量显示（如果有对应的 UI 元素）
            const audienceCountElement = document.getElementById('audienceCountBadge');
            if (audienceCountElement) {
              audienceCountElement.textContent = `👥 观众: ${data.count}`;
            }
            console.log('👥 观众数量:', data.count);
          }
        } catch (error) {
          // 忽略解析错误
        }
      });
    }
  }

  /**
   * 设置调试接口
   */
  setupDebugInterface() {
    window.OSCExporterDebug = {
      setPreset: (presetName) => {
        if (this.oscExporter) {
          this.oscExporter.switchPreset(presetName);
        } else {
          console.warn('OSCExporter 未初始化，无法切换预设');
        }
      },
      getConfig: () => {
        if (this.oscExporter) {
          return this.oscExporter.mappingConfig;
        } else {
          return null;
        }
      },
      printStatus: () => {
        if (this.oscExporter) {
          this.oscExporter.printCurrentPreset();
        } else {
          console.warn('OSCExporter 未初始化，无法打印状态');
        }
      },
      toggleMapping: (paramName, enabled) => {
        if (this.oscExporter) {
          this.oscExporter.toggleMapping(paramName, enabled);
        } else {
          console.warn('OSCExporter 未初始化，无法切换映射');
        }
      },
      updateTarget: (paramName, targetRange) => {
        if (this.oscExporter) {
          this.oscExporter.updateMappingTarget(paramName, targetRange);
        } else {
          console.warn('OSCExporter 未初始化，无法更新目标');
        }
      },
      getAvailablePresets: () => {
        if (this.oscExporter) {
          return this.oscExporter.getAvailablePresets();
        } else {
          return [];
        }
      }
    };
    
    console.log('\n�� 调试接口已暴露到 window.OSCExporterDebug');
    console.log('   在浏览器控制台中可用以下命令:');
    console.log('   - OSCExporterDebug.setPreset(presetName)  // 切换映射预设');
    console.log('   - OSCExporterDebug.getConfig()           // 获取当前配置');
    console.log('   - OSCExporterDebug.printStatus()         // 打印当前状态');
    console.log('   - OSCExporterDebug.toggleMapping(name, enabled)');
    console.log('   - OSCExporterDebug.updateTarget(name, range)');
    console.log('');
  }

  bindEvents() {
    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => {
        location.reload();
      });
    }

    if (this.toggleSkeletonBtn) {
      this.toggleSkeletonBtn.addEventListener('click', () => {
        this.showSkeleton = !this.showSkeleton;
        this.toggleSkeletonBtn.classList.toggle('active', this.showSkeleton);
      });
    }

    if (this.toggleParamsBtn) {
      this.toggleParamsBtn.addEventListener('click', () => {
        this.showParams = !this.showParams;
        if (this.paramsDisplay) {
          this.paramsDisplay.classList.toggle('hidden', !this.showParams);
        }
        this.toggleParamsBtn.classList.toggle('active', this.showParams);
      });
    }

    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });
    }
  }

  showError(message) {
    if (this.errorMessageElement) {
      this.errorMessageElement.textContent = message;
    }
    if (this.loadingElement) {
      this.loadingElement.classList.add('hidden');
    }
    if (this.errorElement) {
      this.errorElement.classList.remove('hidden');
    }
  }
}

/**
 * 修复后的初始化代码 - 复制到 mocap-simple.js 的末尾
 */

// 完全重写初始化逻辑，确保万无一失
console.log('mocap-simple.js module loaded');

// 等待页面完全加载
window.addEventListener('load', () => {
  console.log('Window load event fired');
  
  // 再延迟一点，确保所有资源都准备好
  setTimeout(() => {
    console.log('Starting SimpleMocapApp initialization...');
    try {
      const app = new SimpleMocapApp();
      console.log('SimpleMocapApp created successfully');
    } catch (error) {
      console.error('FATAL: Failed to create SimpleMocapApp:', error);
      console.error('Error stack:', error.stack);
      alert('初始化失败: ' + error.message + '\n请检查 Console 获取详细信息');
    }
  }, 200);
});

