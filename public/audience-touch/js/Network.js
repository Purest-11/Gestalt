/**
 * Network - 处理 WebSocket 通信
 * 
 * 升级：集成 OSC 映射系统
 */
import TouchOSCMapper from '../TouchOSCMapper.js';

export default class Network {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.ws = null;
        this.isConnected = false;
        this.audienceId = 'audience_' + Math.random().toString(36).substr(2, 9);
        
        this.heartbeatInterval = null; // 心跳定时器
        this.lastSendTime = 0; // 用于智能节流
        
        // 初始化 OSC 映射引擎
        this.oscMapper = new TouchOSCMapper();
        console.log('🎛️ OSC 映射引擎已启动');
        
        this.connect();
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const url = `${protocol}//${host}`;

        console.log(`Connecting to ${url}...`);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('Connected');
            this.isConnected = true;
            this.register();
            this.startHeartbeat(); // 启动心跳
            if (this.callbacks.onConnect) this.callbacks.onConnect();
        };

        this.ws.onclose = () => {
            console.log('Disconnected');
            this.isConnected = false;
            this.stopHeartbeat(); // 停止心跳
            if (this.callbacks.onDisconnect) this.callbacks.onDisconnect();
            setTimeout(() => this.connect(), 2000);
        };

        this.ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                this.handleMessage(msg);
            } catch (err) {
                console.error(err);
            }
        };
    }

    register() {
        this.send({
            type: 'register_audience',
            audienceId: this.audienceId
        });
    }

    send(data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    sendGesture(data) {
        
        // 智能节流：根据强度动态调整发送频率
        const now = Date.now();
        
        // 🎹 touchstart 永不节流（保证屏幕键盘响应）
        const isTouchStart = (data.phase === 'start');
        
        // 高强度交互 = 更频繁发送（30ms）
        // 低强度交互 = 较少发送（100ms）
        const intensity = data.intensity || 0;
        const minInterval = intensity > 0.5 ? 30 : (intensity > 0.2 ? 50 : 100);
        
        if (isTouchStart || !this.lastSendTime || now - this.lastSendTime >= minInterval) {
            // 1. 发送原始数据（用于大屏幕可视化）
            this.send({
                type: 'audience_gesture',
                audienceId: this.audienceId,
                data: data
            });
            
            // 2. 应用 OSC 映射并发送映射后的消息（用于音频控制）
            const oscMessages = this.oscMapper.process(data);
            
            if (oscMessages.length > 0) {
                this.send({
                    type: 'audience_osc_mapped',
                    audienceId: this.audienceId,
                    oscMessages: oscMessages  // [{address, value}, ...]
                });
                
                // 调试输出
                // 🎹 屏幕键盘：每次触发都显示
                const keyboardMsg = oscMessages.find(m => m.address.includes('/midi'));
                if (keyboardMsg) {
                    console.log(`🎹 触摸触发音符: ${keyboardMsg.value} (位置: x=${(data.position?.x * 100).toFixed(0)}%, y=${(data.position?.y * 100).toFixed(0)}%)`);
                }
                // 其他参数：随机采样显示
                else if (oscMessages.length > 0 && Math.random() > 0.95) {
                    console.log('🎛️ OSC 映射输出:', oscMessages.slice(0, 3));
                }
            }
            
            this.lastSendTime = now;
        }
    }

    handleMessage(msg) {
        switch (msg.type) {
            case 'audience_count':
            if (this.callbacks.onCount) this.callbacks.onCount(msg.count);
                break;
            
            case 'mapping_config_sync':
                // 收到监控页面发送的映射配置更新
                console.log('📡 收到映射配置同步');
                if (msg.config) {
                    // 1. 保存到 localStorage
                    try {
                        localStorage.setItem('osc_audience_mapping_config', JSON.stringify(msg.config));
                        console.log('💾 映射配置已保存到 localStorage');
                    } catch (e) {
                        console.warn('保存配置失败:', e);
                    }
                    
                    // 2. 直接更新 OSC 映射引擎
                    if (this.oscMapper) {
                        this.oscMapper.updateMappingsFromConfig(msg.config);
                    }
                    
                    // 3. 派发全局事件（兼容其他可能的监听者）
                    window.dispatchEvent(new CustomEvent('audienceMappingConfigUpdated', {
                        detail: msg.config
                    }));
                    
                    console.log('✅ 映射配置已更新并生效');
                }
                break;
            
            default:
                // 其他消息类型忽略
                break;
        }
    }

    /**
     * 启动心跳 - 每 5 秒发送一次，保持在线状态
     */
    startHeartbeat() {
        this.stopHeartbeat(); // 先清理旧的
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({
                    type: 'audience_heartbeat',
                    audienceId: this.audienceId
                });
                // console.log('❤️ Heartbeat sent'); // 注释掉以减少噪音
            }
        }, 5000); // 每 5 秒一次
    }

    /**
     * 停止心跳
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    /**
     * 重新加载 OSC 映射配置（热重载）
     */
    reloadOSCMappings() {
        this.oscMapper.reloadMappings();
        console.log('🔄 OSC 映射配置已热重载');
    }
}
