/**
 * TouchOSCMapper - 观众触摸交互的 OSC 映射引擎
 * 
 * 功能：
 * 1. 接收原始触摸数据
 * 2. 计算复合参数（能量、混沌度等）
 * 3. 应用映射配置（缩放、限幅、平滑）
 * 4. 输出 OSC 消息数组
 */

import { getAllEnabledMappings } from './audienceMappingConfig.js';

export default class TouchOSCMapper {
    constructor() {
        this.mappings = getAllEnabledMappings();
        this.smoothedValues = new Map(); // 存储平滑后的值
        this.lastDirection = 0;          // 上一次的方向（用于计算混沌度）
        this.lastUpdateTime = Date.now();
        this.touchHistory = [];          // 触摸历史（用于计算复合参数）
        
        console.log(`🎛️  TouchOSCMapper 初始化完成，加载 ${this.mappings.length} 个映射`);
        
        // 监听配置同步事件
        this.setupConfigSyncListener();
    }
    
    /**
     * 设置配置同步监听器
     */
    setupConfigSyncListener() {
        window.addEventListener('audienceMappingConfigUpdated', (e) => {
            if (e.detail && e.detail.mappings) {
                this.updateMappingsFromConfig(e.detail);
            }
        });
        
        // 初始化时检查是否有保存的配置
        this.loadSavedConfig();
    }
    
    /**
     * 加载保存的配置
     */
    loadSavedConfig() {
        try {
            const saved = localStorage.getItem('osc_audience_mapping_config');
            if (saved) {
                const config = JSON.parse(saved);
                if (config.mappings) {
                    this.updateMappingsFromConfig(config);
                    console.log('📂 已加载保存的映射配置');
                }
            }
        } catch (e) {
            console.warn('加载保存配置失败:', e);
        }
    }
    
    /**
     * 从编辑器配置更新映射
     * @param {Object} config - 编辑器配置对象
     */
    updateMappingsFromConfig(config) {
        if (!config.mappings || !Array.isArray(config.mappings)) {
            console.warn('⚠️ 无效的映射配置');
            return;
        }
        
        console.log('🔄 更新映射配置...');
        
        // 转换编辑器配置格式为内部映射格式
        this.mappings = config.mappings
            .filter(m => m.enabled && m.oscAddress)
            .map(m => {
                // 处理多地址（逗号分隔）
                let oscAddr = m.oscAddress;
                if (typeof m.oscAddress === 'string' && m.oscAddress.includes(',')) {
                    oscAddr = m.oscAddress.split(',').map(a => a.trim());
                }
                
                return {
                    key: m.id,
                    group: 'custom',
                    oscAddress: oscAddr,
                    scale: m.inputRange,
                    target: m.outputRange,
                    smooth: m.smooth,
                    smoothFactor: m.smoothFactor,
                    enabled: true
                };
            });
        
        // 清除平滑值缓存
        this.smoothedValues.clear();
        
        console.log(`✅ 映射配置已更新，${this.mappings.length} 个活跃映射`);
    }

    /**
     * 处理触摸数据并生成 OSC 消息
     * @param {Object} touchData - 原始触摸数据
     * @returns {Array} OSC 消息数组 [{address, value}, ...]
     */
    process(touchData) {
        const oscMessages = [];
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // 秒
        this.lastUpdateTime = now;

        // 1. 提取和计算所有参数
        const params = this.extractParameters(touchData, deltaTime);

        // 检测触摸阶段（用于屏幕键盘等触发型映射）
        const isTouchStart = (touchData.phase === 'start');

        // 2. 应用每个映射
        for (const mapping of this.mappings) {
            if (!mapping.enabled) continue;

            // 🎹 屏幕键盘特殊处理：只在触摸开始时触发
            if (mapping.key === 'screen_keyboard_note') {
                if (!isTouchStart) {
                    // 不是触摸开始，跳过这个映射
                    continue;
                }
            }

            const paramValue = params[mapping.key];
            if (paramValue === undefined) continue;

            // 应用缩放和限幅
            let mappedValue = this.applyScaling(paramValue, mapping.scale, mapping.target);

            // 应用平滑
            if (mapping.smooth) {
                mappedValue = this.applySmoothing(mapping.key, mappedValue, mapping.smoothFactor);
            }

            // 🎹 判断是否是一次性触发类型（屏幕键盘等）
            const isOneShot = (mapping.key === 'screen_keyboard_note');

            // 生成 OSC 消息（支持多个地址）
            if (Array.isArray(mapping.oscAddress)) {
                // 数组：同一个值发送到多个地址
                mapping.oscAddress.forEach(addr => {
                    oscMessages.push({
                        address: addr,
                        value: mappedValue,
                        oneShot: isOneShot  // 标记为一次性触发
                    });
                });
            } else {
                // 单个地址
                oscMessages.push({
                    address: mapping.oscAddress,
                    value: mappedValue,
                    oneShot: isOneShot  // 标记为一次性触发
                });
            }
        }

        return oscMessages;
    }

    /**
     * 从触摸数据中提取所有参数（包括计算复合参数）
     */
    extractParameters(touchData, deltaTime) {
        const params = {};
        
        // === 基础参数 ===
        params.position_x = touchData.position?.x || 0.5;
        params.position_y = touchData.position?.y || 0.5;
        params.position_y_inverted = 1 - params.position_y;
        
        params.intensity = touchData.intensity || 0;
        params.velocity = touchData.velocity || 0;
        params.distance = touchData.distance || 0;
        params.direction = touchData.direction || 0;
        
        // === 屏幕键盘参数（触摸位置 → MIDI 音符）===
        // 只在触摸开始时触发
        const isTouchStart = (touchData.phase === 'start');
        params.touch_trigger = isTouchStart ? 1.0 : 0.0;
        
        // 计算 MIDI 音符值（基于 X 和 Y 轴位置）
        // X 轴：控制同一八度内的半音（12个音符）
        // Y 轴：控制八度高低（5个八度范围）
        // 覆盖范围：C2(36) 到 B6(95)，共60个音符
        params.screen_keyboard_note = this.calculateMIDINoteXY(params.position_x, params.position_y_inverted);
        
        // === 手势特定参数 ===
        const gesture = touchData.gesture || 'idle';
        params.swipe_up = (gesture === 'swipe_up') ? params.intensity : 0;
        params.swipe_down = (gesture === 'swipe_down') ? params.intensity : 0;
        params.swipe_left = (gesture === 'swipe_left') ? params.intensity : 0;
        params.swipe_right = (gesture === 'swipe_right') ? params.intensity : 0;

        // === 多指参数 ===
        params.finger_count = touchData.fingerCount || 1;
        
        // 手指分散度（如果有多个触摸点）
        if (touchData.touchPoints && touchData.touchPoints.length > 1) {
            params.finger_spread = this.calculateFingerSpread(touchData.touchPoints);
            params.two_finger_distance = this.calculateTwoFingerDistance(touchData.touchPoints);
            
            const centroid = this.calculateCentroid(touchData.touchPoints);
            params.finger_centroid_x = centroid.x;
            params.finger_centroid_y = centroid.y;
        } else {
            params.finger_spread = 0;
            params.two_finger_distance = 0;
            params.finger_centroid_x = params.position_x;
            params.finger_centroid_y = params.position_y;
        }

        // === 复合计算参数 ===
        // 手势能量 = 速度 × 强度
        params.gesture_energy = params.velocity * params.intensity;
        
        // 混沌因子 = 方向变化率
        const directionChange = Math.abs(params.direction - this.lastDirection);
        params.chaos_factor = (deltaTime > 0) ? (directionChange / deltaTime) : 0;
        this.lastDirection = params.direction;
        
        // 触摸压力（模拟）= 速度^0.5 * 强度（非线性）
        params.touch_pressure = Math.sqrt(params.velocity) * params.intensity;
        
        // 活动指数 = 综合评分
        params.activity_index = this.calculateActivityIndex(params);

        return params;
    }

    /**
     * 计算 MIDI 音符值（基于屏幕 X 和 Y 位置）
     * 
     * 设计：将整个屏幕映射为一个巨大的虚拟键盘
     * - X 轴（水平）：控制半音位置（0-11，代表一个八度内的12个半音）
     * - Y 轴（垂直）：控制八度高低（5个八度范围）
     * 
     * 音符范围：C2(36) 到 B6(95)，共5个八度 = 60个半音
     * 
     * 屏幕布局示意：
     * ┌─────────────────────────────────┐
     * │  高音区 (Y=1.0)   B6  A#6  A6  │  ← 顶部
     * │                                  │
     * │  中音区 (Y=0.5)   C4  D4  E4   │  ← 中央
     * │                                  │
     * │  低音区 (Y=0.0)   C2  D2  E2   │  ← 底部
     * └─────────────────────────────────┘
     *    左 (X=0)              右 (X=1)
     * 
     * @param {number} x - 屏幕 X 位置 (0-1)
     * @param {number} y - 屏幕 Y 位置，已反转 (0-1, 0=底部低音, 1=顶部高音)
     * @returns {number} MIDI 音符编号 (36-95)
     */
    calculateMIDINoteXY(x, y) {
        // 基础音符：C2 = 36 (MIDI 编号)
        const baseNote = 36;
        
        // Y 轴：决定八度（5个八度，每个八度12个半音）
        const octaveCount = 5;  // 从 C2 到 C7 的5个完整八度
        const octave = Math.floor(y * octaveCount);  // 0-4
        
        // X 轴：决定该八度内的半音位置（0-11）
        // 12个半音：C, C#, D, D#, E, F, F#, G, G#, A, A#, B
        const semitone = Math.floor(x * 12);  // 0-11
        
        // 计算最终音符
        // 音符 = 基础音符 + (八度 × 12) + 半音
        const midiNote = baseNote + (octave * 12) + semitone;
        
        // 限制在 MIDI 范围内 (36-95)
        return Math.max(36, Math.min(95, midiNote));
    }

    /**
     * 计算手指分散度（多点间的平均距离）
     */
    calculateFingerSpread(touchPoints) {
        if (touchPoints.length < 2) return 0;
        
        let totalDistance = 0;
        let pairCount = 0;
        
        for (let i = 0; i < touchPoints.length; i++) {
            for (let j = i + 1; j < touchPoints.length; j++) {
                const dx = (touchPoints[i].x - touchPoints[j].x) * window.innerWidth;
                const dy = (touchPoints[i].y - touchPoints[j].y) * window.innerHeight;
                totalDistance += Math.sqrt(dx * dx + dy * dy);
                pairCount++;
            }
        }
        
        return pairCount > 0 ? totalDistance / pairCount : 0;
    }

    /**
     * 计算双指距离
     */
    calculateTwoFingerDistance(touchPoints) {
        if (touchPoints.length < 2) return 0;
        
        const dx = (touchPoints[0].x - touchPoints[1].x) * window.innerWidth;
        const dy = (touchPoints[0].y - touchPoints[1].y) * window.innerHeight;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 计算多点中心（重心）
     */
    calculateCentroid(touchPoints) {
        if (touchPoints.length === 0) return { x: 0.5, y: 0.5 };
        
        let sumX = 0, sumY = 0;
        for (const point of touchPoints) {
            sumX += point.x;
            sumY += point.y;
        }
        
        return {
            x: sumX / touchPoints.length,
            y: sumY / touchPoints.length
        };
    }

    /**
     * 计算活动指数（综合评分）
     */
    calculateActivityIndex(params) {
        // 加权综合：速度40% + 强度30% + 手指数20% + 能量10%
        return (
            params.velocity * 0.4 +
            params.intensity * 0.3 +
            (params.finger_count / 5) * 0.2 +
            params.gesture_energy * 0.1
        ) * 10; // 放大到 0-10 范围
    }

    /**
     * 应用缩放和映射
     * @param {number} value - 输入值
     * @param {Array} scale - 输入范围 [min, max]
     * @param {Array} target - 输出范围 [min, max]
     * @returns {number} 映射后的值
     */
    applyScaling(value, scale, target) {
        const [scaleMin, scaleMax] = scale;
        const [targetMin, targetMax] = target;
        
        // 归一化到 0-1
        let normalized = (value - scaleMin) / (scaleMax - scaleMin);
        
        // 限幅
        normalized = Math.max(0, Math.min(1, normalized));
        
        // 映射到目标范围
        return targetMin + normalized * (targetMax - targetMin);
    }

    /**
     * 应用平滑（低通滤波）
     * @param {string} key - 参数键名
     * @param {number} newValue - 新值
     * @param {number} factor - 平滑系数 (0-1, 越小越平滑)
     * @returns {number} 平滑后的值
     */
    applySmoothing(key, newValue, factor) {
        const lastValue = this.smoothedValues.get(key);
        
        if (lastValue === undefined) {
            // 第一次，直接使用新值
            this.smoothedValues.set(key, newValue);
            return newValue;
        }
        
        // 指数移动平均
        const smoothed = lastValue * (1 - factor) + newValue * factor;
        this.smoothedValues.set(key, smoothed);
        
        return smoothed;
    }

    /**
     * 重新加载映射配置（热重载）
     */
    reloadMappings() {
        this.mappings = getAllEnabledMappings();
        console.log(`🔄 映射已重载: ${this.mappings.length} 个`);
    }

    /**
     * 重置所有平滑状态
     */
    reset() {
        this.smoothedValues.clear();
        this.lastDirection = 0;
        this.touchHistory = [];
        console.log('🔄 TouchOSCMapper 状态已重置');
    }
}
