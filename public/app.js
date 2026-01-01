const { useState, useEffect, useRef, createContext, useContext } = React;

// ============================================
// Audience Touch Mapping Editor - Configuration & Component
// ============================================

// Available audience touch parameters
const AUDIENCE_PARAMS = [
  { id: 'screen_keyboard_note', nameEn: 'Screen Keyboard (MIDI)', nameZh: '屏幕键盘 (MIDI)', icon: '🎹', defaultRange: [36, 95] },
  { id: 'swipe_up', nameEn: 'Swipe Up', nameZh: '向上滑动', icon: '⬆️', defaultRange: [0, 1] },
  { id: 'swipe_down', nameEn: 'Swipe Down', nameZh: '向下滑动', icon: '⬇️', defaultRange: [0, 1] },
  { id: 'swipe_left', nameEn: 'Swipe Left', nameZh: '向左滑动', icon: '⬅️', defaultRange: [0, 1] },
  { id: 'swipe_right', nameEn: 'Swipe Right', nameZh: '向右滑动', icon: '➡️', defaultRange: [0, 1] },
  { id: 'two_finger_distance', nameEn: 'Two Finger Pinch/Spread', nameZh: '双指捏合/张开', icon: '🤏', defaultRange: [20, 400] },
  { id: 'gesture_energy', nameEn: 'Gesture Energy', nameZh: '手势能量', icon: '⚡', defaultRange: [0, 1] },
  { id: 'position_x', nameEn: 'Touch X Position', nameZh: '触摸X坐标', icon: '↔️', defaultRange: [0, 1] },
  { id: 'position_y', nameEn: 'Touch Y Position', nameZh: '触摸Y坐标', icon: '↕️', defaultRange: [0, 1] },
  { id: 'velocity', nameEn: 'Swipe Velocity', nameZh: '滑动速度', icon: '💨', defaultRange: [0, 5] },
  { id: 'finger_count', nameEn: 'Finger Count', nameZh: '手指数量', icon: '🖐️', defaultRange: [1, 5] }
];

// Default audience mapping configuration
const DEFAULT_AUDIENCE_CONFIG = {
  version: '1.0',
  mappings: [
    { id: 'screen_keyboard_note', enabled: true, oscAddress: '/pigments/midi', inputRange: [36, 95], outputRange: [36, 95], smooth: false, smoothFactor: 0 },
    { id: 'swipe_up', enabled: true, oscAddress: '/pigments/V1,/pigments/V2', inputRange: [0, 1], outputRange: [0, 1], smooth: true, smoothFactor: 0.3 },
    { id: 'two_finger_distance', enabled: true, oscAddress: '/pigments/reverb', inputRange: [20, 400], outputRange: [0, 1], smooth: true, smoothFactor: 0.2 },
    { id: 'gesture_energy', enabled: true, oscAddress: '/pigments/rate', inputRange: [0, 1], outputRange: [0, 1], smooth: true, smoothFactor: 0.3 },
    { id: 'swipe_down', enabled: false, oscAddress: '', inputRange: [0, 1], outputRange: [0, 1], smooth: true, smoothFactor: 0.15 },
    { id: 'swipe_left', enabled: false, oscAddress: '', inputRange: [0, 1], outputRange: [0, 1], smooth: true, smoothFactor: 0.15 },
    { id: 'swipe_right', enabled: false, oscAddress: '', inputRange: [0, 1], outputRange: [0, 1], smooth: true, smoothFactor: 0.15 },
    { id: 'position_x', enabled: false, oscAddress: '', inputRange: [0, 1], outputRange: [0, 1], smooth: true, smoothFactor: 0.2 },
    { id: 'position_y', enabled: false, oscAddress: '', inputRange: [0, 1], outputRange: [0, 1], smooth: true, smoothFactor: 0.2 },
    { id: 'velocity', enabled: false, oscAddress: '', inputRange: [0, 5], outputRange: [0, 1], smooth: true, smoothFactor: 0.1 },
    { id: 'finger_count', enabled: false, oscAddress: '', inputRange: [1, 5], outputRange: [0, 1], smooth: false, smoothFactor: 0 }
  ]
};

const AUDIENCE_MAPPING_STORAGE_KEY = 'osc_audience_mapping_config';

// Load audience mapping config
function loadAudienceMappingConfig() {
  try {
    const saved = localStorage.getItem(AUDIENCE_MAPPING_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load audience mapping config:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_AUDIENCE_CONFIG));
}

// Save audience mapping config
function saveAudienceMappingConfig(config, wsRef) {
  config.lastModified = new Date().toISOString();
  localStorage.setItem(AUDIENCE_MAPPING_STORAGE_KEY, JSON.stringify(config));
  
  // Broadcast to all audience phones via WebSocket
  if (wsRef && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'audience_mapping_config_update',
      config: config
    }));
    console.log('📡 Audience mapping config broadcasted to all phones');
  }
}

// Audience Mapping Editor Component
function AudienceMappingEditor({ isOpen, onClose, wsRef }) {
  const [config, setConfig] = useState(() => loadAudienceMappingConfig());
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  const isZh = window.i18n ? window.i18n.getCurrentLanguage() === 'zh' : true;
  
  const texts = {
    title: isZh ? '观众触摸映射编辑器' : 'Audience Touch Mapping Editor',
    export: isZh ? '导出' : 'Export',
    import: isZh ? '导入' : 'Import',
    reset: isZh ? '重置' : 'Reset',
    close: isZh ? '关闭' : 'Close',
    oscAddress: isZh ? 'OSC 地址' : 'OSC Address',
    inputRange: isZh ? '输入' : 'Input',
    outputRange: isZh ? '输出' : 'Output',
    smooth: isZh ? '平滑' : 'Smooth',
    syncInfo: isZh ? '配置将自动同步到所有观众手机' : 'Config syncs to all audience phones automatically',
    configSaved: isZh ? '配置已保存！' : 'Configuration saved!',
    configExported: isZh ? '配置已导出！' : 'Configuration exported!',
    configImported: isZh ? '配置已导入！' : 'Configuration imported!',
    configReset: isZh ? '配置已重置！' : 'Configuration reset!',
    confirmReset: isZh ? '确定要重置为默认配置吗？' : 'Reset to default configuration?'
  };
  
  const getParamName = (id) => {
    const param = AUDIENCE_PARAMS.find(p => p.id === id);
    if (!param) return id;
    return isZh ? param.nameZh : param.nameEn;
  };
  
  const getParamIcon = (id) => {
    const param = AUDIENCE_PARAMS.find(p => p.id === id);
    return param?.icon || '🎛️';
  };
  
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 2500);
  };
  
  const updateMapping = (index, field, value) => {
    const newConfig = { ...config };
    newConfig.mappings = [...config.mappings];
    newConfig.mappings[index] = { ...newConfig.mappings[index], [field]: value };
    setConfig(newConfig);
    saveAudienceMappingConfig(newConfig, wsRef);
  };
  
  const updateRange = (index, field, pos, value) => {
    const newConfig = { ...config };
    newConfig.mappings = [...config.mappings];
    const newRange = [...newConfig.mappings[index][field]];
    newRange[pos] = parseFloat(value) || 0;
    newConfig.mappings[index] = { ...newConfig.mappings[index], [field]: newRange };
    setConfig(newConfig);
    saveAudienceMappingConfig(newConfig, wsRef);
  };
  
  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osc-audience-mapping-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(texts.configExported);
  };
  
  const importConfig = async (file) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (!imported.mappings || !Array.isArray(imported.mappings)) {
        throw new Error('Invalid config');
      }
      setConfig(imported);
      saveAudienceMappingConfig(imported, wsRef);
      showToast(texts.configImported);
    } catch (e) {
      console.error('Import failed:', e);
      showToast(isZh ? '导入失败' : 'Import failed', 'error');
    }
  };
  
  const resetConfig = () => {
    if (confirm(texts.confirmReset)) {
      const defaultConfig = JSON.parse(JSON.stringify(DEFAULT_AUDIENCE_CONFIG));
      setConfig(defaultConfig);
      saveAudienceMappingConfig(defaultConfig, wsRef);
      showToast(texts.configReset);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div style={{
        width: '90%',
        maxWidth: '800px',
        maxHeight: '85vh',
        background: 'linear-gradient(135deg, rgba(30, 35, 60, 0.98) 0%, rgba(20, 25, 45, 0.98) 100%)',
        border: '1px solid rgba(100, 150, 255, 0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(100, 150, 255, 0.15)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎛️ {texts.title}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={exportConfig} style={editorBtnStyle}>📤 {texts.export}</button>
            <button onClick={() => fileInputRef.current?.click()} style={editorBtnStyle}>📥 {texts.import}</button>
            <button onClick={resetConfig} style={{...editorBtnStyle, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)'}}>🔄 {texts.reset}</button>
            <button onClick={onClose} style={{...editorBtnStyle, width: '36px', padding: '8px'}}>✕</button>
          </div>
        </div>
        
        {/* Sync Info */}
        <div style={{
          padding: '10px 24px',
          background: 'rgba(74, 222, 128, 0.1)',
          borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
          fontSize: '12px',
          color: '#4ade80',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📡 {texts.syncInfo}
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {config.mappings.map((mapping, index) => (
            <div 
              key={mapping.id}
              style={{
                background: mapping.enabled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(100, 150, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                opacity: mapping.enabled ? 1 : 0.5,
                transition: 'all 0.2s'
              }}
            >
              {/* Mapping Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                    {getParamIcon(mapping.id)} {getParamName(mapping.id)}
                  </div>
                </div>
                <div
                  onClick={() => updateMapping(index, 'enabled', !mapping.enabled)}
                  style={{
                    width: '44px',
                    height: '24px',
                    background: mapping.enabled ? '#667eea' : 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: mapping.enabled ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    background: '#fff',
                    borderRadius: '50%',
                    transition: 'all 0.3s'
                  }}></div>
                </div>
              </div>
              
              {/* Mapping Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* OSC Address */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>{texts.oscAddress}</label>
                  <input
                    type="text"
                    value={mapping.oscAddress || ''}
                    onChange={(e) => updateMapping(index, 'oscAddress', e.target.value)}
                    placeholder={isZh ? '例如 /pigments/param' : 'e.g. /pigments/param'}
                    disabled={!mapping.enabled}
                    style={inputStyle}
                  />
                </div>
                
                {/* Input Range */}
                <div>
                  <label style={labelStyle}>{texts.inputRange}</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={mapping.inputRange[0]}
                      onChange={(e) => updateRange(index, 'inputRange', 0, e.target.value)}
                      disabled={!mapping.enabled}
                      style={{...inputStyle, width: '70px', textAlign: 'center'}}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>→</span>
                    <input
                      type="number"
                      value={mapping.inputRange[1]}
                      onChange={(e) => updateRange(index, 'inputRange', 1, e.target.value)}
                      disabled={!mapping.enabled}
                      style={{...inputStyle, width: '70px', textAlign: 'center'}}
                    />
                  </div>
                </div>
                
                {/* Output Range */}
                <div>
                  <label style={labelStyle}>{texts.outputRange}</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={mapping.outputRange[0]}
                      onChange={(e) => updateRange(index, 'outputRange', 0, e.target.value)}
                      disabled={!mapping.enabled}
                      style={{...inputStyle, width: '70px', textAlign: 'center'}}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>→</span>
                    <input
                      type="number"
                      value={mapping.outputRange[1]}
                      onChange={(e) => updateRange(index, 'outputRange', 1, e.target.value)}
                      disabled={!mapping.enabled}
                      style={{...inputStyle, width: '70px', textAlign: 'center'}}
                    />
                  </div>
                </div>
                
                {/* Smooth */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={labelStyle}>{texts.smooth}</label>
                  <div
                    onClick={() => mapping.enabled && updateMapping(index, 'smooth', !mapping.smooth)}
                    style={{
                      width: '36px',
                      height: '20px',
                      background: mapping.smooth ? '#4ade80' : 'rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      cursor: mapping.enabled ? 'pointer' : 'default',
                      position: 'relative',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: mapping.smooth ? '18px' : '2px',
                      width: '16px',
                      height: '16px',
                      background: '#fff',
                      borderRadius: '50%',
                      transition: 'all 0.3s'
                    }}></div>
                  </div>
                  <input
                    type="number"
                    value={mapping.smoothFactor}
                    onChange={(e) => updateMapping(index, 'smoothFactor', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="1"
                    step="0.05"
                    disabled={!mapping.enabled || !mapping.smooth}
                    style={{...inputStyle, width: '60px', textAlign: 'center'}}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importConfig(file);
            e.target.value = '';
          }}
        />
      </div>
      
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: toastMessage.type === 'success' 
            ? 'rgba(74, 222, 128, 0.15)' 
            : 'rgba(248, 113, 113, 0.15)',
          border: `1px solid ${toastMessage.type === 'success' ? '#4ade80' : '#f87171'}`,
          borderRadius: '8px',
          color: '#fff',
          fontSize: '13px',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease'
        }}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
}

// Editor button style
const editorBtnStyle = {
  padding: '8px 14px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(100, 150, 255, 0.2)',
  borderRadius: '6px',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

// Editor label style
const labelStyle = {
  fontSize: '11px',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
  display: 'block'
};

// Editor input style
const inputStyle = {
  padding: '10px 12px',
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(100, 150, 255, 0.15)',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '13px',
  fontFamily: '"SF Mono", "Menlo", monospace',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none'
};

// WebSocket 连接管理
function useWebSocket(url) {
  const [connected, setConnected] = useState(false);
  const [audienceCount, setAudienceCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket 已连接');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // 监听观众数量更新
        if (data.type === 'audience_count') {
          setAudienceCount(data.count);
          setActiveCount(data.activeCount || 0);
          console.log('👥 观众数量更新:', data.count, '活跃:', data.activeCount);
        }
      } catch (error) {
        console.error('解析消息失败:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket 已断开');
      setConnected(false);
      setAudienceCount(0);
      setActiveCount(0);
      // 尝试重连
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          const newWs = new WebSocket(url);
          wsRef.current = newWs;
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      setConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  const sendMessage = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket 未连接');
    }
  };

  return { connected, audienceCount, activeCount, sendMessage, wsRef };
}

// 滑块组件
function Slider({ label, address, min = 0, max = 1, step = 0.01, defaultValue = 0, sendMessage }) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    sendMessage({
      type: 'slider',
      address: address,
      value: newValue
    });
  };

  return (
    <div className="slider-group">
      <div className="slider-label">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

// 按钮组件
function Button({ label, address, value = 1, sendMessage }) {
  const handleClick = () => {
    sendMessage({
      type: 'button',
      address: address,
      value: value
    });
  };

  return (
    <button className="btn btn-primary" onClick={handleClick}>
      {label}
    </button>
  );
}

// 开关组件
function Toggle({ label, address, sendMessage }) {
  const [active, setActive] = useState(false);

  const handleToggle = () => {
    const newState = !active;
    setActive(newState);
    sendMessage({
      type: 'toggle',
      address: address,
      value: newState ? 1 : 0
    });
  };

  return (
    <button
      className={`btn btn-toggle ${active ? 'active' : ''}`}
      onClick={handleToggle}
    >
      {label}: {active ? 'ON' : 'OFF'}
    </button>
  );
}

// 声像控制组件
function PanControl({ label, address, sendMessage }) {
  const [pan, setPan] = useState(0);
  const panRef = useRef(null);

  const handlePanChange = (e) => {
    const newPan = parseFloat(e.target.value);
    setPan(newPan);
    sendMessage({
      type: 'pan',
      address: address,
      value: newPan
    });
  };

  // 计算指示器位置
  const angle = pan * 90; // -90 到 90 度
  const radius = 80;
  const x = Math.sin((angle * Math.PI) / 180) * radius;
  const y = -Math.cos((angle * Math.PI) / 180) * radius;

  return (
    <div className="pan-control">
      <h3>{label}</h3>
      <div className="pan-visualizer">
        <div
          className="pan-indicator"
          style={{
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
          }}
        />
      </div>
      <input
        type="range"
        className="slider pan-slider"
        min={-1}
        max={1}
        step={0.01}
        value={pan}
        onChange={handlePanChange}
      />
      <div className="value-display">{pan.toFixed(2)}</div>
    </div>
  );
}

// 【数字苍穹 (Digital Firmament)】视觉升级版
// 结合了真实观众数据 + 艺术化粒子效果 + 3D透视背景
function AudienceParticles({ activeCount, totalCount }) {
  const canvasRef = useRef(null);
  const audienceMapRef = useRef(new Map()); 
  const collectiveEffectsRef = useRef([]); 
  const sparksRef = useRef([]); // 粒子爆发火花
  const starsRef = useRef([]); // 背景漂浮尘埃
  const animationRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // 重置星空
      initStars();
    };
    window.addEventListener('resize', resize);
    
    // 初始化星空背景
    const initStars = () => {
      starsRef.current = [];
      const starCount = 200; // 星星数量
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.2 + 0.05
        });
      }
    };
    resize(); // 初始化

    // 创建爆发火花
    const createSpark = (x, y, color, speed) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 5 + 2) * speed;
      return {
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1.0,
        decay: Math.random() * 0.05 + 0.02,
        color: color,
        size: Math.random() * 2 + 1
      };
    };

    // 连接 WebSocket 接收详细观众数据
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'audience_details') {
          updateAudienceParticles(data.audiences);
        }
      } catch (error) {
        console.error('解析观众数据失败:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };

    // 为每个观众创建或更新粒子
    const updateAudienceParticles = (audiences) => {
      const now = Date.now();
      const receivedIds = new Set();

      audiences.forEach(audience => {
        receivedIds.add(audience.id);
        
        let particle = audienceMapRef.current.get(audience.id);
        
        if (!particle) {
          // 新观众 - 创建粒子
          particle = createParticleForAudience(audience);
          audienceMapRef.current.set(audience.id, particle);
        } else {
          // 更新现有粒子
          updateParticleFromAudience(particle, audience);
        }
      });

      // 移除已离线的观众粒子
      for (const [id, particle] of audienceMapRef.current.entries()) {
        if (!receivedIds.has(id)) {
          particle.fadeOut = true; // 标记淡出
        }
      }
    };

    // 创建粒子（代表一个观众）
    const createParticleForAudience = (audience) => {
      const targetX = audience.position.x * canvas.width;
      const targetY = audience.position.y * canvas.height;
      
      return {
        id: audience.id,
        // 位置（从屏幕边缘飞入）
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX: targetX,
        targetY: targetY,
        
        // 运动
        vx: 0,
        vy: 0,
        
        // 视觉属性
        size: 8,
        energy: 0,
        opacity: 0,
        
        // 轨迹
        trail: [],
        
        // 观众数据
        gesture: audience.gesture,
        intensity: audience.intensity,
        velocity: audience.velocity,
        direction: audience.direction,
        active: audience.active,
        
        // 动画状态
        fadeIn: true,
        fadeOut: false,
        birthTime: Date.now()
      };
    };

    // 更新粒子（根据观众的实时数据）
    const updateParticleFromAudience = (particle, audience) => {
      // 更新目标位置
      particle.targetX = audience.position.x * canvas.width;
      particle.targetY = audience.position.y * canvas.height;
      
      // 更新观众数据
      particle.gesture = audience.gesture;
      particle.intensity = audience.intensity;
      particle.velocity = audience.velocity;
      particle.direction = audience.direction;
      particle.active = audience.active;
      
      // 取消淡出
      particle.fadeOut = false;
    };

    // 手势配色方案
    const getGestureColor = (gesture, intensity) => {
      const colors = {
        'swipe_up': { h: 180, s: 100, l: 60 },      // 青色 - 上升
        'swipe_down': { h: 280, s: 100, l: 60 },    // 紫色 - 下降
        'swipe_left': { h: 30, s: 100, l: 60 },     // 橙色 - 左
        'swipe_right': { h: 120, s: 100, l: 60 },   // 绿色 - 右
        'idle': { h: 210, s: 70, l: 50 }            // 蓝色 - 静止
      };
      
      const color = colors[gesture] || colors['idle'];
      const brightness = 50 + intensity * 30; // 强度越大越亮
      return `hsla(${color.h}, ${color.s}%, ${brightness}%, ${0.8})`;
    };

    // 创建集体效果（当多人同时互动时）
    const createCollectiveEffect = (type, x, y) => {
      collectiveEffectsRef.current.push({
        type: type, // 'burst', 'ripple', 'wave'
        x: x,
        y: y,
        radius: 0,
        maxRadius: 300,
        opacity: 1,
        life: 1.0,
        color: `hsla(${Math.random() * 360}, 100%, 70%, 1)`
      });
    };

    // 主动画循环
    const animate = () => {
      const now = Date.now();
      
      // 1. 清除画布（深邃宇宙色）
      ctx.globalCompositeOperation = 'source-over';
      // 使用径向渐变模拟晕影效果
      const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width * 0.8
      );
      gradient.addColorStop(0, '#0a0f1e');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. 绘制电影级背景（星空 + 透视网格）
      drawCinematicBackground(ctx, canvas, now);

      // 统计活跃观众数量
      let currentActiveCount = 0;
      const particles = Array.from(audienceMapRef.current.values());
      
      particles.forEach(p => {
        if (p.active) currentActiveCount++;
      });

      // 集体效果触发
      if (currentActiveCount > 5 && Math.random() > 0.98) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        createCollectiveEffect('ripple', centerX, centerY);
      }

      // 3. 更新和渲染集体效果
      ctx.globalCompositeOperation = 'lighter';
      for (let i = collectiveEffectsRef.current.length - 1; i >= 0; i--) {
        const effect = collectiveEffectsRef.current[i];
        effect.radius += 8;
        effect.opacity -= 0.02;
        effect.life -= 0.02;

        if (effect.life <= 0) {
          collectiveEffectsRef.current.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
          ctx.strokeStyle = effect.color.replace('1)', `${effect.opacity})`);
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }

      // 4. 更新和渲染火花 (新增！)
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        s.vy += 0.1; // 重力

        if (s.life <= 0) {
            sparksRef.current.splice(i, 1);
        } else {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
            ctx.fillStyle = s.color.replace('0.8)', `${s.life})`);
            ctx.fill();
        }
      }

      // 5. 更新和渲染每个观众粒子
      const toDelete = [];
      
      for (const [id, p] of audienceMapRef.current.entries()) {
        // ... (保持原有的淡入淡出和运动逻辑) ...
        if (p.fadeIn) {
          p.opacity = Math.min(p.opacity + 0.05, 1);
          if (p.opacity >= 1) p.fadeIn = false;
        }
        if (p.fadeOut) {
          p.opacity = Math.max(p.opacity - 0.03, 0);
          if (p.opacity <= 0) {
            toDelete.push(id);
            continue;
          }
        }

        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const easing = p.active ? 0.15 : 0.05;
        p.vx = dx * easing;
        p.vy = dy * easing;
        p.x += p.vx;
        p.y += p.vy;

        p.energy = p.active ? Math.min(p.energy + 0.1, 1) : Math.max(p.energy - 0.05, 0);

        // 如果移动速度够快，产生火花！
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (p.active && speed > 2) {
             sparksRef.current.push(createSpark(p.x, p.y, getGestureColor(p.gesture, p.intensity), speed/10));
        }

        // 记录轨迹
        if (p.active && p.energy > 0.3) {
          p.trail.unshift({ x: p.x, y: p.y, opacity: p.energy, width: 3 + p.intensity * 5 });
          if (p.trail.length > 40) p.trail.pop(); // 更长的轨迹
        } else {
          if (p.trail.length > 0) p.trail.pop();
        }

        // 绘制轨迹 (流体感)
        if (p.trail.length > 1) {
          ctx.globalCompositeOperation = 'lighter'; // 高亮叠加
          for (let i = 0; i < p.trail.length - 1; i++) {
            const t1 = p.trail[i];
            const t2 = p.trail[i + 1];
            const progress = i / p.trail.length;
            const alpha = (1 - progress) * t1.opacity * p.opacity * 0.9;
            const width = t1.width * (1 - progress); // 渐变宽度
            
            ctx.beginPath();
            ctx.moveTo(t1.x, t1.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.strokeStyle = getGestureColor(p.gesture, p.intensity).replace('0.8)', `${alpha})`);
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }

        // 绘制粒子核心 (发光球体)
        const baseSize = 8 + p.intensity * 12;
        const pulseSize = baseSize + Math.sin(now * 0.01 + p.x) * 3;
        const renderSize = pulseSize * (p.active ? 1.5 : 0.8);
        
        // 强力光环
        if (p.active && p.energy > 0.5) {
          const glowSize = renderSize * 3; // 更大的光环
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
          const color = getGestureColor(p.gesture, p.intensity);
          gradient.addColorStop(0, color.replace('0.8)', `${p.opacity})`)); // 中心更亮
          gradient.addColorStop(1, color.replace('0.8)', '0)'));
          
          ctx.fillStyle = gradient;
          ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);
        }

        // 实体核心
        ctx.beginPath();
        ctx.arc(p.x, p.y, renderSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF'; // 核心永远是白热的
        ctx.fill();
        
        // 染色外层
        ctx.beginPath();
        ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2);
        ctx.fillStyle = getGestureColor(p.gesture, p.intensity).replace('0.8)', `${p.opacity * 0.5})`);
        ctx.fill();

        // 方向指示器
        if (p.active && p.velocity > 0.1) {
          drawDirectionIndicator(ctx, p);
        }
      }

      // 绘制粒子间连接（观众网络）
      drawAudienceNetwork(ctx, particles, now);

      // 删除已淡出的粒子
      toDelete.forEach(id => audienceMapRef.current.delete(id));
      
      ctx.globalCompositeOperation = 'source-over'; // 恢复混合模式
      animationRef.current = requestAnimationFrame(animate);
    };

    // 绘制电影级背景 (星空 + 3D地平线)
    const drawCinematicBackground = (ctx, canvas, time) => {
       // 1. 绘制星空
       ctx.globalCompositeOperation = 'lighter';
       starsRef.current.forEach(star => {
           // 星星闪烁
           const twinkle = Math.sin(time * 0.003 * star.speed + star.x) * 0.3 + 0.7;
           ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity * twinkle})`;
           ctx.beginPath();
           ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
           ctx.fill();
           
           // 星星缓慢漂移
           star.y += star.speed;
           if (star.y > canvas.height) star.y = 0;
       });

       // 2. 绘制 3D 透视网格 (地平线效果)
       const horizonY = canvas.height * 0.6; // 地平线位置
       const gridSpeed = (time * 0.05) % 100; // 前进速度
       
       ctx.lineWidth = 1;
       ctx.strokeStyle = 'rgba(60, 100, 200, 0.15)'; // 科技蓝

       // 纵向线 (透视)
       const verticalLines = 20;
       const centerX = canvas.width / 2;
       for(let i = -verticalLines; i <= verticalLines; i++) {
           const x = centerX + i * 150; // 底部间距
           ctx.beginPath();
           ctx.moveTo(centerX, horizonY); // 汇聚点
           ctx.lineTo(x, canvas.height);
           ctx.stroke();
       }

       // 横向线 (随距离变密)
       const horizontalLines = 10;
       for(let i = 0; i < horizontalLines; i++) {
           const y = horizonY + Math.pow(i/horizontalLines, 2) * (canvas.height - horizonY);
           // 添加移动动画
           const offset = (gridSpeed * (i+1) * 0.1) % 50;
           const drawY = y + offset;
           if(drawY > canvas.height) continue;
           
           ctx.beginPath();
           ctx.moveTo(0, drawY);
           ctx.lineTo(canvas.width, drawY);
           
           // 距离越远越淡
           const alpha = (drawY - horizonY) / (canvas.height - horizonY) * 0.2;
           ctx.strokeStyle = `rgba(60, 100, 200, ${alpha})`;
           ctx.stroke();
       }
       
       // 地平线发光
       const glow = ctx.createLinearGradient(0, horizonY, 0, horizonY + 100);
       glow.addColorStop(0, 'rgba(100, 200, 255, 0.2)');
       glow.addColorStop(1, 'rgba(0,0,0,0)');
       ctx.fillStyle = glow;
       ctx.fillRect(0, horizonY, canvas.width, 100);
    };

    // 绘制方向指示器
    const drawDirectionIndicator = (ctx, particle) => {
      const arrowLength = 30 + particle.velocity * 50;
      const angleRad = particle.direction * Math.PI / 180;
      
      const endX = particle.x + Math.cos(angleRad) * arrowLength;
      const endY = particle.y + Math.sin(angleRad) * arrowLength;
      
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = getGestureColor(particle.gesture, particle.intensity).replace('0.8)', `${particle.opacity * 0.6})`);
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // 箭头
      const arrowSize = 10;
      const angle1 = angleRad + Math.PI * 0.8;
      const angle2 = angleRad - Math.PI * 0.8;
      
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX + Math.cos(angle1) * arrowSize, endY + Math.sin(angle1) * arrowSize);
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX + Math.cos(angle2) * arrowSize, endY + Math.sin(angle2) * arrowSize);
      ctx.stroke();
    };

    // 绘制观众网络（粒子间连线）
    const drawAudienceNetwork = (ctx, particles, time) => {
      ctx.globalCompositeOperation = 'lighter';
      
      const activeParticles = particles.filter(p => p.active && !p.fadeOut);
      
      for (let i = 0; i < activeParticles.length; i++) {
        for (let j = i + 1; j < activeParticles.length; j++) {
          const p1 = activeParticles[i];
          const p2 = activeParticles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const maxDist = 250;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.3 * Math.min(p1.opacity, p2.opacity);
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      
      ctx.globalCompositeOperation = 'source-over';
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, 
        background: 'radial-gradient(circle at center, #0a0f1e 0%, #050a15 100%)' 
      }} 
    />
  );
}

// 观众系统专用监控面板组件
function AudienceMonitor({ connected, sendMessage, serverInfo, audienceCount, activeCount, wsRef }) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMappingEditorOpen, setIsMappingEditorOpen] = useState(false);
  const [currentServerInfo, setCurrentServerInfo] = useState(serverInfo);
  const audienceUrl = currentServerInfo?.audienceUrl || '';
  const tunnelMode = currentServerInfo?.tunnelMode || 'local';
  
  // i18n - Get current language
  const isZh = window.i18n ? window.i18n.getCurrentLanguage() === 'zh' : true;
  
  // i18n text definitions
  const i18nTexts = {
    title: isZh ? 'Gestalt · 观众监控' : 'Gestalt · Audience Monitor',
    collapse: isZh ? '折叠 ▲' : 'Collapse ▲',
    expand: isZh ? '展开 ▼' : 'Expand ▼',
    online: isZh ? '在线' : 'Online',
    offline: isZh ? '离线' : 'Offline',
    modeCloudflare: isZh ? '国外公网' : 'International',
    modeCpolar: isZh ? '国内公网' : 'China',
    modeLocal: isZh ? '本地模式' : 'Local Mode',
    audienceOnline: isZh ? '在线' : 'Online',
    audienceActive: isZh ? '活跃' : 'Active',
    scanToJoin: isZh ? '扫码加入' : 'Scan to Join',
    globalParams: isZh ? '全局参数' : 'Global Parameters',
    fullscreen: isZh ? '全屏' : 'Fullscreen',
    exitFullscreen: isZh ? '退出全屏' : 'Exit Fullscreen'
  };
  
  // 定期检查服务器信息更新（支持运行中切换模式）
  useEffect(() => {
    const checkServerInfo = () => {
      fetch('/api/server-info')
        .then(res => res.json())
        .then(data => {
          if (data.audienceUrl !== currentServerInfo?.audienceUrl) {
            console.log('🔄 Server info updated:', data);
            setCurrentServerInfo(data);
          }
        })
        .catch(err => console.warn('Failed to get server info:', err));
    };
    
    // 初始加载
    checkServerInfo();
    
    // 每5秒检查一次
    const interval = setInterval(checkServerInfo, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // 同步外部 serverInfo 更新
  useEffect(() => {
    if (serverInfo && serverInfo.audienceUrl !== currentServerInfo?.audienceUrl) {
      setCurrentServerInfo(serverInfo);
    }
  }, [serverInfo]);
  
  // 获取模式显示信息
  const getModeInfo = () => {
    switch(tunnelMode) {
      case 'cloudflare':
        return { icon: '🌍', label: i18nTexts.modeCloudflare, color: '#60a5fa' };
      case 'cpolar':
        return { icon: '🇨🇳', label: i18nTexts.modeCpolar, color: '#f97316' };
      default:
        return { icon: '🏠', label: i18nTexts.modeLocal, color: '#4ade80' };
    }
  };
  
  const modeInfo = getModeInfo();

  // 全屏切换函数
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // 进入全屏
      document.documentElement.requestFullscreen().catch(err => {
        console.error('无法进入全屏:', err);
      });
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
      if (audienceUrl && isPanelOpen) {
          const container = document.getElementById('qrcode-monitor');
          if (container) {
              container.innerHTML = '';
              // 根据模式选择二维码颜色
              let qrColor = '#000000'; // 默认黑色
              if (tunnelMode === 'cloudflare') {
                qrColor = '#2563eb'; // 蓝色 - 国外
              } else if (tunnelMode === 'cpolar') {
                qrColor = '#ea580c'; // 橙色 - 国内
              }
              new window.QRCode(container, {
                  text: audienceUrl,
                  width: 120,
                  height: 120,
                  colorDark: qrColor,
                  colorLight: '#ffffff',
                  correctLevel: window.QRCode.CorrectLevel.H
              });
          }
      }
  }, [audienceUrl, isPanelOpen, tunnelMode]);

  return (
    <div style={{ 
      position: 'relative',
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', 
      color: 'white', 
      fontFamily: '"Rajdhani", sans-serif'
    }}>
      
      {/* 全屏粒子动画背景 */}
      <AudienceParticles activeCount={activeCount} totalCount={audienceCount} />

      {/* 浮动控制面板 - 右上角 */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 100,
        maxWidth: isPanelOpen ? '420px' : '280px',
        transition: 'all 0.3s ease'
      }}>
        
        {/* 主信息卡片 - 始终显示 */}
        <div style={{ 
          background: 'rgba(10, 15, 30, 0.03)', // 97% 透明度
          backdropFilter: 'blur(4px)', // 降低模糊度，让背景更清晰
          borderRadius: '20px',
          border: '1px solid rgba(100, 150, 255, 0.15)', // 边框也更淡
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          marginBottom: '15px',
          transition: 'all 0.3s ease'
        }}>
          
          {/* 标题栏 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '22px', 
              fontWeight: '700',
              background: 'linear-gradient(to right, #fff, #a5b4fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1px'
            }}>
              {i18nTexts.title}
            </h2>
            {/* 折叠按钮 */}
            <button 
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              style={{ 
                background: 'rgba(100, 150, 255, 0.2)',
                border: '1px solid rgba(100, 150, 255, 0.4)',
                borderRadius: '8px',
                color: '#a5b4fc',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isPanelOpen ? i18nTexts.collapse : i18nTexts.expand}
            </button>
          </div>

          {/* 状态指示 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
                width: '8px', height: '8px', borderRadius: '50%', 
                background: connected ? '#4ade80' : '#f87171',
                boxShadow: connected ? '0 0 10px #4ade80' : 'none'
            }}></span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                {connected ? 'ONLINE' : 'OFFLINE'}
            </span>
            </div>
            {/* 网络模式指示 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              background: `${modeInfo.color}20`,
              border: `1px solid ${modeInfo.color}50`,
              borderRadius: '12px',
              padding: '3px 10px',
              fontSize: '11px'
            }}>
              <span>{modeInfo.icon}</span>
              <span style={{ color: modeInfo.color }}>{modeInfo.label}</span>
            </div>
          </div>

          {/* 观众统计 - 大数字显示 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            padding: '15px 0',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', letterSpacing: '1px' }}>{i18nTexts.audienceOnline}</div>
              <div style={{ 
                fontSize: '42px', 
                fontWeight: '800', 
                lineHeight: 1,
                textShadow: '0 0 20px rgba(100, 150, 255, 0.6)',
                color: '#818cf8'
              }}>
                {audienceCount}
              </div>
            </div>
            
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', letterSpacing: '1px' }}>{i18nTexts.audienceActive}</div>
              <div style={{ 
                fontSize: '42px', 
                fontWeight: '800', 
                lineHeight: 1,
                textShadow: activeCount > 0 ? '0 0 20px rgba(252, 165, 165, 0.6)' : 'none',
                color: activeCount > 0 ? '#fca5a5' : 'rgba(255,255,255,0.3)'
              }}>
                {activeCount}
              </div>
            </div>
          </div>

          {/* 系统信息 */}
          <div style={{ marginTop: '15px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between' }}>
            <span>OSC: 7402</span>
            <span>WEB: 3002</span>
          </div>
        </div>

        {/* 展开的控制面板 */}
        {isPanelOpen && (
          <div style={{ 
            background: 'rgba(10, 15, 30, 0.03)', // 97% 透明度
            backdropFilter: 'blur(5px)',
            borderRadius: '20px',
            border: '1px solid rgba(100, 150, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            animation: 'fadeIn 0.3s ease'
          }}>
            
            {/* 二维码 */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div id="qrcode-monitor" style={{ 
                background: 'white', 
                padding: '12px', 
                borderRadius: '12px',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(100, 200, 255, 0.2)',
                marginBottom: '10px'
              }}></div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                📱 {i18nTexts.scanToJoin}
              </div>
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '8px 12px', 
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#818cf8',
                wordBreak: 'break-all',
                lineHeight: 1.4
              }}>
                {audienceUrl}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 映射编辑器按钮 - 左下角，全屏按钮上方 */}
      <button
        onClick={() => setIsMappingEditorOpen(true)}
        style={{
          position: 'fixed',
          bottom: '100px',
          left: '30px',
          zIndex: 100,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(139, 92, 246, 0.35))',
          border: '2px solid rgba(167, 139, 250, 0.5)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(167, 139, 250, 0.3), 0 0 0 4px rgba(167, 139, 250, 0.1)',
          cursor: 'pointer',
          color: '#c4b5fd',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(167, 139, 250, 0.4), 0 0 0 6px rgba(167, 139, 250, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(167, 139, 250, 0.3), 0 0 0 4px rgba(167, 139, 250, 0.1)';
        }}
        title={isZh ? '映射编辑器' : 'Mapping Editor'}
      >
        🎛️
      </button>

      {/* 全屏按钮 - 独立浮动在左下角 */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          zIndex: 100,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isFullscreen 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.35))' 
            : 'linear-gradient(135deg, rgba(100, 150, 255, 0.25), rgba(59, 130, 246, 0.35))',
          border: isFullscreen 
            ? '2px solid rgba(34, 197, 94, 0.5)' 
            : '2px solid rgba(100, 150, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          boxShadow: isFullscreen
            ? '0 8px 32px rgba(34, 197, 94, 0.3), 0 0 0 4px rgba(34, 197, 94, 0.1)'
            : '0 8px 32px rgba(100, 150, 255, 0.3), 0 0 0 4px rgba(100, 150, 255, 0.1)',
          cursor: 'pointer',
          color: isFullscreen ? '#86efac' : '#a5b4fc',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          e.currentTarget.style.boxShadow = isFullscreen
            ? '0 12px 40px rgba(34, 197, 94, 0.4), 0 0 0 6px rgba(34, 197, 94, 0.15)'
            : '0 12px 40px rgba(100, 150, 255, 0.4), 0 0 0 6px rgba(100, 150, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = isFullscreen
            ? '0 8px 32px rgba(34, 197, 94, 0.3), 0 0 0 4px rgba(34, 197, 94, 0.1)'
            : '0 8px 32px rgba(100, 150, 255, 0.3), 0 0 0 4px rgba(100, 150, 255, 0.1)';
        }}
        title={isFullscreen ? '退出全屏 (Esc)' : '进入全屏 (F11)'}
      >
        {isFullscreen ? '⊗' : '⛶'}
      </button>

      {/* 底部提示 */}
      <div style={{ 
        position: 'fixed', 
        bottom: '30px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(0,0,0,0.6)',
        padding: '12px 30px',
        borderRadius: '25px',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        letterSpacing: '0.5px'
      }}>
        {window.i18n ? window.i18n.t('monitor.particleDescription') : 'Each particle = one audience member · Color = gesture type · Brightness = intensity'}
      </div>

      {/* 映射编辑器 Modal */}
      <AudienceMappingEditor 
        isOpen={isMappingEditorOpen} 
        onClose={() => setIsMappingEditorOpen(false)}
        wsRef={wsRef}
      />

    </div>
  );
}

// 主应用组件
function SliderControl({ label, address, min = 0, max = 1, step = 0.01, sendMessage }) {
  const [value, setValue] = useState(0);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    sendMessage({
      type: 'slider',
      address: address,
      value: newValue
    });
  };

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '6px', 
        fontSize: '12px', 
        color: 'rgba(255,255,255,0.7)' 
      }}>
        <span>{label}</span>
        <span style={{ 
          fontFamily: 'monospace', 
          color: '#818cf8',
          fontWeight: '600'
        }}>
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        style={{ 
          width: '100%', 
          cursor: 'pointer',
          height: '4px',
          borderRadius: '2px',
          background: 'rgba(100, 150, 255, 0.2)',
          outline: 'none',
          WebkitAppearance: 'none',
          appearance: 'none'
        }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

// 主应用组件
function App() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}`;
  const { connected, audienceCount, activeCount, sendMessage, wsRef } = useWebSocket(wsUrl);

  // 获取 URL 参数
  const urlParams = new URLSearchParams(window.location.search);
  const performerParam = urlParams.get('performer');
  const isAudienceMonitor = performerParam === 'audience';
  const performerId = isAudienceMonitor ? 'audience' : (parseInt(performerParam) || 1);

  // 动态修改页面标题 / Dynamic page title
  useEffect(() => {
    const isZh = window.i18n ? window.i18n.getCurrentLanguage() === 'zh' : true;
    if (isAudienceMonitor) {
      document.title = isZh ? 'Gestalt · 观众监控' : 'Gestalt · Audience Monitor';
    } else {
      document.title = isZh ? 'Gestalt · 控制面板' : 'Gestalt · Control Panel';
    }
  }, [isAudienceMonitor]);

  // Wake Lock - 防止页面在后台时被节流（对于监控页面尤其重要）
  useEffect(() => {
    let wakeLock = null;
    
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('🔒 Wake Lock 已激活 - 页面将保持活跃');
          
          wakeLock.addEventListener('release', () => {
            console.log('🔓 Wake Lock 已释放');
          });
        } catch (err) {
          console.warn('Wake Lock 请求失败:', err.message);
        }
      }
    };
    
    requestWakeLock();
    
    // 页面重新可见时重新请求
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  // 获取服务器信息（包括 IP 地址）
  const [serverInfo, setServerInfo] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // 生成二维码的函数（使用 QRCodeJS2 库）
    const generateQRCode = (url) => {
      try {
        console.log('🔍 开始生成二维码:', url);
        
        // 检查 QRCode 库是否加载
        if (typeof window.QRCode === 'undefined') {
          console.error('❌ QRCode 库未加载，等待 1 秒后重试...');
          setTimeout(() => generateQRCode(url), 1000);
          return;
        }
        
        console.log('✅ QRCode 库已加载');
        
        // 创建一个临时容器
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        // 使用 QRCodeJS2 生成二维码
        const qr = new window.QRCode(tempDiv, {
          text: url,
          width: 200,
          height: 200,
          colorDark: '#667eea',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H
        });
        
        // 等待二维码生成完成
        setTimeout(() => {
          const canvas = tempDiv.querySelector('canvas');
          if (canvas) {
            const dataUrl = canvas.toDataURL();
            console.log('✅ 二维码生成成功');
            setQrCodeUrl(dataUrl);
          } else {
            console.error('❌ 未找到 canvas 元素');
          }
          // 清理临时容器
          document.body.removeChild(tempDiv);
        }, 100);
        
      } catch (err) {
        console.error('❌ 生成二维码失败:', err);
      }
    };

    // 延迟执行，确保 QRCode 库已加载
    const initTimeout = setTimeout(() => {
      console.log('🚀 开始获取服务器信息...');
      
      fetch('/api/server-info')
        .then(res => {
          console.log('📡 API 响应状态:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('📊 服务器信息:', data);
          setServerInfo(data);
          // 延迟生成二维码
          setTimeout(() => generateQRCode(data.audienceUrl), 200);
        })
        .catch(err => {
          console.error('❌ 获取服务器信息失败:', err);
          // 使用默认值 - 观众系统固定端口 3002
          const hostname = window.location.hostname;
          const defaultUrl = `${window.location.protocol}//${hostname}:3002/audience-touch/`;
          setServerInfo({
            ip: hostname,
            port: 3002,
            audienceUrl: defaultUrl
          });
          setTimeout(() => generateQRCode(defaultUrl), 200);
        });
    }, 800); // 延迟 800ms 确保库加载完成

    return () => clearTimeout(initTimeout);
  }, []);

  const audienceUrl = serverInfo?.audienceUrl || `${window.location.protocol}//${window.location.host}/audience-touch/`;

  if (isAudienceMonitor) {
    return (
      <AudienceMonitor 
        connected={connected} 
        sendMessage={sendMessage} 
        serverInfo={serverInfo} 
        audienceCount={audienceCount}
        activeCount={activeCount}
        wsRef={wsRef}
      />
    );
  }

  return (
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>🎛️ OSC 控制器</h1>
        <div style={{
          padding: '10px 20px',
          background: '#667eea',
          borderRadius: '10px',
          color: 'white',
          fontWeight: 'bold'
        }}>
          演员 {performerId}
        </div>
      </div>
      
      <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '✓ 已连接到服务器' : '✗ 未连接到服务器'}
      </div>
      
      {/* 观众互动信息面板 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '15px',
        marginBottom: '20px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px'
        }}>
          {/* 左侧：信息和链接 */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>👥 观众互动系统</h3>
              {audienceCount > 80 && (
                <span style={{
                  fontSize: '11px',
                  background: 'rgba(255,255,255,0.25)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: '1px solid rgba(255,255,255,0.4)'
                }}>
                  ⚡ 性能优化中
                </span>
              )}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '15px' }}>
              {window.i18n?.getCurrentLanguage() === 'zh' ? '在线观众:' : 'Online Audience:'} <strong style={{ fontSize: '24px', marginLeft: '10px' }}>{audienceCount}</strong>
              {audienceCount > 80 && (
                <span style={{ fontSize: '12px', marginLeft: '10px', opacity: 0.7 }}>
                  (采样 80 人)
                </span>
              )}
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '12px 15px',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.6',
              marginBottom: '10px'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                📱 观众访问方式：
              </div>
              <div style={{ marginBottom: '5px' }}>
                1️⃣ 扫描右侧二维码（推荐）
              </div>
              <div style={{ marginBottom: '8px' }}>
                2️⃣ 或手动输入链接：
              </div>
              <code style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '8px 12px',
                borderRadius: '5px',
                display: 'block',
                wordBreak: 'break-all',
                fontSize: '12px'
              }}>
                {audienceUrl}
              </code>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a 
                href={audienceUrl}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  border: '2px solid rgba(255,255,255,0.5)',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  fontSize: '14px'
                }}
                target="_blank"
              >
                📱 打开观众端
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(audienceUrl);
                  alert('链接已复制到剪贴板！');
                }}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '10px',
                  border: '2px solid rgba(255,255,255,0.5)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📋 复制链接
              </button>
            </div>
          </div>

          {/* 右侧：二维码 */}
          <div style={{
            background: 'white',
            padding: '15px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            <div style={{ 
              color: '#667eea', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              fontSize: '14px'
            }}>
              📱 扫码访问
            </div>
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="观众端二维码" 
                style={{ 
                  width: '200px', 
                  height: '200px',
                  display: 'block'
                }} 
              />
            ) : (
              <div style={{
                width: '200px',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0f0f0',
                borderRadius: '8px',
                color: '#999',
                fontSize: '14px'
              }}>
                生成中...
              </div>
            )}
            <div style={{ 
              color: '#667eea', 
              fontSize: '12px', 
              marginTop: '10px',
              fontWeight: 'normal'
            }}>
              {serverInfo?.ip || 'loading...'}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        background: '#f0f0f0',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <strong>🎭 MediaPipe 动作捕捉：</strong>
        <a 
          href={`/mocap/?performer=${performerId}`}
          style={{
            marginLeft: '10px',
            padding: '5px 15px',
            background: '#667eea',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none',
            display: 'inline-block'
          }}
          target="_blank"
        >
          打开动作捕捉
        </a>
        <a 
          href={`/?performer=audience`}
          style={{
            marginLeft: '10px',
            padding: '5px 15px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: 'bold'
          }}
          target="_blank"
        >
          👥 观众监控面板
        </a>
      </div>

      {/* Pigments 合成器控制区 */}
      <h2 className="section-title">🎹 Pigments 合成器控制</h2>
      <div className="pigments-row">
        {/* Pigments 1 */}
        <div className="control-panel">
          <h3>Pigments 1</h3>
          <Slider
            label="start"
            address="/pigments1/start"
            min={-1}
            max={1}
            defaultValue={0.5}
            sendMessage={sendMessage}
          />
          <Slider
            label="volume-vocal"
            address="/pigments1/VC"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="volume-mangtong"
            address="/pigments1/VM"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="CUTOFF1"
            address="/pigments1/CUTOFF1"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="CUTOFF2"
            address="/pigments1/CUTOFF2"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="混响"
            address="/pigments1/REVERB"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
        </div>

        {/* Pigments 2 */}
        <div className="control-panel">
          <h3>Pigments 2</h3>
          <Slider
            label="start"
            address="/pigments2/start"
            min={-1}
            max={1}
            defaultValue={0.5}
            sendMessage={sendMessage}
          />
          <Slider
            label="volume-vocal"
            address="/pigments2/VC"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="volume-mangtong"
            address="/pigments2/VM"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="CUTOFF1"
            address="/pigments2/CUTOFF1"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="CUTOFF2"
            address="/pigments2/CUTOFF2"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="混响"
            address="/pigments2/REVERB"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
        </div>

        {/* Pigments 3 */}
        <div className="control-panel">
          <h3>Pigments 3</h3>
          <Slider
            label="start"
            address="/pigments3/start"
            min={-1}
            max={1}
            defaultValue={0.5}
            sendMessage={sendMessage}
          />
          <Slider
            label="volume-vocal"
            address="/pigments3/VC"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="volume-mangtong"
            address="/pigments3/VM"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="CUTOFF1"
            address="/pigments3/CUTOFF1"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="CUTOFF2"
            address="/pigments3/CUTOFF2"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="混响"
            address="/pigments3/REVERB"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
        </div>

        {/* Pigments 4 */}
        <div className="control-panel">
          <h3>Pigments 4</h3>
          <Slider
            label="start"
            address="/pigments4/start"
            min={-1}
            max={1}
            defaultValue={0.5}
            sendMessage={sendMessage}
          />
          <Slider
            label="volume-vocal"
            address="/pigments4/VC"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="volume-mangtong"
            address="/pigments4/VM"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="CUTOFF1"
            address="/pigments4/CUTOFF1"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="CUTOFF2"
            address="/pigments4/CUTOFF2"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
          <Slider
            label="混响"
            address="/pigments4/REVERB"
            min={0}
            max={1}
            defaultValue={0}
            sendMessage={sendMessage}
          />
        </div>
      </div>

      {/* 辅助控制区 */}
      <h2 className="section-title">🎚️ 辅助控制</h2>
      <div className="controls-row">
        {/* 按钮控制面板 */}
        <div className="control-panel">
          <h3>⏯️ 按钮控制</h3>
          <div className="button-group">
            <Button
              label="播放"
              address="/play"
              sendMessage={sendMessage}
            />
            <Button
              label="停止"
              address="/stop"
              sendMessage={sendMessage}
            />
            <Button
              label="暂停"
              address="/pause"
              sendMessage={sendMessage}
            />
            <Button
              label="录制"
              address="/record"
              sendMessage={sendMessage}
            />
          </div>
        </div>

        {/* 开关控制面板 */}
        <div className="control-panel">
          <h3>🔘 开关控制</h3>
          <div className="button-group">
            <Toggle
              label="效果器"
              address="/effect"
              sendMessage={sendMessage}
            />
            <Toggle
              label="压缩器"
              address="/compressor"
              sendMessage={sendMessage}
            />
            <Toggle
              label="延迟"
              address="/delay"
              sendMessage={sendMessage}
            />
            <Toggle
              label="滤波器"
              address="/filter"
              sendMessage={sendMessage}
            />
          </div>
        </div>

        {/* 声像控制面板 */}
        <div className="control-panel">
          <PanControl
            label="🎛️ 声像控制"
            address="/pan"
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}

// 渲染应用
ReactDOM.render(<App />, document.getElementById('root'));

