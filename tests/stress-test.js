/**
 * 🎯 Audience Concurrency Stress Test Script
 * 
 * Function: Simulate large numbers of audience members connecting and sending touch data
 *           to measure system performance boundaries
 * 
 * Usage:
 * 1. One-click test (recommended): ./run-stress-test.sh
 * 2. Manual local test: node tests/stress-test.js
 * 3. Manual public test: node tests/stress-test.js wss://xxx.trycloudflare.com
 */

const WebSocket = require('ws');

// Get server URL from command line argument or use default
const serverUrlArg = process.argv[2] || 'ws://localhost:3000';
const isPublicMode = serverUrlArg.startsWith('wss://');

// Get language from environment variable (set by run-stress-test.sh)
const lang = process.env.STRESS_TEST_LANG || 'en';
const isZh = lang === 'zh';

// ===================== i18n TEXT =====================
const i18n = {
    title: isZh ? '观众压力测试 - Gestalt' : 'Audience Stress Test - Gestalt',
    modeLocal: isZh ? '模式: 本地模式（直接连接）' : 'MODE: LOCAL (direct connection)',
    modePublic: isZh ? '模式: 公网模式（通过 Cloudflare 隧道）' : 'MODE: PUBLIC NETWORK (via Cloudflare tunnel)',
    server: isZh ? '服务器' : 'Server',
    checkingServer: isZh ? '检测服务器连接...' : 'Checking server connection...',
    serverOk: isZh ? '服务器连接正常' : 'Server connection OK',
    testFailed: isZh ? '测试失败' : 'Test failed',
    ensureServer: isZh ? '请确保服务器已启动' : 'Please ensure server is running at',
    startingStage: isZh ? '开始测试阶段' : 'Starting test stage',
    targetClients: isZh ? '目标客户端数' : 'Target clients',
    duration: isZh ? '持续时间' : 'Duration',
    creatingClients: isZh ? '正在创建模拟客户端...' : 'Creating simulated clients...',
    connected: isZh ? '已连接' : 'Connected',
    connectionComplete: isZh ? '连接完成' : 'Connection complete',
    successful: isZh ? '成功' : 'successful',
    startingTransmission: isZh ? '开始发送数据...' : 'Starting data transmission...',
    messageRate: isZh ? '消息速率' : 'Message rate',
    totalSent: isZh ? '总发送' : 'Total sent',
    disconnecting: isZh ? '断开连接...' : 'Disconnecting...',
    stageResults: isZh ? '阶段结果' : 'Stage results',
    connectionSuccessRate: isZh ? '连接成功率' : 'Connection success rate',
    totalMessagesSent: isZh ? '消息发送总数' : 'Total messages sent',
    resting: isZh ? '休息2秒后进入下一阶段...' : 'Resting 2s before next stage...',
    finalReport: isZh ? '压力测试最终报告' : 'STRESS TEST FINAL REPORT',
    testMode: isZh ? '测试模式' : 'Test Mode',
    publicNetwork: isZh ? '公网模式' : 'PUBLIC NETWORK',
    local: isZh ? '本地模式' : 'LOCAL',
    totalDuration: isZh ? '总测试时长' : 'Total duration',
    totalMsgSent: isZh ? '总消息发送' : 'Total messages sent',
    totalMsgRecv: isZh ? '总消息接收' : 'Total messages received',
    successfulConn: isZh ? '连接成功' : 'Successful connections',
    failedConn: isZh ? '连接失败' : 'Failed connections',
    errors: isZh ? '错误数量' : 'Errors',
    testStage: isZh ? '测试阶段' : 'Test Stage',
    clients: isZh ? '连接数' : 'Clients',
    success: isZh ? '成功率' : 'Success',
    perfAssessment: isZh ? '性能评估结论' : 'Performance Assessment',
    stableAt: isZh ? '系统在 {0} 并发连接下运行稳定' : 'System stable at {0} concurrent connections',
    throughput: isZh ? '消息吞吐量' : 'Message throughput',
    failuresAt: isZh ? '在 {0} 并发时开始出现连接失败' : 'Connection failures started at {0} concurrent',
    recommendations: isZh ? '建议' : 'Recommendations',
    rec1: isZh ? '50-80人: 推荐用于一般演出场景' : '50-80 users: Recommended for typical performances',
    rec2: isZh ? '80-100人: 需要确保网络环境良好' : '80-100 users: Ensure good network conditions',
    rec3: isZh ? '100+人: 建议使用双机部署模式' : '100+ users: Consider dual-machine deployment',
    connectionTimeout: isZh ? '连接超时' : 'Connection timeout',
    serverNotResponding: isZh ? '服务器无响应' : 'Server not responding',
};

// ===================== CONFIGURATION =====================
const CONFIG = {
    serverUrl: serverUrlArg,  // WebSocket address (from command line or default)
    
    // Test stage configuration (reduced for public mode due to latency)
    stages: isPublicMode ? [
        { clients: 10,  duration: 10000, name: '10 Warmup' },
        { clients: 30,  duration: 15000, name: '30 Baseline' },
        { clients: 50,  duration: 15000, name: '50 Standard' },
        { clients: 80,  duration: 15000, name: '80 Stress' },
        { clients: 100, duration: 15000, name: '100 High' },
        { clients: 150, duration: 15000, name: '150 Extreme' },
    ] : [
        { clients: 10,  duration: 10000, name: '10 Warmup' },
        { clients: 30,  duration: 15000, name: '30 Baseline' },
        { clients: 50,  duration: 15000, name: '50 Standard' },
        { clients: 80,  duration: 15000, name: '80 Sampling' },
        { clients: 100, duration: 15000, name: '100 Stress' },
        { clients: 150, duration: 15000, name: '150 High' },
        { clients: 200, duration: 15000, name: '200 Extreme' },
    ],
    
    // Message send intervals (milliseconds)
    sendIntervals: {
        highIntensity: 30,   // High intensity interaction
        midIntensity: 50,    // Medium intensity interaction
        lowIntensity: 100,   // Low intensity interaction
    },
    
    // Message distribution ratio
    intensityDistribution: {
        high: 0.2,   // 20% of clients simulate high intensity
        mid: 0.5,    // 50% of clients simulate medium intensity
        low: 0.3,    // 30% of clients simulate low intensity
    },
};

// ===================== TEST STATE =====================
const stats = {
    totalMessagesSent: 0,
    totalMessagesReceived: 0,
    connectionSuccesses: 0,
    connectionFailures: 0,
    roundTripTimes: [],
    errors: [],
    stageResults: [],
};

// ===================== UTILITY FUNCTIONS =====================

/**
 * Generate simulated gesture data (matching real client format)
 */
function generateGestureData(intensity) {
    const gestures = ['swipe_up', 'swipe_down', 'swipe_left', 'swipe_right', 'idle'];
    const gesture = gestures[Math.floor(Math.random() * gestures.length)];
    
    // Simulate realistic touch position changes
    const x = Math.random();
    const y = Math.random();
    const dx = (Math.random() - 0.5) * 100;
    const dy = (Math.random() - 0.5) * 100;
    
    return {
        phase: 'move',
        position: { x, y },
        fingerCount: 1,
        touchPoints: [{ id: 0, x, y }],
        gesture: gesture,
        intensity: intensity,
        velocity: Math.random() * 0.5,
        dx: dx,
        dy: dy,
        distance: Math.sqrt(dx * dx + dy * dy),
    };
}

/**
 * Generate simulated OSC mapping messages
 */
function generateOSCMessages(data) {
    const messages = [];
    
    // Simulate swipe direction mapping
    if (data.gesture === 'swipe_up') {
        messages.push({ address: '/pigments/filter', value: data.intensity });
    } else if (data.gesture === 'swipe_down') {
        messages.push({ address: '/pigments/volume', value: data.intensity });
    }
    
    // Simulate position mapping
    messages.push({ address: '/pigments/pan', value: data.position.x * 2 - 1 });
    
    return messages;
}

/**
 * Calculate percentile
 */
function percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p / 100) - 1;
    return sorted[Math.max(0, index)];
}

// ===================== SIMULATED CLIENT CLASS =====================

class SimulatedAudience {
    constructor(id, intensityLevel) {
        this.id = `stress-test-${id}-${Date.now()}`;
        this.intensityLevel = intensityLevel;
        this.ws = null;
        this.connected = false;
        this.messagesSent = 0;
        this.messagesReceived = 0;
        this.sendInterval = null;
        this.pendingPings = new Map(); // For RTT measurement
    }
    
    connect(serverUrl) {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(serverUrl);
                
                // Longer timeout for public network (15s vs 5s)
                const timeoutMs = serverUrl.startsWith('wss://') ? 15000 : 5000;
                const timeout = setTimeout(() => {
                    this.ws.close();
                    reject(new Error(i18n.connectionTimeout));
                }, timeoutMs);
                
                this.ws.on('open', () => {
                    clearTimeout(timeout);
                    this.connected = true;
                    
                    // Send registration message
                    this.ws.send(JSON.stringify({
                        type: 'register_audience',
                        audienceId: this.id
                    }));
                    
                    stats.connectionSuccesses++;
                    resolve();
                });
                
                this.ws.on('message', (data) => {
                    this.messagesReceived++;
                    stats.totalMessagesReceived++;
                    
                    try {
                        const msg = JSON.parse(data);
                        
                        // Handle server broadcast messages
                        if (msg.type === 'audience_count' || msg.type === 'audience_details') {
                            // Calculate RTT if there's a matching ping
                            const pingKey = `${msg.type}-${msg.timestamp}`;
                            if (this.pendingPings.has(pingKey)) {
                                const rtt = Date.now() - this.pendingPings.get(pingKey);
                                stats.roundTripTimes.push(rtt);
                                this.pendingPings.delete(pingKey);
                            }
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                });
                
                this.ws.on('error', (err) => {
                    stats.errors.push(err.message);
                });
                
                this.ws.on('close', () => {
                    this.connected = false;
                });
                
            } catch (err) {
                stats.connectionFailures++;
                reject(err);
            }
        });
    }
    
    startSending() {
        // Determine send interval based on intensity level
        let interval;
        let intensity;
        
        if (this.intensityLevel === 'high') {
            interval = CONFIG.sendIntervals.highIntensity;
            intensity = 0.7 + Math.random() * 0.3; // 0.7-1.0
        } else if (this.intensityLevel === 'mid') {
            interval = CONFIG.sendIntervals.midIntensity;
            intensity = 0.3 + Math.random() * 0.4; // 0.3-0.7
        } else {
            interval = CONFIG.sendIntervals.lowIntensity;
            intensity = Math.random() * 0.3; // 0-0.3
        }
        
        this.sendInterval = setInterval(() => {
            if (!this.connected || !this.ws) return;
            
            try {
                const gestureData = generateGestureData(intensity);
                
                // 1. Send gesture data
                this.ws.send(JSON.stringify({
                    type: 'audience_gesture',
                    audienceId: this.id,
                    data: gestureData
                }));
                
                // 2. Send mapped OSC messages
                const oscMessages = generateOSCMessages(gestureData);
                if (oscMessages.length > 0) {
                    this.ws.send(JSON.stringify({
                        type: 'audience_osc_mapped',
                        audienceId: this.id,
                        oscMessages: oscMessages
                    }));
                }
                
                this.messagesSent += 2;
                stats.totalMessagesSent += 2;
                
            } catch (err) {
                stats.errors.push(err.message);
            }
        }, interval);
    }
    
    stopSending() {
        if (this.sendInterval) {
            clearInterval(this.sendInterval);
            this.sendInterval = null;
        }
    }
    
    disconnect() {
        this.stopSending();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// ===================== TEST EXECUTOR =====================

async function runStage(stage) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 ${i18n.startingStage}: ${stage.name}`);
    console.log(`   ${i18n.targetClients}: ${stage.clients}`);
    console.log(`   ${i18n.duration}: ${stage.duration / 1000}s`);
    console.log('='.repeat(60));
    
    const clients = [];
    const stageStats = {
        name: stage.name,
        targetClients: stage.clients,
        connectedClients: 0,
        messagesSent: 0,
        messagesReceived: 0,
        avgRTT: 0,
        p95RTT: 0,
        p99RTT: 0,
        errors: 0,
    };
    
    // Reset RTT stats
    stats.roundTripTimes = [];
    const stageStartMessages = stats.totalMessagesSent;
    
    // Create clients
    console.log(`📡 ${i18n.creatingClients} (${stage.clients})`);
    
    for (let i = 0; i < stage.clients; i++) {
        // Assign intensity level
        let level;
        const rand = Math.random();
        if (rand < CONFIG.intensityDistribution.high) {
            level = 'high';
        } else if (rand < CONFIG.intensityDistribution.high + CONFIG.intensityDistribution.mid) {
            level = 'mid';
        } else {
            level = 'low';
        }
        
        clients.push(new SimulatedAudience(i, level));
    }
    
    // Batch connect (50 per batch to avoid sudden pressure)
    const batchSize = 50;
    for (let i = 0; i < clients.length; i += batchSize) {
        const batch = clients.slice(i, i + batchSize);
        await Promise.allSettled(
            batch.map(client => client.connect(CONFIG.serverUrl))
        );
        console.log(`   ✅ ${i18n.connected}: ${Math.min(i + batchSize, clients.length)}/${clients.length}`);
    }
    
    stageStats.connectedClients = clients.filter(c => c.connected).length;
    console.log(`\n📊 ${i18n.connectionComplete}: ${stageStats.connectedClients}/${stage.clients} ${i18n.successful}`);
    
    // Start sending data
    console.log(`\n📤 ${i18n.startingTransmission}`);
    clients.forEach(client => {
        if (client.connected) {
            client.startSending();
        }
    });
    
    // Wait for test duration
    const startTime = Date.now();
    while (Date.now() - startTime < stage.duration) {
        await new Promise(r => setTimeout(r, 1000));
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const msgRate = Math.floor((stats.totalMessagesSent - stageStartMessages) / elapsed);
        process.stdout.write(`\r   ⏱️  ${elapsed}s | ${i18n.messageRate}: ${msgRate}/s | ${i18n.totalSent}: ${stats.totalMessagesSent - stageStartMessages}`);
    }
    console.log('');
    
    // Stop sending
    clients.forEach(client => client.stopSending());
    
    // Wait for final messages to process
    await new Promise(r => setTimeout(r, 500));
    
    // Collect statistics
    stageStats.messagesSent = stats.totalMessagesSent - stageStartMessages;
    stageStats.messagesReceived = clients.reduce((sum, c) => sum + c.messagesReceived, 0);
    
    if (stats.roundTripTimes.length > 0) {
        stageStats.avgRTT = Math.round(
            stats.roundTripTimes.reduce((a, b) => a + b, 0) / stats.roundTripTimes.length
        );
        stageStats.p95RTT = Math.round(percentile(stats.roundTripTimes, 95));
        stageStats.p99RTT = Math.round(percentile(stats.roundTripTimes, 99));
    }
    
    // Disconnect all clients
    console.log(`\n🔌 ${i18n.disconnecting}`);
    clients.forEach(client => client.disconnect());
    
    // Wait for connections to fully close
    await new Promise(r => setTimeout(r, 1000));
    
    // Output stage results
    console.log(`\n📈 ${i18n.stageResults}:`);
    console.log(`   ${i18n.connectionSuccessRate}: ${(stageStats.connectedClients / stage.clients * 100).toFixed(1)}%`);
    console.log(`   ${i18n.totalMessagesSent}: ${stageStats.messagesSent}`);
    console.log(`   ${i18n.messageRate}: ${Math.floor(stageStats.messagesSent / (stage.duration / 1000))}/s`);
    
    stats.stageResults.push(stageStats);
    
    // Rest between stages
    console.log(`\n💤 ${i18n.resting}`);
    await new Promise(r => setTimeout(r, 2000));
    
    return stageStats;
}

// ===================== MAIN FUNCTION =====================

async function main() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log(`║     🎯 ${i18n.title.padEnd(47)}║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    if (isPublicMode) {
        console.log(`║  🌐 ${i18n.modePublic.padEnd(53)}║`);
    } else {
        console.log(`║  🖥️  ${i18n.modeLocal.padEnd(52)}║`);
    }
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n📡 ${i18n.server}: ${CONFIG.serverUrl}\n`);
    
    const testStartTime = Date.now();
    
    try {
        // Test server connection with retries (important for public network)
        console.log(`🔍 ${i18n.checkingServer}`);
        
        const maxRetries = isPublicMode ? 5 : 2;
        let lastError = null;
        let connected = false;
        
        for (let retry = 1; retry <= maxRetries; retry++) {
            try {
                const testWs = new WebSocket(CONFIG.serverUrl);
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        testWs.close();
                        reject(new Error(i18n.connectionTimeout));
                    }, isPublicMode ? 10000 : 5000);
                    
                    testWs.on('open', () => {
                        clearTimeout(timeout);
                        testWs.close();
                        resolve();
                    });
                    testWs.on('error', (err) => {
                        clearTimeout(timeout);
                        reject(err);
                    });
                });
                connected = true;
                break;
            } catch (err) {
                lastError = err;
                if (retry < maxRetries) {
                    const retryMsg = isZh ? `   ⏳ 重试 ${retry}/${maxRetries}...` : `   ⏳ Retry ${retry}/${maxRetries}...`;
                    console.log(retryMsg);
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }
        
        if (!connected) {
            throw lastError || new Error(i18n.serverNotResponding);
        }
        
        console.log(`✅ ${i18n.serverOk}\n`);
        
        // Execute test stages
        for (const stage of CONFIG.stages) {
            await runStage(stage);
        }
        
    } catch (err) {
        console.error(`\n❌ ${i18n.testFailed}: ${err.message}`);
        console.error(`   ${i18n.ensureServer} ${CONFIG.serverUrl}`);
        process.exit(1);
    }
    
    // Output final report
    const totalDuration = Math.round((Date.now() - testStartTime) / 1000);
    
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log(`║                 📊 ${i18n.finalReport.padEnd(38)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n🔗 ${i18n.testMode}: ${isPublicMode ? `🌐 ${i18n.publicNetwork}` : `🖥️  ${i18n.local}`}`);
    console.log(`📡 ${i18n.server}: ${CONFIG.serverUrl}`);
    console.log(`⏱️  ${i18n.totalDuration}: ${totalDuration}s`);
    console.log(`📨 ${i18n.totalMsgSent}: ${stats.totalMessagesSent}`);
    console.log(`📬 ${i18n.totalMsgRecv}: ${stats.totalMessagesReceived}`);
    console.log(`✅ ${i18n.successfulConn}: ${stats.connectionSuccesses}`);
    console.log(`❌ ${i18n.failedConn}: ${stats.connectionFailures}`);
    console.log(`⚠️  ${i18n.errors}: ${stats.errors.length}`);
    
    const headerStage = i18n.testStage.padEnd(14);
    const headerClients = i18n.clients.padStart(7);
    const headerSuccess = i18n.success.padStart(7);
    const headerMsgRate = i18n.messageRate.padStart(12);
    
    console.log('\n┌────────────────┬─────────┬─────────┬──────────────┐');
    console.log(`│ ${headerStage} │ ${headerClients} │ ${headerSuccess} │ ${headerMsgRate} │`);
    console.log('├────────────────┼─────────┼─────────┼──────────────┤');
    
    for (const result of stats.stageResults) {
        const name = result.name.padEnd(14);
        const clients = String(result.connectedClients).padStart(7);
        const rate = ((result.connectedClients / result.targetClients) * 100).toFixed(0).padStart(6) + '%';
        const msgRate = (Math.floor(result.messagesSent / 15) + '/s').padStart(12);
        console.log(`│ ${name} │ ${clients} │ ${rate} │ ${msgRate} │`);
    }
    
    console.log('└────────────────┴─────────┴─────────┴──────────────┘');
    
    // Performance assessment conclusions
    console.log(`\n📋 ${i18n.perfAssessment}:`);
    
    const lastSuccessfulStage = [...stats.stageResults]
        .reverse()
        .find(r => r.connectedClients / r.targetClients > 0.9);
    
    if (lastSuccessfulStage) {
        console.log(`   ✅ ${i18n.stableAt.replace('{0}', lastSuccessfulStage.connectedClients)}`);
        console.log(`   ✅ ${i18n.throughput}: ${Math.floor(lastSuccessfulStage.messagesSent / 15)}/s`);
    }
    
    const failedStage = stats.stageResults.find(r => r.connectedClients / r.targetClients < 0.9);
    if (failedStage) {
        console.log(`   ⚠️  ${i18n.failuresAt.replace('{0}', failedStage.targetClients)}`);
    }
    
    console.log(`\n💡 ${i18n.recommendations}:`);
    console.log(`   - ${i18n.rec1}`);
    console.log(`   - ${i18n.rec2}`);
    console.log(`   - ${i18n.rec3}`);
    
    console.log('\n');
}

// Run main function
main().catch(console.error);
