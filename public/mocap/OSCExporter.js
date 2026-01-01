/**
 * OSCExporter.js
 * 负责将 MediaPipe 追踪数据转换为 OSC 消息并通过 WebSocket 发送
 * 支持灵活的参数映射配置
 */

import { 
  DEFAULT_PRESET,
  getPreset, 
  getPresetsForPerformer,
  scaleValue, 
  smoothValue,
  printMappingConfig
} from './mappingConfig.js';

export class OSCExporter {
  constructor(wsUrl = null, mappingPreset = DEFAULT_PRESET) {
    this.ws = null;
    // 自动检测 WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.wsUrl = wsUrl || `${protocol}//${window.location.host}`;
    
    // 从 URL 参数获取演员 ID（默认为 1）
    const urlParams = new URLSearchParams(window.location.search);
    this.performerId = parseInt(urlParams.get('performer') || '1');
    
    // 加载映射配置
    this.mappingPreset = mappingPreset;
    this.mappingConfig = getPreset(mappingPreset);
    this.smoothedValues = {};
    
    console.log(`🎭 OSCExporter 初始化 - 演员 ID: ${this.performerId}`);
    console.log(`📡 WebSocket URL: ${this.wsUrl}`);
    console.log(`🗺️  映射预设: ${this.mappingConfig.name}`);
    console.log(`📋 说明: ${this.mappingConfig.description}`);
    
    this.connect();
    this.lastSendTime = {};
    this.throttleMs = 16; // 约 60 FPS（可调整）
    
    // 打印映射配置（调试用）
    if (urlParams.get('debug') === 'true') {
      console.log('\n=== 调试模式 ===');
      printMappingConfig();
      this.printCurrentPreset();
    }
  }

  /**
   * 从映射编辑器更新配置
   * @param {Object} editorConfig - 编辑器返回的配置对象
   */
  updateMappingFromEditor(editorConfig) {
    if (!editorConfig || !editorConfig.mappings) {
      console.warn('⚠️ Invalid editor config');
      return;
    }

    console.log('🔄 Updating mapping config from editor...');

    // 转换编辑器配置格式为内部映射格式
    const newMappings = {};
    
    editorConfig.mappings.forEach(m => {
      if (!m.enabled || !m.oscAddress) return;
      
      // 处理多地址（逗号分隔）
      let oscAddr = m.oscAddress;
      if (m.oscAddress.includes(',')) {
        oscAddr = m.oscAddress.split(',').map(a => a.trim());
      }
      
      newMappings[m.id] = {
        oscAddress: oscAddr,
        scale: m.inputRange,
        target: m.outputRange,
        smooth: m.smooth,
        smoothFactor: m.smoothFactor,
        enabled: true,
        description: ''
      };
    });

    // 更新当前映射配置
    this.mappingConfig = {
      ...this.mappingConfig,
      mappings: newMappings
    };

    // 清除平滑值缓存
    this.smoothedValues = {};

    console.log('✅ Mapping config updated:', Object.keys(newMappings).length, 'active mappings');
  }

  /**
   * 连接到 WebSocket 服务器
   */
  connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ OSC WebSocket 已连接');
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket 错误:', error);
      };
      
      this.ws.onclose = () => {
        console.warn('⚠️ WebSocket 已断开，5 秒后重连...');
        setTimeout(() => this.connect(), 5000);
      };
    } catch (error) {
      console.error('连接 WebSocket 失败:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * 发送 OSC 消息（带节流）
   */
  sendOSC(address, value) {
    // 节流：防止过度发送
    const now = Date.now();
    if (this.lastSendTime[address] && now - this.lastSendTime[address] < this.throttleMs) {
      return;
    }
    this.lastSendTime[address] = now;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // ✅ 判断是否为端口区分模式
      let finalAddress = address;
      if (this.mappingConfig.mode !== 'port_based') {
        // 如果不是端口模式，则添加 /performer{id} 前缀
        finalAddress = `/performer${this.performerId}${address}`;
      }
      // 如果是端口模式，直接使用地址（不添加前缀）

      const message = {
        type: 'mediapipe',
        address: finalAddress,
        value: Array.isArray(value) ? value : [value],
        timestamp: now
      };
      
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * 发送人体关键点数据
   */
  exportPoseData(poseResults, handResults = null) {
    if (!poseResults || !poseResults.landmarks || poseResults.landmarks.length === 0) {
      return;
    }

    poseResults.landmarks.forEach((landmarks, personIndex) => {
      // 如果这是演员自己的数据（person 0），使用映射发送参数
      if (personIndex === 0) {
        this.exportWithMapping(landmarks, personIndex, handResults);  // ✅ 传递手部数据
      }
      
      // 同时计算并发送完整的高级参数（用于调试或其他用途）
      this.exportAdvancedMetrics(landmarks, personIndex);
    });
  }

  /**
   * 使用映射配置发送参数
   */
  exportWithMapping(landmarks, personIndex, handData = null) {
    // 先计算所有高级参数（包括手部数据）
    const allMetrics = this.calculateAllMetrics(landmarks, handData);

    // 遍历映射配置中的每个参数
    Object.entries(this.mappingConfig.mappings).forEach(([paramName, mapping]) => {
      if (!mapping.enabled) {
        return;
      }

      const paramValue = allMetrics[paramName];
      if (paramValue === undefined) {
        console.warn(`⚠️ 未找到参数: ${paramName}`);
        return;
      }

      // 缩放值
      let scaledValue = scaleValue(paramValue, mapping.scale, mapping.target);

      // 如果启用平滑处理
      if (mapping.smooth) {
        const smoothFactor = mapping.smoothFactor || 0.2;
        const previousValue = this.smoothedValues[paramName];
        scaledValue = smoothValue(scaledValue, previousValue, smoothFactor);
        this.smoothedValues[paramName] = scaledValue;
      }

      // 支持多个地址
      if (Array.isArray(mapping.oscAddress)) {
        mapping.oscAddress.forEach(addr => {
          this.sendOSCDirect(addr, scaledValue);
        });
      } else {
        this.sendOSCDirect(mapping.oscAddress, scaledValue);
      }
    });
  }

  /**
   * 直接发送 OSC 消息（不添加 /performer 前缀）
   * 用于映射配置，因为配置中已经包含完整的 OSC 地址
   */
  sendOSCDirect(address, value) {
    // 节流：防止过度发送
    const now = Date.now();
    if (this.lastSendTime[address] && now - this.lastSendTime[address] < this.throttleMs) {
      return;
    }
    this.lastSendTime[address] = now;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'slider',  // 使用 slider 类型，这样不会被加 /performer 前缀
        address: address,  // 直接使用配置中的地址
        value: value
      };
      
      this.ws.send(JSON.stringify(message));
      
      // 调试日志
      console.log(`🎯 映射发送: ${address} = ${typeof value === 'number' ? value.toFixed(2) : value}`);
    }
  }

  /**
   * 计算所有高级参数（返回对象）
   */
  calculateAllMetrics(landmarks, handData = null) {
    const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
    const leftWristY = landmarks[15].y;
    const rightWristY = landmarks[16].y;

    const leftHandHeight = Math.max(0, Math.min(1, (shoulderY - leftWristY) * 2));
    const rightHandHeight = Math.max(0, Math.min(1, (shoulderY - rightWristY) * 2));
    const leftWristX = landmarks[15].x;
    const rightWristX = landmarks[16].x;
    const leftWristZ = landmarks[15].z;
    const rightWristZ = landmarks[16].z;
    const bodyTilt = this.calculateBodyTilt(landmarks);
    const armSpread = this.calculateArmSpread(landmarks);
    const legSpread = this.calculateLegSpread(landmarks);
    const bodyHeight = this.calculateBodyHeight(landmarks);
    const motionSpeed = this.calculateMotionSpeed(landmarks);
    const avgHandHeight = (leftHandHeight + rightHandHeight) / 2;
    const handDistance = Math.hypot(
      landmarks[15].x - landmarks[16].x,
      landmarks[15].y - landmarks[16].y,
      landmarks[15].z - landmarks[16].z
    );

    // ✅ 新增：手部参数初始化
    let leftHandOpenness = 0;
    let rightHandOpenness = 0;

    // 如果有手部数据，计算握拳程度
    if (handData && handData.landmarks && handData.landmarks.length > 0) {
      handData.landmarks.forEach((handLandmarks, index) => {
        const handedness = handData.handednesses?.[index]?.[0]?.categoryName || '';
        const openness = this.calculateHandOpenness(handLandmarks);
        
        if (handedness.toLowerCase() === 'left') {
          leftHandOpenness = openness;
        } else if (handedness.toLowerCase() === 'right') {
          rightHandOpenness = openness;
        }
      });
    }

    return {
      left_hand_height: leftHandHeight,
      right_hand_height: rightHandHeight,
      left_hand_x: leftWristX,
      right_hand_x: rightWristX,
      left_hand_z: leftWristZ,
      right_hand_z: rightWristZ,
      body_tilt: bodyTilt,
      arm_spread: armSpread,
      leg_spread: legSpread,
      body_height: bodyHeight,
      motion_speed: motionSpeed,
      avg_hand_height: avgHandHeight,
      hand_distance: Math.min(1, handDistance * 2),
      left_hand_openness: leftHandOpenness,  // ✅ 新增
      right_hand_openness: rightHandOpenness,  // ✅ 新增
    };
  }

  /**
   * 计算并发送高级参数
   */
  exportAdvancedMetrics(landmarks, personIndex) {
    // 1. 手部高度 (用肩膀作为参考点)
    const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
    const leftWristY = landmarks[15].y;
    const rightWristY = landmarks[16].y;
    
    // 归一化到 0-1（手在肩膀以下是 0，在肩膀以上越高值越大）
    const leftHandHeight = Math.max(0, Math.min(1, (shoulderY - leftWristY) * 2));
    const rightHandHeight = Math.max(0, Math.min(1, (shoulderY - rightWristY) * 2));

    this.sendOSC(`/body/person${personIndex}/left_hand_height`, leftHandHeight);
    this.sendOSC(`/body/person${personIndex}/right_hand_height`, rightHandHeight);

    // 2. 手部水平位置 (X 轴，0=左边，1=右边)
    const leftWristX = landmarks[15].x;
    const rightWristX = landmarks[16].x;
    
    this.sendOSC(`/body/person${personIndex}/left_hand_x`, leftWristX);
    this.sendOSC(`/body/person${personIndex}/right_hand_x`, rightWristX);

    // 3. 手部深度 (Z 轴)
    const leftWristZ = landmarks[15].z;
    const rightWristZ = landmarks[16].z;
    
    this.sendOSC(`/body/person${personIndex}/left_hand_z`, leftWristZ);
    this.sendOSC(`/body/person${personIndex}/right_hand_z`, rightWristZ);

    // 4. 身体倾斜度（肩膀线的角度）
    const bodyTilt = this.calculateBodyTilt(landmarks);
    this.sendOSC(`/body/person${personIndex}/body_tilt`, bodyTilt);

    // 5. 肢体张开度（手臂展开程度）
    const armSpread = this.calculateArmSpread(landmarks);
    this.sendOSC(`/body/person${personIndex}/arm_spread`, armSpread);

    // 6. 腿部张开度
    const legSpread = this.calculateLegSpread(landmarks);
    this.sendOSC(`/body/person${personIndex}/leg_spread`, legSpread);

    // 7. 身体中心高度（整体高度）
    const bodyHeight = this.calculateBodyHeight(landmarks);
    this.sendOSC(`/body/person${personIndex}/body_height`, bodyHeight);

    // 8. 动作速度（基于手腕的移动）
    const motionSpeed = this.calculateMotionSpeed(landmarks);
    this.sendOSC(`/body/person${personIndex}/motion_speed`, motionSpeed);

    // 9. 综合参数：左手和右手的平均高度
    const avgHandHeight = (leftHandHeight + rightHandHeight) / 2;
    this.sendOSC(`/body/person${personIndex}/avg_hand_height`, avgHandHeight);

    // 10. 综合参数：手部距离（左右手之间的距离）
    const handDistance = Math.hypot(
      landmarks[15].x - landmarks[16].x,
      landmarks[15].y - landmarks[16].y,
      landmarks[15].z - landmarks[16].z
    );
    this.sendOSC(`/body/person${personIndex}/hand_distance`, Math.min(1, handDistance * 2));
  }

  /**
   * 计算身体倾斜度（0.5 = 垂直，< 0.5 = 左倾，> 0.5 = 右倾）
   */
  calculateBodyTilt(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const angle = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
    // 归一化到 0-1
    return (angle + Math.PI) / (2 * Math.PI);
  }

  /**
   * 计算手臂张开度（0 = 手臂在身体两侧，1 = 完全展开）
   */
  calculateArmSpread(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    
    const shoulderWidth = Math.hypot(
      rightShoulder.x - leftShoulder.x,
      rightShoulder.y - leftShoulder.y
    );
    
    const armSpan = Math.hypot(
      rightWrist.x - leftWrist.x,
      rightWrist.y - leftWrist.y
    );
    
    // 归一化（arm span / shoulder width 的比例）
    return Math.min(1, armSpan / (shoulderWidth * 3));
  }

  /**
   * 计算腿部张开度
   */
  calculateLegSpread(landmarks) {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    
    const hipWidth = Math.hypot(
      rightHip.x - leftHip.x,
      rightHip.y - leftHip.y
    );
    
    const legSpan = Math.hypot(
      rightAnkle.x - leftAnkle.x,
      rightAnkle.y - leftAnkle.y
    );
    
    return Math.min(1, legSpan / (hipWidth * 2));
  }

  /**
   * 计算身体整体高度（0 = 蹲下，1 = 站直）
   */
  calculateBodyHeight(landmarks) {
    // 使用鼻子和脚踝的垂直距离
    const noseY = landmarks[0].y;
    const leftAnkleY = landmarks[27].y;
    const rightAnkleY = landmarks[28].y;
    const avgAnkleY = (leftAnkleY + rightAnkleY) / 2;
    
    // 垂直距离（越大说明站得越直）
    const height = avgAnkleY - noseY;
    
    // 归一化（假设最大高度为 1.0）
    return Math.max(0, Math.min(1, height));
  }

  /**
   * 计算动作速度（基于手腕位置变化）
   */
  calculateMotionSpeed(landmarks) {
    if (!this.lastLandmarks) {
      this.lastLandmarks = landmarks;
      return 0;
    }

    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const lastLeftWrist = this.lastLandmarks[15];
    const lastRightWrist = this.lastLandmarks[16];

    const leftSpeed = Math.hypot(
      leftWrist.x - lastLeftWrist.x,
      leftWrist.y - lastLeftWrist.y,
      leftWrist.z - lastLeftWrist.z
    );

    const rightSpeed = Math.hypot(
      rightWrist.x - lastRightWrist.x,
      rightWrist.y - lastRightWrist.y,
      rightWrist.z - lastRightWrist.z
    );

    this.lastLandmarks = landmarks;

    // 归一化（假设最大速度为 0.1）
    return Math.min(1, (leftSpeed + rightSpeed) * 5);
  }

  /**
   * 导出手部关键点数据
   */
  exportHandData(handResults) {
    if (!handResults || !handResults.landmarks || handResults.landmarks.length === 0) {
      return;
    }

    handResults.landmarks.forEach((landmarks, handIndex) => {
      const handedness = handResults.handednesses?.[handIndex]?.[0]?.categoryName || 'Unknown';
      const handLabel = handedness.toLowerCase(); // 'left' or 'right'

      // 1. 手腕位置
      const wrist = landmarks[0];
      this.sendOSC(`/hand/${handLabel}/wrist_x`, wrist.x);
      this.sendOSC(`/hand/${handLabel}/wrist_y`, wrist.y);
      this.sendOSC(`/hand/${handLabel}/wrist_z`, wrist.z);

      // 2. 食指尖位置
      const indexTip = landmarks[8];
      this.sendOSC(`/hand/${handLabel}/index_x`, indexTip.x);
      this.sendOSC(`/hand/${handLabel}/index_y`, indexTip.y);

      // 3. 手指张开度
      const fingerSpread = this.calculateFingerSpread(landmarks);
      this.sendOSC(`/hand/${handLabel}/finger_spread`, fingerSpread);

      // 4. 手掌开合度
      const handOpenness = this.calculateHandOpenness(landmarks);
      this.sendOSC(`/hand/${handLabel}/hand_openness`, handOpenness);
    });
  }

  /**
   * 计算手指张开度
   */
  calculateFingerSpread(landmarks) {
    const indexTip = landmarks[8];
    const pinkyTip = landmarks[20];
    
    const distance = Math.hypot(
      indexTip.x - pinkyTip.x,
      indexTip.y - pinkyTip.y
    );
    
    return Math.min(1, distance * 3);
  }

  /**
   * 计算手掌开合度
   */
  calculateHandOpenness(landmarks) {
    const palmCenter = landmarks[9];
    const fingerTips = [4, 8, 12, 16, 20];
    
    let sumDistance = 0;
    fingerTips.forEach(idx => {
      const tip = landmarks[idx];
      const distance = Math.hypot(
        tip.x - palmCenter.x,
        tip.y - palmCenter.y
      );
      sumDistance += distance;
    });
    
    const avgDistance = sumDistance / fingerTips.length;
    return Math.min(1, avgDistance * 4);
  }

  /**
   * 设置节流时间
   */
  setThrottle(ms) {
    this.throttleMs = ms;
  }

  /**
   * 切换映射预设
   */
  switchPreset(presetName) {
    this.mappingPreset = presetName;
    this.mappingConfig = getPreset(presetName);
    this.smoothedValues = {}; // 重置平滑值

    console.log(`🔄 已切换到映射预设: ${this.mappingConfig.name}`);
    console.log(`   说明: ${this.mappingConfig.description}`);

    this.printCurrentPreset();
  }

  /**
   * 打印当前映射配置
   */
  printCurrentPreset() {
    console.log(`\n📋 当前映射配置 (${this.mappingConfig.name}):`);
    Object.entries(this.mappingConfig.mappings).forEach(([param, mapping]) => {
      const status = mapping.enabled ? '✅' : '❌';
      console.log(`   ${status} ${param.padEnd(20)} → ${mapping.oscAddress}`);
      console.log(`      范围: [${mapping.scale.join(', ')}] → [${mapping.target.join(', ')}]`);
    });
  }

  /**
   * 获取所有可用的映射预设（针对当前演员）
   */
  getAvailablePresets() {
    return getPresetsForPerformer(this.performerId);
  }

  /**
   * 启用/禁用特定的映射
   */
  toggleMapping(paramName, enabled) {
    if (this.mappingConfig.mappings[paramName]) {
      this.mappingConfig.mappings[paramName].enabled = enabled;
      const status = enabled ? '✅ 已启用' : '❌ 已禁用';
      console.log(`${status}: ${paramName}`);
    }
  }

  /**
   * 更新映射的目标范围
   */
  updateMappingTarget(paramName, targetRange) {
    if (this.mappingConfig.mappings[paramName]) {
      this.mappingConfig.mappings[paramName].target = targetRange;
      console.log(`🔧 已更新 ${paramName} 的目标范围: [${targetRange.join(', ')}]`);
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * 暴露调试接口到全局对象（方便浏览器控制台调试）
 */
if (typeof window !== 'undefined') {
  window.OSCExporterDebug = {
    setPreset: null, // 会在 mocap-simple.js 中设置
    getConfig: null,
    printStatus: null,
    toggleMapping: null,
    updateTarget: null
  };
}

