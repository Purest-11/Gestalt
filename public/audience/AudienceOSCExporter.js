/**
 * 观众端 OSC 导出器
 * 将手势数据转换为 OSC 消息并通过 WebSocket 发送
 */

export class AudienceOSCExporter {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    
    // WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.wsUrl = `${protocol}//${window.location.host}`;
    
    // 生成唯一观众 ID
    this.audienceId = this.generateAudienceId();
    
    // 连接状态回调
    this.onConnectionChange = null;
    this.onAudienceCountUpdate = null;
    
    // 节流控制
    this.lastSendTime = 0;
    this.throttleMs = 50; // 20 FPS
    
    console.log(`👤 观众 ID: ${this.audienceId}`);
    
    // 开始连接
    this.connect();
  }

  /**
   * 生成唯一观众 ID
   */
  generateAudienceId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `aud_${timestamp}_${random}`;
  }

  /**
   * 连接到 WebSocket 服务器
   */
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket 已连接，跳过重复连接');
      return;
    }

    try {
      console.log(`🔌 正在连接到 ${this.wsUrl}...`);
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket 已连接');
        this.reconnectAttempts = 0;
        
        // 注册为观众
        this.registerAsAudience();
        
        // 触发连接状态回调
        if (this.onConnectionChange) {
          this.onConnectionChange(true);
        }
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('❌ 解析消息失败:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket 错误:', error);
      };
      
      this.ws.onclose = () => {
        console.warn('⚠️ WebSocket 已断开');
        
        // 触发连接状态回调
        if (this.onConnectionChange) {
          this.onConnectionChange(false);
        }
        
        // 尝试重连
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('❌ 连接失败:', error);
      this.attemptReconnect();
    }
  }

  /**
   * 尝试重新连接
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ 达到最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
    
    console.log(`🔄 ${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * 注册为观众
   */
  registerAsAudience() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'register_audience',
        audienceId: this.audienceId,
        timestamp: Date.now()
      };
      
      this.ws.send(JSON.stringify(message));
      console.log('📝 已注册为观众');
    }
  }

  /**
   * 处理服务器消息
   */
  handleMessage(data) {
    switch (data.type) {
      case 'audience_count':
        console.log(`👥 在线观众: ${data.count}`);
        if (this.onAudienceCountUpdate) {
          this.onAudienceCountUpdate(data.count);
        }
        break;
      
      case 'audience_registered':
        console.log('✅ 观众注册成功');
        break;
      
      case 'performer_message':
        console.log('📢 演员消息:', data.message);
        // 可以在这里处理演员发送的指令
        break;
      
      default:
        // 忽略其他消息
        break;
    }
  }

  /**
   * 发送手势数据
   */
  sendGestureData(gestureData) {
    // 节流控制
    const now = Date.now();
    if (now - this.lastSendTime < this.throttleMs) {
      return;
    }
    this.lastSendTime = now;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'audience_gesture',
        audienceId: this.audienceId,
        data: {
          gesture: gestureData.gesture,
          intensity: gestureData.intensity,
          orientation: {
            tilt: gestureData.orientation.tilt,
            roll: gestureData.orientation.roll,
            spin: gestureData.orientation.spin
          },
          timestamp: gestureData.timestamp
        }
      };
      
      try {
        this.ws.send(JSON.stringify(message));
        // console.log('📤 发送手势数据:', gestureData.gesture, gestureData.intensity.toFixed(2));
      } catch (error) {
        console.error('❌ 发送数据失败:', error);
      }
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // 发送离开消息
      if (this.ws.readyState === WebSocket.OPEN) {
        const message = {
          type: 'audience_leave',
          audienceId: this.audienceId,
          timestamp: Date.now()
        };
        this.ws.send(JSON.stringify(message));
      }
      
      this.ws.close();
      this.ws = null;
      console.log('👋 已断开连接');
    }
  }

  /**
   * 获取连接状态
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}
