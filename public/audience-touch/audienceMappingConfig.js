/**
 * 观众触摸交互 - OSC 映射配置
 * 
 * 完全对标 MediaPipe 的映射配置格式
 * 便于实时调整和自定义 OSC 输出
 * 
 * 使用说明：
 * 1. 每个映射可独立启用/禁用 (enabled: true/false)
 * 2. scale: 输入数据范围 [min, max]
 * 3. target: 输出 OSC 值范围 [min, max]
 * 4. smooth: 是否平滑 (建议触摸数据开启)
 * 5. smoothFactor: 平滑系数 (0-1, 越小越平滑)
 */

export const audienceMappingConfig = {
  name: '观众触摸交互 - OSC 映射配置',
  version: '1.0',
  description: '将观众手机触摸手势映射到 Max MSP / Pigments 等音频参数',
  
  // ============================================
  // 映射组 1：基础位置映射
  // ============================================
  basic_position: {
    groupName: '基础位置映射',
    description: '触摸位置的 X/Y 坐标映射',
    enabled: true,
    
    mappings: {
      'position_x': {
        oscAddress: '/audience/touch/x',
        scale: [0, 1],           // 输入：屏幕 X 坐标（归一化）
        target: [0, 1],          // 输出：OSC 值
        smooth: true,
        smoothFactor: 0.2,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '触摸 X 坐标 → 可映射到音高/滤波器频率'
      },
      
      'position_y': {
        oscAddress: '/audience/touch/y',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '触摸 Y 坐标 → 可映射到音量/共鸣'
      },
      
      'position_y_inverted': {
        oscAddress: '/audience/touch/y_inv',
        scale: [1, 0],           // 反转：上方=1，下方=0
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: false,          // 默认禁用，需要时开启
        description: '触摸 Y 坐标（反转）→ 上方值大'
      }
    }
  },

  // ============================================
  // 映射组 2：单指滑动手势
  // ============================================
  single_swipe: {
    groupName: '单指滑动手势',
    description: '四个方向的滑动强度映射',
    enabled: true,
    
    mappings: {
      'swipe_up': {
        oscAddress: ['/pigments/V1', '/pigments/V2'],
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.3,      // 较快响应
        enabled: true,
        description: '向上滑动强度 → Pigments Engine 1 Level / 音高升'
      },
      
      'swipe_down': {
        oscAddress: '/audience/swipe/down',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.15,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '向下滑动强度 → Pigments Engine 2 Level / 音高降'
      },
      
      'swipe_left': {
        oscAddress: '/audience/swipe/left',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.15,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '向左滑动强度 → Filter Cutoff / 低通滤波'
      },
      
      'swipe_right': {
        oscAddress: '/audience/swipe/right',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.15,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '向右滑动强度 → Reverb Mix / 混响深度'
      }
    }
  },

  // ============================================
  // 映射组 3：滑动动态参数
  // ============================================
  swipe_dynamics: {
    groupName: '滑动动态参数',
    description: '速度、距离、方向等动态特征',
    enabled: true,
    
    mappings: {
      'velocity': {
        oscAddress: '/audience/velocity',
        scale: [0, 5],           // 速度范围（经验值）
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.1,       // 快速响应
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '滑动速度 → Attack Time / 音符力度'
      },
      
      'distance': {
        oscAddress: '/audience/distance',
        scale: [0, 500],         // 像素距离（经验值）
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '滑动距离 → LFO Amount / 调制深度'
      },
      
      'direction': {
        oscAddress: '/audience/direction',
        scale: [0, 360],         // 角度
        target: [0, 1],
        smooth: false,           // 方向不需要平滑
        smoothFactor: 0,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '滑动方向角度 → Panning / 声像位置'
      },
      
      'intensity': {
        oscAddress: '/audience/intensity',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.15,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '滑动强度 → Master Volume / 整体音量'
      }
    }
  },

  // ============================================
  // 映射组 4：多指触摸创意映射
  // ============================================
  multi_touch: {
    groupName: '多指触摸创意',
    description: '2-5 个手指的复合交互',
    enabled: true,
    
    mappings: {
      'finger_count': {
        oscAddress: '/audience/fingers/count',
        scale: [1, 5],           // 1-5 个手指
        target: [0, 1],
        smooth: false,           // 离散值，不平滑
        smoothFactor: 0,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '手指数量 → Oscillator Count / 和弦层数'
      },
      
      'finger_spread': {
        oscAddress: '/audience/fingers/spread',
        scale: [0, 300],         // 手指间距（像素）
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.25,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '手指分散度 → Detune / Chorus Width'
      },
      
      'two_finger_distance': {
        oscAddress: '/pigments/reverb',
        scale: [20, 400],        // 双指距离
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: true,          // 已禁用：使用 /pigments/ 地址
        description: '双指捏合/张开 → Filter Resonance / Delay Time'
      },
      
      'finger_centroid_x': {
        oscAddress: '/audience/fingers/center_x',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.25,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '多指中心点 X → Stereo Width'
      },
      
      'finger_centroid_y': {
        oscAddress: '/audience/fingers/center_y',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.25,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '多指中心点 Y → Macro Control'
      }
    }
  },

  // ============================================
  // 映射组 5：复合计算参数
  // ============================================
  computed_params: {
    groupName: '复合计算参数',
    description: '基于多个输入的创意合成参数',
    enabled: true,
    
    mappings: {
      'gesture_energy': {
        oscAddress: '/pigments/rate',
        scale: [0, 1],           // velocity * intensity 的结果
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.3,
        enabled: true,
        description: '手势能量 (速度×强度) → Distortion / FX Send'
      },
      
      'chaos_factor': {
        oscAddress: '/pigments/reverb',
        scale: [0, 1],         // 方向变化率（度/秒）
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.3,
        enabled: false,
        description: '混沌因子 (方向变化) → Random LFO / Noise Amount'
      },
      
      'touch_pressure': {
        oscAddress: '/audience/pressure',
        scale: [0, 1],           // 模拟压力（基于速度和面积）
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '触摸压力 (模拟) → Filter Drive / Compressor Threshold'
      },
      
      'activity_index': {
        oscAddress: '/audience/activity',
        scale: [0, 10],          // 活动指数（综合多个因素）
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.4,       // 缓慢变化
        enabled: false,          // 已禁用：使用 /pigments/ 地址
        description: '活动指数 (综合) → Master FX Amount'
      }
    }
  },

  // ============================================
  // 映射组 6：专用音色控制（示例）
  // ============================================
  pigments_example: {
    groupName: 'Pigments 合成器示例',
    description: '直接映射到 Pigments 参数的示例',
    enabled: false,  // 默认禁用，作为模板
    
    mappings: {
      'pigments_engine1': {
        oscAddress: '/pigments/engine1/level',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: false,
        description: '向上滑动 → Engine 1 Level'
      },
      
      'pigments_engine2': {
        oscAddress: '/pigments/engine2/level',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: false,
        description: '向下滑动 → Engine 2 Level'
      },
      
      'pigments_cutoff': {
        oscAddress: '/pigments/filter/cutoff',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.15,
        enabled: false,
        description: 'X 位置 → Filter Cutoff'
      },
      
      'pigments_resonance': {
        oscAddress: '/pigments/filter/resonance',
        scale: [0, 1],
        target: [0, 1],
        smooth: true,
        smoothFactor: 0.2,
        enabled: false,
        description: 'Y 位置 → Filter Resonance'
      }
    }
  },

  // ============================================
  // 映射组 7：屏幕键盘（触摸位置 → MIDI 音符）
  // ============================================
  screen_keyboard: {
    groupName: '屏幕虚拟键盘',
    description: '将整个屏幕映射为 MIDI 键盘，每次触摸触发一个音符',
    enabled: true,
    
    mappings: {
      'screen_keyboard_note': {
        oscAddress: '/pigments/midi',
        scale: [36, 95],         // MIDI 音符范围：C2(36) 到 B6(95)
        target: [36, 95],        // 直接输出 MIDI 音符编号
        smooth: false,           // 不平滑，音符需要精确跳变
        smoothFactor: 0,
        enabled: true,
        description: '屏幕位置 (X+Y) → MIDI 音高 | X轴=半音, Y轴=八度 | 范围: C2-B6'
      }
    }
  }
};

/**
 * 快速访问所有启用的映射
 * @returns {Array} 所有启用的映射配置
 */
export function getAllEnabledMappings() {
  const enabled = [];
  
  for (const groupKey in audienceMappingConfig) {
    const group = audienceMappingConfig[groupKey];
    
    // 跳过元数据字段
    if (typeof group !== 'object' || !group.mappings) continue;
    
    // 如果整个组被禁用，跳过
    if (group.enabled === false) continue;
    
    // 遍历组内的映射
    for (const mappingKey in group.mappings) {
      const mapping = group.mappings[mappingKey];
      
      if (mapping.enabled !== false) {  // 默认启用
        enabled.push({
          key: mappingKey,
          group: groupKey,
          ...mapping
        });
      }
    }
  }
  
  return enabled;
}

/**
 * 获取特定映射配置
 * @param {string} mappingKey - 映射键名
 * @returns {Object|null} 映射配置对象
 */
export function getMapping(mappingKey) {
  for (const groupKey in audienceMappingConfig) {
    const group = audienceMappingConfig[groupKey];
    if (group.mappings && group.mappings[mappingKey]) {
      return {
        key: mappingKey,
        group: groupKey,
        ...group.mappings[mappingKey]
      };
    }
  }
  return null;
}

/**
 * 热重载配置（用于实时调试）
 */
export function reloadConfig() {
  console.log('🔄 观众映射配置已重载');
  console.log(`📊 已启用映射数量: ${getAllEnabledMappings().length}`);
  return audienceMappingConfig;
}

// 初始化时打印配置概况
console.log('✅ 观众触摸交互映射配置已加载');
console.log(`📋 映射组数量: ${Object.keys(audienceMappingConfig).filter(k => audienceMappingConfig[k].mappings).length}`);
console.log(`✓ 已启用映射: ${getAllEnabledMappings().length} 个`);
