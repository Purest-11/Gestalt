/**
 * 🌍 OSC Interactive Performance System - Internationalization (i18n)
 * 
 * Supported languages: English (en), Chinese (zh)
 * Default: English
 */

const translations = {
  // ============================================
  // English (Default)
  // ============================================
  en: {
    // Common
    common: {
      connected: "Connected",
      disconnected: "Disconnected",
      connecting: "Connecting...",
      performer: "Performer",
      audience: "Audience",
      settings: "Settings",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      on: "ON",
      off: "OFF",
      enabled: "Enabled",
      disabled: "Disabled",
      language: "Language",
      english: "English",
      chinese: "中文",
    },

    // MediaPipe Motion Capture Page
    mocap: {
      title: "Gestalt · Motion Capture",
      pageTitle: "Motion Capture",
      cameraPermission: "Please allow camera access",
      cameraError: "Camera access denied",
      startCapture: "Start Capture",
      stopCapture: "Stop Capture",
      fps: "FPS",
      latency: "Latency",
      oscStatus: "OSC Status",
      mappingPreset: "Mapping Preset",
      parameters: "Parameters",
      leftHand: "Left Hand",
      rightHand: "Right Hand",
      leftHandHeight: "Left Hand Height",
      rightHandHeight: "Right Hand Height",
      leftHandX: "Left Hand X",
      rightHandX: "Right Hand X",
      armSpread: "Arm Spread",
      bodyTilt: "Body Tilt",
      motionSpeed: "Motion Speed",
      leftHandOpenness: "Left Hand Openness",
      rightHandOpenness: "Right Hand Openness",
      noHandsDetected: "No hands detected",
      handsDetected: "Hands detected",
      poseDetected: "Pose detected",
      noPoseDetected: "No pose detected",
    },

    // Audience Monitor Page
    monitor: {
      title: "Gestalt · Control Panel",
      pageTitle: "Control Panel",
      audienceCount: "Audience Count",
      qrCode: "Scan to Join",
      qrCodeLocal: "Local Network",
      qrCodePublic: "Public Access",
      audienceUrl: "Audience URL",
      copyUrl: "Copy URL",
      urlCopied: "URL Copied!",
      noAudience: "No audience connected",
      waitingForAudience: "Waiting for audience...",
      totalTouches: "Total Touches",
      activeUsers: "Active Users",
      avgLatency: "Avg Latency",
      oscMessages: "OSC Messages",
      recentActivity: "Recent Activity",
      systemStatus: "System Status",
      serverRunning: "Server Running",
      maxMspConnected: "Max MSP Connected",
      tunnelActive: "Public Tunnel Active",
      tunnelInactive: "Local Mode",
      particleDescription: "Each particle = one audience member · Color = gesture type · Brightness = intensity",
      online: "Online",
      active: "Active",
      globalParams: "Global Parameters",
      chaos: "Chaos",
      energy: "Energy",
      density: "Density",
    },

    // Audience Touch Page
    touch: {
      title: "Touch to Play",
      pageTitle: "Interactive Touch",
      touchToStart: "Touch anywhere to start",
      swipeUp: "Swipe Up",
      swipeDown: "Swipe Down",
      swipeLeft: "Swipe Left",
      swipeRight: "Swipe Right",
      pinch: "Pinch",
      spread: "Spread",
      tap: "Tap",
      hold: "Hold",
      instructions: "Use your fingers to control the music",
      connectionStatus: "Connection",
      touchCount: "Active Touches",
      gestureDetected: "Gesture",
      noGesture: "Touch to interact",
      screenKeyboard: "Screen Keyboard Mode",
      gestureMode: "Gesture Mode",
    },

    // Settings Panel
    settings: {
      title: "Settings",
      language: "Language",
      theme: "Theme",
      dark: "Dark",
      light: "Light",
      oscSettings: "OSC Settings",
      oscPort: "OSC Port",
      oscAddress: "OSC Address",
      mappingSettings: "Mapping Settings",
      inputRange: "Input Range",
      outputRange: "Output Range",
      smoothing: "Smoothing",
      smoothFactor: "Smooth Factor",
      resetDefaults: "Reset to Defaults",
      exportConfig: "Export Config",
      importConfig: "Import Config",
    },

    // Errors and Messages
    messages: {
      connectionLost: "Connection lost. Reconnecting...",
      connectionRestored: "Connection restored",
      cameraNotFound: "No camera found",
      browserNotSupported: "Your browser does not support this feature",
      touchNotSupported: "Touch is not supported on this device",
      configSaved: "Configuration saved",
      configExported: "Configuration exported",
      configImported: "Configuration imported",
      invalidConfig: "Invalid configuration file",
    },

    // Mapping Editor
    mappingEditor: {
      title: "OSC Mapping Editor",
      performerTitle: "Performer Mapping Editor",
      audienceTitle: "Audience Touch Mapping Editor",
      gesture: "Gesture / Action",
      oscAddress: "OSC Address",
      range: "Range",
      enabled: "Enabled",
      disabled: "Disabled",
      inputRange: "Input",
      outputRange: "Output",
      smooth: "Smooth",
      smoothFactor: "Factor",
      export: "Export",
      import: "Import",
      reset: "Reset",
      save: "Save",
      close: "Close",
      apply: "Apply to All",
      configSaved: "Configuration saved!",
      configExported: "Configuration exported!",
      configImported: "Configuration imported!",
      configReset: "Configuration reset to defaults!",
      importError: "Failed to import configuration",
      selectFile: "Select File",
      noAddress: "Not configured",
      addressPlaceholder: "e.g. /pigments/param",
      multiAddress: "Multiple addresses (comma separated)",
      livePreview: "Live Preview",
      syncToPhones: "Sync to all audience phones",
      openEditor: "Mapping Editor",
    }
  },

  // ============================================
  // Chinese (中文)
  // ============================================
  zh: {
    // Common
    common: {
      connected: "已连接",
      disconnected: "未连接",
      connecting: "连接中...",
      performer: "演员",
      audience: "观众",
      settings: "设置",
      save: "保存",
      cancel: "取消",
      close: "关闭",
      loading: "加载中...",
      error: "错误",
      success: "成功",
      warning: "警告",
      on: "开",
      off: "关",
      enabled: "已启用",
      disabled: "已禁用",
      language: "语言",
      english: "English",
      chinese: "中文",
    },

    // MediaPipe Motion Capture Page
    mocap: {
      title: "Gestalt · 动作捕捉",
      pageTitle: "动作捕捉",
      cameraPermission: "请允许访问摄像头",
      cameraError: "摄像头访问被拒绝",
      startCapture: "开始捕捉",
      stopCapture: "停止捕捉",
      fps: "帧率",
      latency: "延迟",
      oscStatus: "OSC 状态",
      mappingPreset: "映射预设",
      parameters: "参数",
      leftHand: "左手",
      rightHand: "右手",
      leftHandHeight: "左手高度",
      rightHandHeight: "右手高度",
      leftHandX: "左手 X 坐标",
      rightHandX: "右手 X 坐标",
      armSpread: "手臂展开",
      bodyTilt: "身体倾斜",
      motionSpeed: "动作速度",
      leftHandOpenness: "左手张开度",
      rightHandOpenness: "右手张开度",
      noHandsDetected: "未检测到手部",
      handsDetected: "已检测到手部",
      poseDetected: "已检测到姿态",
      noPoseDetected: "未检测到姿态",
    },

    // Audience Monitor Page
    monitor: {
      title: "Gestalt · 控制面板",
      pageTitle: "控制面板",
      audienceCount: "观众数量",
      qrCode: "扫码加入",
      qrCodeLocal: "局域网",
      qrCodePublic: "公网访问",
      audienceUrl: "观众入口",
      copyUrl: "复制链接",
      urlCopied: "已复制!",
      noAudience: "暂无观众连接",
      waitingForAudience: "等待观众加入...",
      totalTouches: "触摸总数",
      activeUsers: "活跃用户",
      avgLatency: "平均延迟",
      oscMessages: "OSC 消息",
      recentActivity: "最近活动",
      systemStatus: "系统状态",
      serverRunning: "服务器运行中",
      maxMspConnected: "Max MSP 已连接",
      tunnelActive: "公网隧道已启用",
      tunnelInactive: "本地模式",
      particleDescription: "每个粒子代表一位观众 · 颜色代表手势类型 · 亮度代表强度",
      online: "在线",
      active: "活跃",
      globalParams: "全局参数",
      chaos: "混沌度",
      energy: "能量",
      density: "密度",
    },

    // Audience Touch Page
    touch: {
      title: "触摸演奏",
      pageTitle: "触摸交互",
      touchToStart: "触摸屏幕开始",
      swipeUp: "向上滑动",
      swipeDown: "向下滑动",
      swipeLeft: "向左滑动",
      swipeRight: "向右滑动",
      pinch: "捏合",
      spread: "张开",
      tap: "点击",
      hold: "长按",
      instructions: "用手指控制音乐",
      connectionStatus: "连接状态",
      touchCount: "触摸点数",
      gestureDetected: "检测到手势",
      noGesture: "触摸屏幕交互",
      screenKeyboard: "屏幕键盘模式",
      gestureMode: "手势模式",
    },

    // Settings Panel
    settings: {
      title: "设置",
      language: "语言",
      theme: "主题",
      dark: "深色",
      light: "浅色",
      oscSettings: "OSC 设置",
      oscPort: "OSC 端口",
      oscAddress: "OSC 地址",
      mappingSettings: "映射设置",
      inputRange: "输入范围",
      outputRange: "输出范围",
      smoothing: "平滑处理",
      smoothFactor: "平滑系数",
      resetDefaults: "恢复默认",
      exportConfig: "导出配置",
      importConfig: "导入配置",
    },

    // Errors and Messages
    messages: {
      connectionLost: "连接断开，正在重连...",
      connectionRestored: "连接已恢复",
      cameraNotFound: "未找到摄像头",
      browserNotSupported: "您的浏览器不支持此功能",
      touchNotSupported: "此设备不支持触摸",
      configSaved: "配置已保存",
      configExported: "配置已导出",
      configImported: "配置已导入",
      invalidConfig: "无效的配置文件",
    },

    // Mapping Editor
    mappingEditor: {
      title: "OSC 映射编辑器",
      performerTitle: "演员映射编辑器",
      audienceTitle: "观众触摸映射编辑器",
      gesture: "手势 / 动作",
      oscAddress: "OSC 地址",
      range: "范围",
      enabled: "已启用",
      disabled: "已禁用",
      inputRange: "输入",
      outputRange: "输出",
      smooth: "平滑",
      smoothFactor: "系数",
      export: "导出",
      import: "导入",
      reset: "重置",
      save: "保存",
      close: "关闭",
      apply: "应用到所有",
      configSaved: "配置已保存！",
      configExported: "配置已导出！",
      configImported: "配置已导入！",
      configReset: "配置已重置为默认！",
      importError: "导入配置失败",
      selectFile: "选择文件",
      noAddress: "未配置",
      addressPlaceholder: "例如 /pigments/param",
      multiAddress: "多个地址 (逗号分隔)",
      livePreview: "实时预览",
      syncToPhones: "同步到所有观众手机",
      openEditor: "映射编辑器",
    }
  }
};

// ============================================
// i18n Helper Functions
// ============================================

/**
 * Get current language from localStorage (default: 'en')
 */
function getCurrentLanguage() {
  return localStorage.getItem('osc-lang') || 'en';
}

/**
 * Set current language
 */
function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('osc-lang', lang);
    // Dispatch event for reactive updates
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    return true;
  }
  return false;
}

/**
 * Toggle between English and Chinese
 */
function toggleLanguage() {
  const current = getCurrentLanguage();
  const newLang = current === 'en' ? 'zh' : 'en';
  setLanguage(newLang);
  return newLang;
}

/**
 * Get translation by key path (e.g., 'common.connected')
 */
function t(keyPath) {
  const lang = getCurrentLanguage();
  const keys = keyPath.split('.');
  let result = translations[lang];
  
  for (const key of keys) {
    if (result && result[key] !== undefined) {
      result = result[key];
    } else {
      // Fallback to English
      result = translations.en;
      for (const k of keys) {
        if (result && result[k] !== undefined) {
          result = result[k];
        } else {
          return keyPath; // Return key if not found
        }
      }
      break;
    }
  }
  
  return result;
}

/**
 * Get all translations for current language
 */
function getTranslations() {
  return translations[getCurrentLanguage()];
}

/**
 * Create language switcher button HTML
 */
function createLanguageSwitcher(className = '') {
  const lang = getCurrentLanguage();
  const buttonText = lang === 'en' ? '中文' : 'EN';
  return `
    <button class="lang-switcher ${className}" onclick="toggleLanguageAndReload()" title="${t('common.language')}">
      🌍 ${buttonText}
    </button>
  `;
}

/**
 * Toggle language and reload page
 */
function toggleLanguageAndReload() {
  toggleLanguage();
  location.reload();
}

/**
 * Apply translations to elements with data-i18n attribute
 * Usage: <span data-i18n="common.connected">Connected</span>
 */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (translation) {
      el.textContent = translation;
    }
  });
  
  // Also update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (translation) {
      el.placeholder = translation;
    }
  });
  
  // Update title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translation = t(key);
    if (translation) {
      el.title = translation;
    }
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    translations,
    getCurrentLanguage,
    setLanguage,
    toggleLanguage,
    t,
    getTranslations,
    createLanguageSwitcher,
    applyTranslations
  };
}

// Make available globally
window.i18n = {
  translations,
  getCurrentLanguage,
  setLanguage,
  toggleLanguage,
  t,
  getTranslations,
  createLanguageSwitcher,
  toggleLanguageAndReload,
  applyTranslations
};

console.log(`🌍 i18n loaded. Current language: ${getCurrentLanguage()}`);


