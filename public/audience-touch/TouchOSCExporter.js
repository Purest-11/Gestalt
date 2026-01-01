/**
 * 触摸数据导出器
 * 通过 WebSocket 发送触摸手势数据到服务器
 */
export default class TouchOSCExporter {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.reconnectDelay = 2000;
    this.audienceId = this.generateAudienceId();
    
    this.callbacks = {
      onConnect: null,
      onDisconnect: null,
      onAudienceCount: null,
      onError: null
    };
    
    // 数据节流
    this.lastSendTime = 0;
    this.minSendInterval = 50; // 50ms = 20fps
  }
  
  /**
   * 生成唯一观众 ID
   */
  generateAudienceId() {
    return `audience_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 连接到服务器
   */
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    console.log(`🔌 正在连接到 WebSocket: ${wsUrl}`);
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket 已连接');
        this.isConnected = true;
        
        // 注册为观众
        this.register();
        
        // 触发回调
        this.triggerCallback('onConnect');
        
        // 清除重连定时器
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ 解析消息失败:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket 错误:', error);
        this.triggerCallback('onError', error);
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket 已断开');
        this.isConnected = false;
        this.triggerCallback('onDisconnect');
        
        // 尝试重连
        this.scheduleReconnect();
      };
      
    } catch (error) {
      console.error('❌ WebSocket 连接失败:', error);
      this.triggerCallback('onError', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * 注册观众
   */
  register() {
    if (!this.isConnected) return;
    
    this.send({
      type: 'register_audience',
      audienceId: this.audienceId,
      timestamp: Date.now()
    });
    
    console.log(`👤 已注册为观众: ${this.audienceId}`);
  }
  
  /**
   * 发送触摸手势数据
   */
  sendGesture(gestureData) {
    if (!this.isConnected) return;
    
    // 节流：限制发送频率
    const now = Date.now();
    if (now - this.lastSendTime < this.minSendInterval) {
      return;
    }
    this.lastSendTime = now;
    
    // 发送数据
    this.send({
      type: 'audience_gesture',
      audienceId: this.audienceId,
      data: {
        gesture: gestureData.gesture || 'idle',
        direction: gestureData.direction || 0,
        distance: gestureData.distance || 0,
        velocity: gestureData.velocity || 0,
        intensity: gestureData.intensity || 0,
        fingerCount: gestureData.fingerCount || 1,
        position: gestureData.position || { x: 0, y: 0 }
      },
      timestamp: Date.now()
    });
  }
  
  /**
   * 发送消息
   */
  send(data) {
    if (!this.isConnected || !this.ws) return;
    
    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('❌ 发送消息失败:', error);
    }
  }
  
  /**
   * 处理接收到的消息
   */
  handleMessage(message) {
    switch (message.type) {
      case 'audience_registered':
        console.log('✅ 服务器确认注册');
        break;
      
      case 'audience_count':
        console.log(`👥 在线观众: ${message.count}`);
        this.triggerCallback('onAudienceCount', message.count);
        break;
      
      case 'mapping_config_sync':
        // 接收来自监控页面的映射配置更新
        console.log('📡 收到映射配置同步');
        if (message.config) {
          // 保存到 localStorage
          localStorage.setItem('osc_audience_mapping_config', JSON.stringify(message.config));
          // 触发配置更新回调
          this.triggerCallback('onMappingConfigUpdate', message.config);
          // 派发全局事件
          window.dispatchEvent(new CustomEvent('audienceMappingConfigUpdated', {
            detail: message.config
          }));
          console.log('✅ 映射配置已更新');
        }
        break;
      
      default:
        // console.log('📨 收到消息:', message);
        break;
    }
  }
  
  /**
   * 计划重连
   */
  scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    console.log(`⏰ ${this.reconnectDelay/1000} 秒后尝试重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
  }
  
  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      // 发送离开消息
      this.send({
        type: 'audience_leave',
        audienceId: this.audienceId,
        timestamp: Date.now()
      });
      
      // 关闭连接
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * 注册回调
   */
  on(event, callback) {
    const callbackName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
    if (this.callbacks.hasOwnProperty(callbackName)) {
      this.callbacks[callbackName] = callback;
    }
  }
  
  /**
   * 触发回调
   */
  triggerCallback(callbackName, data) {
    const callback = this.callbacks[callbackName];
    if (callback && typeof callback === 'function') {
      callback(data);
    }
  }
  
  /**
   * 获取连接状态
   */
  getConnectionState() {
    return this.isConnected;
  }
  
  /**
   * 获取观众 ID
   */
  getAudienceId() {
    return this.audienceId;
  }
}
