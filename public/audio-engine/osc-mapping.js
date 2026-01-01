/**
 * OSC 地址映射配置
 * 
 * 目的：保持与 MaxMSP 中完全相同的 OSC 地址结构
 * 直接复用现有的 route 配置，无需修改
 */

export const oscMapping = {
  // ========================================
  // 演员1控制参数（/performer1/...）
  // ========================================
  '/performer1/slider1': {
    target: 'synth',
    param: 'filter.frequency',
    min: 20,
    max: 5000,
    curve: 'exponential', // 指数曲线，适合频率
    description: '滤波器截止频率'
  },
  
  '/performer1/slider2': {
    target: 'synth',
    param: 'filter.Q',
    min: 0.1,
    max: 20,
    curve: 'linear',
    description: '滤波器共振'
  },
  
  '/performer1/slider3': {
    target: 'synth',
    param: 'envelope.attack',
    min: 0.001,
    max: 2,
    curve: 'exponential',
    description: '包络攻击时间'
  },
  
  '/performer1/slider4': {
    target: 'synth',
    param: 'envelope.release',
    min: 0.01,
    max: 5,
    curve: 'exponential',
    description: '包络释放时间'
  },
  
  '/performer1/slider5': {
    target: 'effects',
    param: 'reverb.wet',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '混响深度'
  },
  
  '/performer1/slider6': {
    target: 'effects',
    param: 'delay.feedback',
    min: 0,
    max: 0.9,
    curve: 'linear',
    description: '延迟反馈'
  },
  
  '/performer1/slider7': {
    target: 'synth',
    param: 'oscillator.detune',
    min: -100,
    max: 100,
    curve: 'linear',
    description: '音高微调'
  },
  
  '/performer1/slider8': {
    target: 'master',
    param: 'volume',
    min: -60,
    max: 0,
    curve: 'linear',
    description: '主音量'
  },
  
  '/performer1/button1': {
    target: 'synth',
    param: 'note',
    action: 'trigger',
    value: 60, // C4
    description: '触发音符 C4'
  },
  
  '/performer1/button2': {
    target: 'synth',
    param: 'note',
    action: 'trigger',
    value: 64, // E4
    description: '触发音符 E4'
  },
  
  '/performer1/button3': {
    target: 'synth',
    param: 'note',
    action: 'trigger',
    value: 67, // G4
    description: '触发音符 G4'
  },
  
  '/performer1/button4': {
    target: 'effects',
    param: 'reverb.freeze',
    action: 'toggle',
    description: '混响冻结'
  },
  
  // MediaPipe 手势映射
  '/performer1/hand/left/gesture': {
    target: 'synth',
    param: 'modulation',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '左手手势调制'
  },
  
  '/performer1/hand/right/gesture': {
    target: 'effects',
    param: 'distortion.amount',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '右手手势失真'
  },
  
  // ========================================
  // 观众控制参数（/audience/...）
  // ========================================
  '/audience/swipe/intensity': {
    target: 'synth',
    param: 'amplitude',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '观众滑动强度 → 音量'
  },
  
  '/audience/swipe/direction': {
    target: 'synth',
    param: 'pan',
    min: -1,
    max: 1,
    curve: 'linear',
    description: '观众滑动方向 → 声像'
  },
  
  '/audience/swipe/velocity': {
    target: 'effects',
    param: 'lfo.frequency',
    min: 0.1,
    max: 10,
    curve: 'exponential',
    description: '观众滑动速度 → LFO速率'
  },
  
  '/audience/gesture/type': {
    target: 'synth',
    param: 'waveform',
    action: 'select',
    values: ['sine', 'square', 'sawtooth', 'triangle', 'idle'],
    description: '观众手势类型 → 波形选择'
  },
  
  '/audience/count': {
    target: 'effects',
    param: 'chorus.depth',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '观众数量 → 合唱深度'
  },
  
  // ========================================
  // Pigments 兼容地址（如果你用了这些）
  // ========================================
  '/pigments/VC': {
    target: 'synth',
    param: 'filter.frequency',
    min: 20,
    max: 20000,
    curve: 'exponential',
    description: 'Pigments VC → 滤波器'
  },
  
  '/pigments/LFO': {
    target: 'effects',
    param: 'lfo.frequency',
    min: 0.01,
    max: 20,
    curve: 'exponential',
    description: 'Pigments LFO'
  },
  
  '/pigments/ENV': {
    target: 'synth',
    param: 'envelope.decay',
    min: 0.01,
    max: 5,
    curve: 'exponential',
    description: 'Pigments Envelope'
  },
  
  '/pigments/FX1': {
    target: 'effects',
    param: 'reverb.wet',
    min: 0,
    max: 1,
    curve: 'linear',
    description: 'Pigments FX1 → 混响'
  },
  
  // ========================================
  // 生成式音乐参数（新增）
  // ========================================
  '/generative/tempo': {
    target: 'generative',
    param: 'tempo',
    min: 60,
    max: 180,
    curve: 'linear',
    description: '生成式音乐速度'
  },
  
  '/generative/density': {
    target: 'generative',
    param: 'density',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '音符密度'
  },
  
  '/generative/complexity': {
    target: 'generative',
    param: 'complexity',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '音乐复杂度'
  },
  
  '/generative/energy': {
    target: 'generative',
    param: 'energy',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '能量级别'
  },
  
  '/generative/harmony': {
    target: 'generative',
    param: 'harmony',
    min: 0,
    max: 1,
    curve: 'linear',
    description: '和声丰富度'
  }
};

/**
 * 映射值转换函数
 * @param {number} value - OSC 输入值 (通常 0-1)
 * @param {object} mapping - 映射配置对象
 * @returns {number} - 转换后的目标值
 */
export function mapValue(value, mapping) {
  const { min, max, curve } = mapping;
  
  // 确保值在 0-1 范围内
  const normalized = Math.max(0, Math.min(1, value));
  
  switch (curve) {
    case 'exponential':
      // 指数曲线：适合频率等参数
      const expValue = Math.pow(normalized, 2);
      return min + expValue * (max - min);
      
    case 'logarithmic':
      // 对数曲线：适合音量等参数
      const logValue = Math.log10(normalized * 9 + 1); // 0-1 映射到 log10(1) ~ log10(10)
      return min + logValue * (max - min);
      
    case 'linear':
    default:
      // 线性映射
      return min + normalized * (max - min);
  }
}

/**
 * 根据 OSC 地址查找映射配置
 * @param {string} address - OSC 地址
 * @returns {object|null} - 映射配置或 null
 */
export function getMapping(address) {
  return oscMapping[address] || null;
}

/**
 * 获取所有支持的 OSC 地址列表
 * @returns {array} - OSC 地址数组
 */
export function getAllAddresses() {
  return Object.keys(oscMapping);
}
