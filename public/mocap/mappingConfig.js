/**
 * MediaPipe 参数到 OSC 控制器的映射配置
 * 支持多个映射预设，方便快速切换
 */

/**
 * 映射预设定义
 * 
 * 每个映射对象包含:
 * - name: 预设名称
 * - performerId: 针对特定演员（1 或 2），null 表示所有演员
 * - mappings: 参数映射字典
 *   - mediapikeParam: MediaPipe 参数名
 *   - oscAddress: 发送的 OSC 地址（不包含 /performer{id} 前缀，自动处理）
 *   - scale: [min, max] MediaPipe 参数范围
 *   - target: [min, max] OSC 目标范围
 *   - smooth: 是否启用平滑处理（低通滤波）
 *   - enabled: 是否启用此映射
 */

export const MAPPING_PRESETS = {
  // 演员 1 - 标准映射
  performer1_standard: {
    name: '演员 1 - 标准映射',
    performerId: 1,
    description: '左手高度 → VC, 右手高度 → VM, 左手X → CUTOFF1, 右手X → CUTOFF2',
    mappings: {
      'left_hand_height': {
        oscAddress: '/pigments1/VC',
        scale: [0, 1],           // MediaPipe 范围（0=肩膀下方，1=头部上方）
        target: [0, 127],        // OSC 目标范围（MIDI 值）
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,
        description: '左手高度 → Pigments1 人声音量'
      },
      'right_hand_height': {
        oscAddress: '/pigments1/VM',
        scale: [0, 1],
        target: [0, 127],
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,
        description: '右手高度 → Pigments1 芒种音量'
      },
      'left_hand_x': {
        oscAddress: '/pigments1/CUTOFF1',
        scale: [0, 1],           // MediaPipe 范围（0=左侧，1=右侧）
        target: [0, 127],        // OSC 目标范围
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,
        description: '左手水平位置 → Pigments1 滤波器 1'
      },
      'right_hand_x': {
        oscAddress: '/pigments1/CUTOFF2',
        scale: [0, 1],
        target: [0, 127],
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,
        description: '右手水平位置 → Pigments1 滤波器 2'
      }
    }
  },

  // 演员 1 - 创意映射（用于将来扩展）
  performer1_creative: {
    name: '演员 1 - 创意映射',
    performerId: 1,
    description: '使用更多高级参数的创意映射',
    mappings: {
      'left_hand_height': {
        oscAddress: '/pigments1/start',
        scale: [0, 1],
        target: [0, 127],
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,
        description: '左手高度 → 音高'
      },
      'right_hand_height': {
        oscAddress: '/pigments1/REVERB',
        scale: [0, 1],
        target: [0, 127],
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,
        description: '右手高度 → 混响'
      },
      'arm_spread': {
        oscAddress: ['/pigments1/CUTOFF1', '/pigments1/CUTOFF2'],  // ✅ 改为数组
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,
        description: '手臂展开 → 滤波器 1 和 2'
      },
      'body_tilt': {
        oscAddress: '/pigments1/VM',
        scale: [0, 1],
        target: [0, 127],
        smooth: false,
        enabled: true,
        description: '身体倾斜 → 芒种音量'
      }
    }
  },

  // 演员 1 - 端口区分模式（不使用 /performer 前缀）
  performer1_port_mode: {
    name: '演员 1 - 端口区分模式（端口 7400）',
    performerId: 1,
    description: '使用端口 7400，直接发送 /pigments/VC 等地址（不添加 /performer1 前缀）',
    mode: 'port_based',
    mappings: {
      'left_hand_height': {
        oscAddress: '/pigments/VC',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.3,
        enabled: true,
        description: '左手高度 → Pigments 人声音量'
      },
      'right_hand_height': {
        oscAddress: '/pigments/VM',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.3,
        enabled: true,
        description: '右手高度 → Pigments 芒种音量'
      },
      'arm_spread': {
        oscAddress: ['/pigments/CUTOFF1', '/pigments/CUTOFF2'],
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.3,
        enabled: true,
        description: '手臂展开 → 滤波器 1 和 2'
      },
      'left_hand_openness': {
       oscAddress: '/pigments/reverb',
       scale: [0, 1],
       target: [0, 1],
       smooth: true,
       smoothFactor: 0.2,
       enabled: true,  // 
       description: '左手张开度 → Pigments 混响'
      },
       'right_hand_openness': {
        oscAddress: '/pigments/rate',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,  // 
        description: '右手张开度 → Pigments 速率'
      },
       'motion_speed': {
        oscAddress: ['/pigments/midi1', '/pigments/midi2'],
        scale: [0, 1],
        target: [-350, 150],
        smooth: true,
        smoothFactor: 0.3,
        enabled: true,
        description: '动作速度 → Pigments 音高1和音高2'
      }
    }
  },

  // 演员 2 - 端口区分模式（不使用 /performer 前缀）
  performer2_port_mode: {
    name: '演员 2 - 端口区分模式（端口 7401）',
    performerId: 2,
    description: '使用端口 7401，直接发送 /pigments/VC 等地址（不添加 /performer2 前缀）',
    mode: 'port_based',  // 标识这是端口区分模式
    mappings: {
      'left_hand_height': {
        oscAddress: '/pigments/VC',  // ✅ 相同地址，但通过不同端口区分
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.3,
        enabled: true,
        description: '左手高度 → Pigments 人声音量'
      },
      'right_hand_height': {
        oscAddress: '/pigments/VM',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.3,
        enabled: true,
        description: '右手高度 → Pigments 芒种音量'
      },
     'arm_spread': {
      oscAddress: ['/pigments/CUTOFF1', '/pigments/CUTOFF2'],
      scale: [0, 1],
      target: [0, 1],
      smooth: true,
      smoothFactor: 0.3,
      enabled: true,
      description: '手臂展开 → 滤波器 1 和 2'
      },
    'left_hand_openness': {
     oscAddress: '/pigments/reverb',
     scale: [0, 1],
     target: [0, 1],
     smooth: true,
     smoothFactor: 0.2,
     enabled: true,  // 
     description: '左手张开度 → Pigments 混响'
      },
    }
  },

  // 全局映射（所有演员）
  global_basic: {
    name: '全局 - 基础映射',
    performerId: null,
    description: '适用于所有演员的基础映射',
    mappings: {
      'motion_speed': {
        oscAddress: '/effect',
        scale: [0, 1],
        target: [0, 1],
        smooth: false,
        enabled: true,
        description: '动作速度 → 效果器开关'
      }
    }
  }
};

/**
 * 默认使用的映射预设
 */
export const DEFAULT_PRESET = 'performer1_standard';

/**
 * 缩放值到目标范围
 * @param {number} value - 源值
 * @param {array} fromRange - [min, max] 源范围
 * @param {array} toRange - [min, max] 目标范围
 * @returns {number} 缩放后的值
 */
export function scaleValue(value, fromRange, toRange) {
  const [fromMin, fromMax] = fromRange;
  const [toMin, toMax] = toRange;

  // 限制输入值到范围内
  const clampedValue = Math.max(fromMin, Math.min(fromMax, value));

  // 归一化到 0-1
  const normalized = fromMax === fromMin ? 0 : (clampedValue - fromMin) / (fromMax - fromMin);

  // 缩放到目标范围
  return toMin + normalized * (toMax - toMin);
}

/**
 * 平滑值（简单低通滤波）
 * @param {number} current - 当前值
 * @param {number} previous - 上一帧的值
 * @param {number} factor - 平滑因子（0-1，越小越平滑）
 * @returns {number} 平滑后的值
 */
export function smoothValue(current, previous, factor = 0.2) {
  if (previous === undefined || previous === null) {
    return current;
  }
  return current * factor + previous * (1 - factor);
}

/**
 * 获取映射预设
 * @param {string} presetName - 预设名称
 * @returns {object} 映射预设对象
 */
export function getPreset(presetName) {
  return MAPPING_PRESETS[presetName] || MAPPING_PRESETS[DEFAULT_PRESET];
}

/**
 * 获取所有可用的预设名称
 * @returns {array} 预设名称数组
 */
export function getAvailablePresets() {
  return Object.keys(MAPPING_PRESETS);
}

/**
 * 获取特定演员的所有映射
 * @param {number} performerId - 演员 ID
 * @returns {array} 适用于该演员的映射预设
 */
export function getPresetsForPerformer(performerId) {
  return Object.entries(MAPPING_PRESETS).filter(([key, preset]) => {
    return preset.performerId === performerId || preset.performerId === null;
  }).map(([key, preset]) => ({ key, ...preset }));
}

/**
 * 调试函数：打印所有映射配置
 */
export function printMappingConfig() {
  console.log('=== MediaPipe 映射配置 ===\n');
  Object.entries(MAPPING_PRESETS).forEach(([presetKey, preset]) => {
    console.log(`\n📋 预设: ${preset.name} (${presetKey})`);
    console.log(`   说明: ${preset.description}`);
    console.log(`   演员: ${preset.performerId === null ? '所有' : `演员 ${preset.performerId}`}`);
    console.log(`   映射:`);

    Object.entries(preset.mappings).forEach(([param, config]) => {
      const status = config.enabled ? '✅' : '❌';
      console.log(`   ${status} ${param}`);
      console.log(`      → ${config.oscAddress}`);
      console.log(`      范围: [${config.scale.join(', ')}] → [${config.target.join(', ')}]`);
      console.log(`      平滑: ${config.smooth ? `是 (${config.smoothFactor})` : '否'}`);
      console.log(`      说明: ${config.description}`);
    });
  });
}

