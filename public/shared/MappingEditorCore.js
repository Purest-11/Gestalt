/**
 * 🎛️ Mapping Editor Core
 * 
 * Shared mapping editor logic for both performer (MediaPipe) 
 * and audience (Touch) systems
 * 
 * Features:
 * - Load/Save mapping configurations
 * - Real-time sync via WebSocket
 * - Import/Export JSON files
 * - i18n support
 */

// ============================================
// Available Parameters Definition
// ============================================

// Performer (MediaPipe) available parameters
export const PERFORMER_AVAILABLE_PARAMS = [
  { 
    id: 'left_hand_height', 
    nameEn: 'Left Hand Height',
    nameZh: '左手高度',
    descEn: 'Vertical position of left hand (0=shoulder, 1=above head)',
    descZh: '左手抬起的垂直位置 (0=肩膀, 1=头顶上方)',
    defaultRange: [0, 1]
  },
  { 
    id: 'right_hand_height', 
    nameEn: 'Right Hand Height',
    nameZh: '右手高度',
    descEn: 'Vertical position of right hand (0=shoulder, 1=above head)',
    descZh: '右手抬起的垂直位置 (0=肩膀, 1=头顶上方)',
    defaultRange: [0, 1]
  },
  { 
    id: 'left_hand_x', 
    nameEn: 'Left Hand X',
    nameZh: '左手水平位置',
    descEn: 'Horizontal position of left hand (0=left, 1=right)',
    descZh: '左手水平位置 (0=左侧, 1=右侧)',
    defaultRange: [0, 1]
  },
  { 
    id: 'right_hand_x', 
    nameEn: 'Right Hand X',
    nameZh: '右手水平位置',
    descEn: 'Horizontal position of right hand (0=left, 1=right)',
    descZh: '右手水平位置 (0=左侧, 1=右侧)',
    defaultRange: [0, 1]
  },
  { 
    id: 'arm_spread', 
    nameEn: 'Arm Spread',
    nameZh: '手臂展开度',
    descEn: 'Distance between hands (0=close, 1=fully spread)',
    descZh: '双臂张开程度 (0=贴身, 1=完全展开)',
    defaultRange: [0, 1]
  },
  { 
    id: 'body_tilt', 
    nameEn: 'Body Tilt',
    nameZh: '身体倾斜',
    descEn: 'Left/right body tilt angle',
    descZh: '身体左右倾斜角度',
    defaultRange: [-45, 45]
  },
  { 
    id: 'motion_speed', 
    nameEn: 'Motion Speed',
    nameZh: '动作速度',
    descEn: 'Overall movement speed',
    descZh: '整体动作速度',
    defaultRange: [0, 1]
  },
  { 
    id: 'left_hand_openness', 
    nameEn: 'Left Hand Openness',
    nameZh: '左手张开度',
    descEn: 'How open the left hand is (0=fist, 1=fully open)',
    descZh: '左手张开程度 (0=握拳, 1=完全张开)',
    defaultRange: [0, 1]
  },
  { 
    id: 'right_hand_openness', 
    nameEn: 'Right Hand Openness',
    nameZh: '右手张开度',
    descEn: 'How open the right hand is (0=fist, 1=fully open)',
    descZh: '右手张开程度 (0=握拳, 1=完全张开)',
    defaultRange: [0, 1]
  }
];

// Audience (Touch) available parameters
export const AUDIENCE_AVAILABLE_PARAMS = [
  { 
    id: 'screen_keyboard_note', 
    nameEn: 'Screen Keyboard (MIDI)',
    nameZh: '屏幕键盘 (MIDI)',
    descEn: 'Touch position → MIDI note (X=semitone, Y=octave)',
    descZh: '触摸位置 → MIDI音符 (X轴=半音, Y轴=八度)',
    defaultRange: [36, 95]
  },
  { 
    id: 'swipe_up', 
    nameEn: 'Swipe Up',
    nameZh: '向上滑动',
    descEn: 'Swipe up gesture intensity',
    descZh: '向上滑动手势强度',
    defaultRange: [0, 1]
  },
  { 
    id: 'swipe_down', 
    nameEn: 'Swipe Down',
    nameZh: '向下滑动',
    descEn: 'Swipe down gesture intensity',
    descZh: '向下滑动手势强度',
    defaultRange: [0, 1]
  },
  { 
    id: 'swipe_left', 
    nameEn: 'Swipe Left',
    nameZh: '向左滑动',
    descEn: 'Swipe left gesture intensity',
    descZh: '向左滑动手势强度',
    defaultRange: [0, 1]
  },
  { 
    id: 'swipe_right', 
    nameEn: 'Swipe Right',
    nameZh: '向右滑动',
    descEn: 'Swipe right gesture intensity',
    descZh: '向右滑动手势强度',
    defaultRange: [0, 1]
  },
  { 
    id: 'two_finger_distance', 
    nameEn: 'Two Finger Pinch/Spread',
    nameZh: '双指捏合/张开',
    descEn: 'Distance between two fingers',
    descZh: '双指之间的距离',
    defaultRange: [20, 400]
  },
  { 
    id: 'gesture_energy', 
    nameEn: 'Gesture Energy',
    nameZh: '手势能量',
    descEn: 'Combined velocity × intensity',
    descZh: '速度 × 强度的综合值',
    defaultRange: [0, 1]
  },
  { 
    id: 'position_x', 
    nameEn: 'Touch X Position',
    nameZh: '触摸X坐标',
    descEn: 'Horizontal touch position (0=left, 1=right)',
    descZh: '水平触摸位置 (0=左, 1=右)',
    defaultRange: [0, 1]
  },
  { 
    id: 'position_y', 
    nameEn: 'Touch Y Position',
    nameZh: '触摸Y坐标',
    descEn: 'Vertical touch position (0=top, 1=bottom)',
    descZh: '垂直触摸位置 (0=上, 1=下)',
    defaultRange: [0, 1]
  },
  { 
    id: 'velocity', 
    nameEn: 'Swipe Velocity',
    nameZh: '滑动速度',
    descEn: 'Speed of swipe gesture',
    descZh: '滑动手势的速度',
    defaultRange: [0, 5]
  },
  { 
    id: 'finger_count', 
    nameEn: 'Finger Count',
    nameZh: '手指数量',
    descEn: 'Number of fingers touching (1-5)',
    descZh: '触摸的手指数量 (1-5)',
    defaultRange: [1, 5]
  }
];

// ============================================
// Storage Keys
// ============================================
const PERFORMER_STORAGE_KEY = 'osc_performer_mapping_config';
const AUDIENCE_STORAGE_KEY = 'osc_audience_mapping_config';

// ============================================
// Default Configurations (from existing configs)
// ============================================

// Default performer mapping (from mappingConfig.js performer1_port_mode)
export function getDefaultPerformerConfig() {
  return {
    version: '1.0',
    lastModified: new Date().toISOString(),
    mappings: [
      {
        id: 'left_hand_height',
        enabled: true,
        oscAddress: '/pigments/VC',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.3
      },
      {
        id: 'right_hand_height',
        enabled: true,
        oscAddress: '/pigments/VM',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.3
      },
      {
        id: 'arm_spread',
        enabled: true,
        oscAddress: '/pigments/CUTOFF1,/pigments/CUTOFF2',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.3
      },
      {
        id: 'left_hand_openness',
        enabled: true,
        oscAddress: '/pigments/reverb',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.2
      },
      {
        id: 'right_hand_openness',
        enabled: true,
        oscAddress: '/pigments/rate',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.2
      },
      {
        id: 'motion_speed',
        enabled: true,
        oscAddress: '/pigments/midi1,/pigments/midi2',
        inputRange: [0, 1],
        outputRange: [-350, 150],
        smooth: true,
        smoothFactor: 0.3
      },
      {
        id: 'left_hand_x',
        enabled: false,
        oscAddress: '',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.2
      },
      {
        id: 'right_hand_x',
        enabled: false,
        oscAddress: '',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.2
      },
      {
        id: 'body_tilt',
        enabled: false,
        oscAddress: '',
        inputRange: [-45, 45],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.2
      }
    ]
  };
}

// Default audience mapping (from audienceMappingConfig.js)
export function getDefaultAudienceConfig() {
  return {
    version: '1.0',
    lastModified: new Date().toISOString(),
    mappings: [
      {
        id: 'screen_keyboard_note',
        enabled: true,
        oscAddress: '/pigments/midi',
        inputRange: [36, 95],
        outputRange: [36, 95],
        smooth: false,
        smoothFactor: 0
      },
      {
        id: 'swipe_up',
        enabled: true,
        oscAddress: '/pigments/V1,/pigments/V2',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.3
      },
      {
        id: 'two_finger_distance',
        enabled: true,
        oscAddress: '/pigments/reverb',
        inputRange: [20, 400],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.2
      },
      {
        id: 'gesture_energy',
        enabled: true,
        oscAddress: '/pigments/rate',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.3
      },
      {
        id: 'swipe_down',
        enabled: false,
        oscAddress: '',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.15
      },
      {
        id: 'swipe_left',
        enabled: false,
        oscAddress: '',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.15
      },
      {
        id: 'swipe_right',
        enabled: false,
        oscAddress: '',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.15
      },
      {
        id: 'position_x',
        enabled: false,
        oscAddress: '',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.2
      },
      {
        id: 'position_y',
        enabled: false,
        oscAddress: '',
        inputRange: [0, 1],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.2
      },
      {
        id: 'velocity',
        enabled: false,
        oscAddress: '',
        inputRange: [0, 5],
        outputRange: [0, 1],
        smooth: true,
        smoothFactor: 0.1
      },
      {
        id: 'finger_count',
        enabled: false,
        oscAddress: '',
        inputRange: [1, 5],
        outputRange: [0, 1],
        smooth: false,
        smoothFactor: 0
      }
    ]
  };
}

// ============================================
// MappingEditorCore Class
// ============================================

export class MappingEditorCore {
  constructor(type = 'performer') {
    this.type = type; // 'performer' or 'audience'
    this.storageKey = type === 'performer' ? PERFORMER_STORAGE_KEY : AUDIENCE_STORAGE_KEY;
    this.availableParams = type === 'performer' ? PERFORMER_AVAILABLE_PARAMS : AUDIENCE_AVAILABLE_PARAMS;
    this.config = this.load();
    this.listeners = [];
    this.ws = null;
    
    // Connect to WebSocket for sync (audience config only syncs to phones)
    if (type === 'audience') {
      this.connectWebSocket();
    }
  }

  // Load config from localStorage
  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all params exist
        return this.mergeWithDefaults(parsed);
      }
    } catch (e) {
      console.warn('Failed to load mapping config:', e);
    }
    
    // Return default config
    return this.type === 'performer' 
      ? getDefaultPerformerConfig() 
      : getDefaultAudienceConfig();
  }

  // Merge saved config with defaults (in case new params were added)
  mergeWithDefaults(saved) {
    const defaults = this.type === 'performer' 
      ? getDefaultPerformerConfig() 
      : getDefaultAudienceConfig();
    
    // Create a map of saved mappings by id
    const savedMap = {};
    if (saved.mappings) {
      saved.mappings.forEach(m => {
        savedMap[m.id] = m;
      });
    }
    
    // Merge: use saved values if exist, otherwise use defaults
    const merged = {
      ...defaults,
      ...saved,
      mappings: defaults.mappings.map(defaultMapping => {
        if (savedMap[defaultMapping.id]) {
          return { ...defaultMapping, ...savedMap[defaultMapping.id] };
        }
        return defaultMapping;
      })
    };
    
    return merged;
  }

  // Save config to localStorage
  save() {
    this.config.lastModified = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    
    // Notify listeners
    this.notifyListeners();
    
    // If audience config, broadcast to all audience phones
    if (this.type === 'audience') {
      this.broadcastConfig();
    }
    
    console.log(`✅ ${this.type} mapping config saved`);
  }

  // Get mapping by id
  getMapping(id) {
    return this.config.mappings.find(m => m.id === id);
  }

  // Update a single mapping
  updateMapping(id, updates) {
    const mapping = this.getMapping(id);
    if (mapping) {
      Object.assign(mapping, updates);
      this.save();
    }
  }

  // Get all enabled mappings (for OSC processing)
  getEnabledMappings() {
    return this.config.mappings.filter(m => m.enabled && m.oscAddress);
  }

  // Add listener for config changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notify all listeners of config change
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.config);
      } catch (e) {
        console.error('Listener error:', e);
      }
    });
    
    // Dispatch global event
    window.dispatchEvent(new CustomEvent('mappingConfigChanged', { 
      detail: { type: this.type, config: this.config }
    }));
  }

  // Export config to JSON file
  exportToFile() {
    const blob = new Blob([JSON.stringify(this.config, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osc-${this.type}-mapping-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import config from file
  async importFromFile(file) {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      // Validate structure
      if (!imported.mappings || !Array.isArray(imported.mappings)) {
        throw new Error('Invalid config file structure');
      }
      
      // Merge with defaults to ensure all required fields
      this.config = this.mergeWithDefaults(imported);
      this.save();
      
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  // Reset to defaults
  resetToDefaults() {
    this.config = this.type === 'performer' 
      ? getDefaultPerformerConfig() 
      : getDefaultAudienceConfig();
    this.save();
  }

  // WebSocket connection for audience config sync
  connectWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ Mapping Editor WebSocket connected');
      };
      
      this.ws.onclose = () => {
        console.warn('⚠️ Mapping Editor WebSocket closed, reconnecting...');
        setTimeout(() => this.connectWebSocket(), 3000);
      };
      
      this.ws.onerror = (e) => {
        console.error('WebSocket error:', e);
      };
    } catch (e) {
      console.error('WebSocket connection failed:', e);
    }
  }

  // Broadcast audience config to all phones
  broadcastConfig() {
    if (this.type !== 'audience' || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'audience_mapping_config_update',
      config: this.config
    }));
    
    console.log('📡 Audience mapping config broadcasted to all phones');
  }

  // Get param info by id
  getParamInfo(id) {
    return this.availableParams.find(p => p.id === id);
  }

  // Get display name for param (respects i18n)
  getParamDisplayName(id) {
    const param = this.getParamInfo(id);
    if (!param) return id;
    
    const isZh = window.i18n && window.i18n.getCurrentLanguage() === 'zh';
    return isZh ? param.nameZh : param.nameEn;
  }

  // Get description for param (respects i18n)
  getParamDescription(id) {
    const param = this.getParamInfo(id);
    if (!param) return '';
    
    const isZh = window.i18n && window.i18n.getCurrentLanguage() === 'zh';
    return isZh ? param.descZh : param.descEn;
  }
}

// ============================================
// Global instances (singleton pattern)
// ============================================
let performerEditorInstance = null;
let audienceEditorInstance = null;

export function getPerformerMappingEditor() {
  if (!performerEditorInstance) {
    performerEditorInstance = new MappingEditorCore('performer');
  }
  return performerEditorInstance;
}

export function getAudienceMappingEditor() {
  if (!audienceEditorInstance) {
    audienceEditorInstance = new MappingEditorCore('audience');
  }
  return audienceEditorInstance;
}

console.log('✅ MappingEditorCore loaded');



