/**
 * Web Audio 引擎
 * 
 * 替代 MaxMSP + Pigments，使用 Tone.js 实现音频合成
 * 接收 OSC 消息并映射到音频参数
 */

import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@14.8.49/+esm';
import { getMapping, mapValue } from './osc-mapping.js';
import { GenerativeMusicEngine } from './generative-music.js';

class AudioEngine {
  constructor() {
    this.isStarted = false;
    this.currentNote = null;
    this.generativeMusic = null; // 生成式音乐引擎
    
    // 等待用户交互后初始化
    this.initPromise = null;
  }
  
  /**
   * 初始化音频引擎（需要用户交互）
   */
  async init() {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      try {
        await Tone.start();
        console.log('🎵 Tone.js 音频引擎已启动');
        
        // =====================================
        // 创建合成器（模拟 Pigments）
        // =====================================
        
        // 主振荡器（多音）
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'sawtooth' // 锯齿波，适合合成音色
          },
          envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 1
          }
        });
        
        // 滤波器（类似 Pigments 的 VC Filter）
        this.filter = new Tone.Filter({
          type: 'lowpass',
          frequency: 2000,
          Q: 1,
          rolloff: -24
        });
        
        // LFO（低频振荡器）
        this.lfo = new Tone.LFO({
          frequency: 2,
          min: 200,
          max: 2000
        });
        this.lfo.connect(this.filter.frequency);
        this.lfo.start();
        
        // 失真效果
        this.distortion = new Tone.Distortion({
          distortion: 0,
          wet: 0
        });
        
        // 合唱效果
        this.chorus = new Tone.Chorus({
          frequency: 1.5,
          delayTime: 3.5,
          depth: 0.5,
          wet: 0
        });
        this.chorus.start();
        
        // 延迟效果
        this.delay = new Tone.FeedbackDelay({
          delayTime: '8n',
          feedback: 0.3,
          wet: 0
        });
        
        // 混响效果
        this.reverb = new Tone.Reverb({
          decay: 2,
          preDelay: 0.01,
          wet: 0.2
        });
        
        // 声像控制
        this.panner = new Tone.Panner(0);
        
        // 主音量
        this.masterVolume = new Tone.Volume(-10);
        
        // =====================================
        // 连接信号链
        // =====================================
        // Synth → Filter → Distortion → Chorus → Delay → Reverb → Panner → Master → Output
        this.synth.connect(this.filter);
        this.filter.connect(this.distortion);
        this.distortion.connect(this.chorus);
        this.chorus.connect(this.delay);
        this.delay.connect(this.reverb);
        this.reverb.connect(this.panner);
        this.panner.connect(this.masterVolume);
        this.masterVolume.toDestination();
        
        // 创建生成式音乐引擎
        this.generativeMusic = new GenerativeMusicEngine(this);
        
        // 自动启动生成式音乐
        setTimeout(() => {
          this.generativeMusic.start();
          console.log('🎵 生成式音乐已自动启动');
        }, 1000);
        
        this.isStarted = true;
        console.log('✅ 音频引擎初始化完成');
        
      } catch (error) {
        console.error('❌ 音频引擎初始化失败:', error);
        throw error;
      }
    })();
    
    return this.initPromise;
  }
  
  /**
   * 切换生成式音乐
   */
  toggleGenerativeMusic() {
    if (!this.generativeMusic) return;
    
    if (this.generativeMusic.isPlaying) {
      this.generativeMusic.stop();
    } else {
      this.generativeMusic.start();
    }
  }
  
  /**
   * 处理 OSC 消息
   * @param {string} address - OSC 地址 (如 '/performer1/slider1')
   * @param {array} args - OSC 参数数组
   */
  handleOSCMessage(address, args) {
    if (!this.isStarted) {
      console.warn('⚠️ 音频引擎未启动，忽略消息:', address);
      return;
    }
    
    const mapping = getMapping(address);
    if (!mapping) {
      // 不在映射表中的地址，忽略
      return;
    }
    
    const value = args[0]; // 大多数 OSC 消息只有一个参数
    
    try {
      // 根据映射目标路由到不同的处理函数
      switch (mapping.target) {
        case 'synth':
          this.updateSynthParameter(mapping, value);
          break;
          
        case 'effects':
          this.updateEffectParameter(mapping, value);
          break;
          
        case 'master':
          this.updateMasterParameter(mapping, value);
          break;
          
        case 'generative':
          this.updateGenerativeParameter(mapping, value);
          break;
          
        default:
          console.warn('未知的映射目标:', mapping.target);
      }
      
      // 调试输出（每 50 次打印一次，减少日志）
      if (Math.random() < 0.02) {
        console.log(`🎛️ ${address} = ${value.toFixed(3)} → ${mapping.description}`);
      }
      
    } catch (error) {
      console.error(`处理 OSC 消息失败 [${address}]:`, error);
    }
  }
  
  /**
   * 更新合成器参数
   */
  updateSynthParameter(mapping, value) {
    const mappedValue = mapValue(value, mapping);
    
    switch (mapping.param) {
      case 'filter.frequency':
        this.filter.frequency.rampTo(mappedValue, 0.05); // 平滑过渡
        break;
        
      case 'filter.Q':
        this.filter.Q.value = mappedValue;
        break;
        
      case 'envelope.attack':
        this.synth.set({ envelope: { attack: mappedValue } });
        break;
        
      case 'envelope.release':
        this.synth.set({ envelope: { release: mappedValue } });
        break;
        
      case 'envelope.decay':
        this.synth.set({ envelope: { decay: mappedValue } });
        break;
        
      case 'oscillator.detune':
        this.synth.set({ oscillator: { detune: mappedValue } });
        break;
        
      case 'amplitude':
        // 音量控制（观众强度）
        const dbValue = Tone.gainToDb(mappedValue);
        this.synth.volume.rampTo(dbValue, 0.1);
        break;
        
      case 'pan':
        // 声像控制（观众方向）
        this.panner.pan.rampTo(mappedValue, 0.05);
        break;
        
      case 'note':
        // 触发音符（按钮）
        if (mapping.action === 'trigger') {
          const note = Tone.Frequency(mapping.value, 'midi').toNote();
          this.synth.triggerAttackRelease(note, '8n');
          console.log(`🎹 触发音符: ${note}`);
        }
        break;
        
      case 'waveform':
        // 切换波形（观众手势）
        if (mapping.action === 'select') {
          const waveformIndex = Math.floor(value);
          const waveform = mapping.values[waveformIndex] || 'sine';
          this.synth.set({ oscillator: { type: waveform } });
          console.log(`🌊 切换波形: ${waveform}`);
        }
        break;
        
      case 'modulation':
        // 调制深度（MediaPipe 左手）
        this.lfo.amplitude.value = mappedValue;
        break;
        
      default:
        console.warn('未知的合成器参数:', mapping.param);
    }
  }
  
  /**
   * 更新效果器参数
   */
  updateEffectParameter(mapping, value) {
    const mappedValue = mapValue(value, mapping);
    
    switch (mapping.param) {
      case 'reverb.wet':
        this.reverb.wet.rampTo(mappedValue, 0.1);
        break;
        
      case 'reverb.freeze':
        // 混响冻结（按钮触发）
        if (mapping.action === 'toggle') {
          const isOn = value > 0.5;
          this.reverb.decay = isOn ? 10 : 2; // 长衰减 = 冻结效果
          console.log(`❄️ 混响冻结: ${isOn ? 'ON' : 'OFF'}`);
        }
        break;
        
      case 'delay.feedback':
        this.delay.feedback.value = mappedValue;
        break;
        
      case 'distortion.amount':
        this.distortion.distortion = mappedValue;
        this.distortion.wet.value = mappedValue > 0.1 ? 0.5 : 0;
        break;
        
      case 'lfo.frequency':
        this.lfo.frequency.rampTo(mappedValue, 0.1);
        break;
        
      case 'chorus.depth':
        // 观众数量映射到合唱深度
        const normalizedDepth = Math.min(value / 100, 1); // 假设最多100人
        this.chorus.depth = normalizedDepth;
        this.chorus.wet.value = normalizedDepth * 0.5;
        break;
        
      default:
        console.warn('未知的效果器参数:', mapping.param);
    }
  }
  
  /**
   * 更新主输出参数
   */
  updateMasterParameter(mapping, value) {
    const mappedValue = mapValue(value, mapping);
    
    switch (mapping.param) {
      case 'volume':
        this.masterVolume.volume.rampTo(mappedValue, 0.1);
        break;
        
      default:
        console.warn('未知的主输出参数:', mapping.param);
    }
  }
  
  /**
   * 更新生成式音乐参数
   */
  updateGenerativeParameter(mapping, value) {
    if (!this.generativeMusic) {
      console.warn('生成式音乐引擎未初始化');
      return;
    }
    
    const mappedValue = mapValue(value, mapping);
    this.generativeMusic.updateParameter(mapping.param, mappedValue);
  }
  
  /**
   * 停止所有声音
   */
  stopAll() {
    if (this.synth) {
      this.synth.releaseAll();
    }
  }
  
  /**
   * 清理资源
   */
  dispose() {
    this.stopAll();
    
    if (this.synth) this.synth.dispose();
    if (this.filter) this.filter.dispose();
    if (this.lfo) this.lfo.dispose();
    if (this.distortion) this.distortion.dispose();
    if (this.chorus) this.chorus.dispose();
    if (this.delay) this.delay.dispose();
    if (this.reverb) this.reverb.dispose();
    if (this.panner) this.panner.dispose();
    if (this.masterVolume) this.masterVolume.dispose();
    
    console.log('🗑️ 音频引擎已清理');
  }
}

// 导出单例
export const audioEngine = new AudioEngine();
