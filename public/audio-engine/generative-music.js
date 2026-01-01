/**
 * 生成式音乐引擎
 * 
 * 功能：
 * 1. 自动生成音乐序列（算法作曲）
 * 2. 响应 OSC 参数调整音乐风格
 * 3. 实时音乐生成（不需要手动触发）
 */

import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@14.8.49/+esm';

export class GenerativeMusicEngine {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.isPlaying = false;
    
    // 音乐参数（由 OSC 控制）
    this.params = {
      tempo: 120,              // BPM
      scale: 'major',          // 音阶类型
      density: 0.5,            // 音符密度 (0-1)
      complexity: 0.5,         // 复杂度 (0-1)
      energy: 0.5,             // 能量级别 (0-1)
      harmony: 0.5             // 和声丰富度 (0-1)
    };
    
    // 音阶定义
    this.scales = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      pentatonic: [0, 2, 4, 7, 9],
      blues: [0, 3, 5, 6, 7, 10],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10]
    };
    
    this.rootNote = 'C3';
    this.sequences = [];
  }
  
  /**
   * 启动生成式音乐
   */
  start() {
    if (this.isPlaying) return;
    
    console.log('🎵 启动生成式音乐引擎...');
    
    // 设置传输 BPM
    Tone.Transport.bpm.value = this.params.tempo;
    
    // 创建主旋律序列
    this.createMelodySequence();
    
    // 创建低音序列
    this.createBassSequence();
    
    // 创建和弦序列
    this.createChordSequence();
    
    // 创建环境音序列
    this.createAmbientSequence();
    
    // 启动传输
    Tone.Transport.start();
    this.isPlaying = true;
    
    console.log('✅ 生成式音乐已启动');
  }
  
  /**
   * 停止生成式音乐
   */
  stop() {
    if (!this.isPlaying) return;
    
    // 停止所有序列
    this.sequences.forEach(seq => seq.stop());
    this.sequences = [];
    
    // 停止传输
    Tone.Transport.stop();
    this.isPlaying = false;
    
    console.log('⏹️ 生成式音乐已停止');
  }
  
  /**
   * 创建主旋律序列
   */
  createMelodySequence() {
    const synth = this.audioEngine.synth;
    
    const sequence = new Tone.Sequence((time, note) => {
      // 根据密度参数决定是否播放
      if (Math.random() < this.params.density) {
        const velocity = 0.3 + this.params.energy * 0.5;
        const duration = this.getNoteDuration();
        
        synth.triggerAttackRelease(note, duration, time, velocity);
      }
    }, this.generateMelodyPattern(), '8n');
    
    sequence.start(0);
    this.sequences.push(sequence);
    
    console.log('🎹 主旋律序列已创建');
  }
  
  /**
   * 创建低音序列
   */
  createBassSequence() {
    const synth = this.audioEngine.synth;
    
    const sequence = new Tone.Sequence((time, note) => {
      if (Math.random() < 0.8) { // 低音更稳定
        synth.triggerAttackRelease(note, '4n', time, 0.6);
      }
    }, this.generateBassPattern(), '4n');
    
    sequence.start(0);
    this.sequences.push(sequence);
    
    console.log('🎸 低音序列已创建');
  }
  
  /**
   * 创建和弦序列
   */
  createChordSequence() {
    const synth = this.audioEngine.synth;
    
    const sequence = new Tone.Sequence((time, chord) => {
      if (Math.random() < this.params.harmony) {
        chord.forEach(note => {
          synth.triggerAttackRelease(note, '2n', time, 0.3);
        });
      }
    }, this.generateChordProgression(), '2n');
    
    sequence.start(0);
    this.sequences.push(sequence);
    
    console.log('🎼 和弦序列已创建');
  }
  
  /**
   * 创建环境音序列（持续音）
   */
  createAmbientSequence() {
    const synth = this.audioEngine.synth;
    const scale = this.getScale();
    
    // 随机选择一个音作为持续音
    const ambientNote = this.scaleToNote(scale[0], this.rootNote);
    
    // 触发持续音
    synth.triggerAttack(ambientNote, Tone.now(), 0.1);
    
    console.log('🌊 环境音已启动:', ambientNote);
  }
  
  /**
   * 生成主旋律音型
   */
  generateMelodyPattern() {
    const scale = this.getScale();
    const pattern = [];
    const length = Math.floor(8 + this.params.complexity * 8); // 8-16个音符
    
    for (let i = 0; i < length; i++) {
      // 根据复杂度选择音符
      const scaleIndex = this.weightedRandom(scale.length, this.params.complexity);
      const octaveOffset = Math.floor(Math.random() * 2) + 4; // C4-C5
      const note = this.scaleToNote(scale[scaleIndex], `C${octaveOffset}`);
      pattern.push(note);
    }
    
    return pattern;
  }
  
  /**
   * 生成低音音型
   */
  generateBassPattern() {
    const scale = this.getScale();
    const pattern = [];
    const length = 8;
    
    for (let i = 0; i < length; i++) {
      // 低音主要使用根音、五度、八度
      const choices = [0, 4, 7]; // 1度、5度、8度
      const scaleIndex = choices[Math.floor(Math.random() * choices.length)];
      const note = this.scaleToNote(scale[scaleIndex % scale.length], 'C2');
      pattern.push(note);
    }
    
    return pattern;
  }
  
  /**
   * 生成和弦进行
   */
  generateChordProgression() {
    const scale = this.getScale();
    const progression = [];
    
    // 常见和弦进行：I - V - VI - IV
    const chordRoots = [0, 4, 5, 3];
    
    chordRoots.forEach(root => {
      const chord = [
        this.scaleToNote(scale[root % scale.length], 'C3'),
        this.scaleToNote(scale[(root + 2) % scale.length], 'C3'),
        this.scaleToNote(scale[(root + 4) % scale.length], 'C3')
      ];
      progression.push(chord);
    });
    
    return progression;
  }
  
  /**
   * 获取当前音阶
   */
  getScale() {
    return this.scales[this.params.scale] || this.scales.major;
  }
  
  /**
   * 将音阶度数转换为音符
   */
  scaleToNote(scaleDegree, baseNote) {
    const base = Tone.Frequency(baseNote).toMidi();
    const midiNote = base + scaleDegree;
    return Tone.Frequency(midiNote, 'midi').toNote();
  }
  
  /**
   * 获取音符时长
   */
  getNoteDuration() {
    const durations = ['16n', '8n', '4n', '2n'];
    const index = Math.floor(Math.random() * durations.length);
    return durations[index];
  }
  
  /**
   * 加权随机（用于控制音符选择倾向）
   */
  weightedRandom(max, weight) {
    // weight越高，越倾向于选择高索引（更复杂）
    const rand = Math.pow(Math.random(), 1 - weight);
    return Math.floor(rand * max);
  }
  
  /**
   * 更新音乐参数（由 OSC 控制）
   */
  updateParameter(param, value) {
    if (this.params.hasOwnProperty(param)) {
      this.params[param] = value;
      console.log(`🎛️ 更新音乐参数: ${param} = ${value}`);
      
      // 某些参数变化需要重新生成序列
      if (['scale', 'complexity', 'density'].includes(param)) {
        this.regenerateSequences();
      }
      
      // Tempo 变化立即生效
      if (param === 'tempo') {
        Tone.Transport.bpm.rampTo(value, 2);
      }
    }
  }
  
  /**
   * 重新生成序列（音乐风格变化时）
   */
  regenerateSequences() {
    if (!this.isPlaying) return;
    
    console.log('🔄 重新生成音乐序列...');
    
    // 停止当前序列
    this.sequences.forEach(seq => {
      seq.stop();
      seq.dispose();
    });
    this.sequences = [];
    
    // 重新创建序列
    this.createMelodySequence();
    this.createBassSequence();
    this.createChordSequence();
  }
}
