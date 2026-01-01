const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const dgram = require('dgram');
const osc = require('osc-min');
const path = require('path');
const cors = require('cors');
const os = require('os');

const app = express();
const server = http.createServer(app);

// 中间件
app.use(cors());
app.use((req, res, next) => {
  // 允许运动传感器（iOS 16+/17+ 否则会直接返回 denied 且不弹窗）
  res.setHeader('Permissions-Policy', 'accelerometer=*, gyroscope=*');
  // 兼容旧版 Safari/Chromium 的 header 名
  res.setHeader('Feature-Policy', 'accelerometer *; gyroscope *');
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// 映射 Three.js 路径，确保手机能访问本地库
app.use('/lib/three', express.static(path.join(__dirname, 'node_modules/three')));

// 获取本机 IP 地址（用于显示给观众）
function getLocalIPAddress() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // 跳过内部地址和非 IPv4 地址
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ 无法获取网络接口信息，使用 localhost');
  }
  return 'localhost';
}

// 公网URL存储（用于隧道模式）
let publicTunnelUrl = null;
let tunnelMode = 'local'; // 'local', 'cloudflare', 'cpolar'

// API: 设置公网URL（由启动脚本调用）
app.post('/api/set-tunnel-url', (req, res) => {
  const { url, mode } = req.body;
  if (url) {
    publicTunnelUrl = url;
    tunnelMode = mode || 'tunnel';
    console.log(`🌐 公网URL已设置: ${url} (模式: ${tunnelMode})`);
    res.json({ success: true, url: publicTunnelUrl, mode: tunnelMode });
  } else {
    res.status(400).json({ error: '缺少 url 参数' });
  }
});

// API: 清除公网URL（切换到本地模式时调用）
app.post('/api/clear-tunnel-url', (req, res) => {
  publicTunnelUrl = null;
  tunnelMode = 'local';
  console.log('🏠 已切换到本地模式');
  res.json({ success: true });
});

// API: 获取服务器信息（包括 IP 地址）
app.get('/api/server-info', (req, res) => {
  const localIP = getLocalIPAddress();
  const port = parseInt(process.env.PORT || '3000');
  
  // 观众系统固定使用端口 3002
  const audiencePort = 3002;
  const localUrl = `http://${localIP}:${audiencePort}/audience-touch/`;
  
  // 如果有公网URL，优先使用公网URL
  const audienceUrl = publicTunnelUrl 
    ? `${publicTunnelUrl}/audience-touch/`
    : localUrl;
  
  res.json({
    ip: localIP,
    port: port,
    audienceUrl: audienceUrl,
    localUrl: localUrl,
    publicUrl: publicTunnelUrl,
    tunnelMode: tunnelMode,
    performerId: PERFORMER_ID || '1',
    audienceCount: audienceData ? audienceData.size : 0
  });
});

// API: 获取性能统计（新增）
app.get('/api/performance', (req, res) => {
  res.json({
    audienceCount: audienceData.size,
    avgProcessTime: performanceStats.avgProcessTime.toFixed(2),
    maxAudienceCount: performanceStats.maxAudienceCount,
    totalAggregations: performanceStats.totalAggregations,
    sampleSize: Math.min(audienceData.size, MAX_SAMPLE_SIZE),
    isOptimized: audienceData.size > MAX_SAMPLE_SIZE
  });
});

// 根路由 - 明确返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 处理 - 所有未知路由都重定向到首页（SPA 支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// OSC 配置
const OSC_PORT = parseInt(process.env.OSC_PORT || '7400');
const USE_BROADCAST = process.env.USE_BROADCAST !== 'false'; // 默认启用广播
const PERFORMER_ID = process.env.PERFORMER_ID || '1'; // 默认演员 ID 为 1

console.log(`🎭 当前演员 ID: ${PERFORMER_ID}`);

// 获取广播地址
function getBroadcastAddress() {
  try {
    const interfaces = os.networkInterfaces();
    const broadcastAddresses = [];

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // 只处理 IPv4 且非内部地址
        if (iface.family === 'IPv4' && !iface.internal) {
          const addr = iface.address.split('.');
          const netmask = iface.netmask.split('.');
          
          // 计算广播地址
          const broadcast = addr.map((octet, i) => {
            return (parseInt(octet) | (~parseInt(netmask[i]) & 0xff)).toString();
          }).join('.');
          
          broadcastAddresses.push(broadcast);
          console.log(`发现网络接口 ${name}: ${iface.address} -> 广播地址: ${broadcast}`);
        }
      }
    }

    // 如果没有找到，使用通用广播地址
    if (broadcastAddresses.length === 0) {
      console.log('未找到网络接口，使用通用广播地址 255.255.255.255');
      return ['255.255.255.255'];
    }

    return broadcastAddresses;
  } catch (error) {
    console.warn('⚠️ 无法获取网络接口信息，使用通用广播地址');
    return ['255.255.255.255'];
  }
}

// 创建 UDP socket
const udpSocket = dgram.createSocket('udp4');

// 设置 socket 选项以支持端口重用
udpSocket.bind(() => {
  try {
    // 启用广播
    udpSocket.setBroadcast(true);
    console.log('✓ UDP socket 已启用广播模式');
    
    // 启用端口重用（防止"Address already in use"错误）
    if (typeof udpSocket.setMulticastInterface === 'function') {
      udpSocket.setMulticastInterface('0.0.0.0');
    }
  } catch (error) {
    console.error('启用广播失败:', error);
  }
});

// UDP socket 错误处理
udpSocket.on('error', (error) => {
  console.error('UDP socket 错误:', error);
});

// 发送 OSC 消息（广播模式 + Web Audio 引擎转发）
function sendOSCMessage(address, ...args) {
  try {
    // 构建 OSC 消息
    const oscMessage = osc.toBuffer({
      address: address,
      args: args.map(arg => {
        // 根据类型自动判断
        if (typeof arg === 'number') {
          if (Number.isInteger(arg)) {
            return { type: 'integer', value: arg };
          } else {
            return { type: 'float', value: arg };
          }
        } else if (typeof arg === 'string') {
          return { type: 'string', value: arg };
        } else if (typeof arg === 'boolean') {
          return { type: 'integer', value: arg ? 1 : 0 };
        }
        return { type: 'float', value: arg };
      })
    });

    if (USE_BROADCAST) {
      // 广播模式：发送到所有广播地址
      const broadcastAddresses = getBroadcastAddress();
      broadcastAddresses.forEach(broadcastAddr => {
        udpSocket.send(oscMessage, 0, oscMessage.length, OSC_PORT, broadcastAddr, (err) => {
          if (err) {
            console.error(`发送 OSC 到 ${broadcastAddr}:${OSC_PORT} 失败:`, err);
          }
          // 性能优化：移除正常日志输出，减少 I/O 开销
          // else {
          //   console.log(`广播 OSC: ${address}`, args, `-> ${broadcastAddr}:${OSC_PORT}`);
          // }
        });
      });
    } else {
      // 单播模式：发送到指定地址
      const OSC_HOST = process.env.OSC_HOST || '127.0.0.1';
      udpSocket.send(oscMessage, 0, oscMessage.length, OSC_PORT, OSC_HOST, (err) => {
        if (err) {
          console.error(`发送 OSC 到 ${OSC_HOST}:${OSC_PORT} 失败:`, err);
        }
        // 性能优化：移除正常日志输出
        // else {
        //   console.log(`发送 OSC: ${address}`, args, `-> ${OSC_HOST}:${OSC_PORT}`);
        // }
      });
    }
    
    // 🎵 同时转发给 Web Audio 引擎（如果已连接）
    broadcastToAudioEngine(address, args);
    
  } catch (error) {
    console.error('构建或发送 OSC 消息失败:', error);
  }
}

/**
 * 转发 OSC 消息到 Web Audio 引擎
 */
function broadcastToAudioEngine(address, args) {
  const message = JSON.stringify({
    type: 'osc_to_audio',
    address: address,
    args: args,
    timestamp: Date.now()
  });
  
  let audioEngineCount = 0;
  wss.clients.forEach((client) => {
    if (client.clientType === 'audio_engine' && client.readyState === WebSocket.OPEN) {
      client.send(message);
      audioEngineCount++;
    }
  });
  
  // 调试输出（每 500 次打印一次）
  if (audioEngineCount > 0 && Math.random() < 0.002) {
    console.log(`🎵 已转发 OSC 到 ${audioEngineCount} 个 Web Audio 引擎: ${address}`);
  }
}

// ============================================
// 观众数据管理（融合版 - 个体映射 + 集体聚合）
// ============================================
const audienceData = new Map(); // 存储所有观众的原始数据（用于大屏幕可视化）
const mappedOSCData = new Map(); // 存储所有观众的映射后 OSC 数据（用于音频控制）

const AUDIENCE_AGGREGATE_INTERVAL = 50; // 50ms 聚合一次
const AUDIENCE_TIMEOUT = 10000; // 10秒无数据视为离线

// 性能优化配置
const MAX_SAMPLE_SIZE = 80; // 最多采样 80 个最活跃观众
const ACTIVITY_WEIGHT_THRESHOLD = 0.3; // 活跃度阈值
const CLEANUP_INTERVAL = 5000; // 5秒清理一次离线观众

// OSC 聚合权重配置
const OSC_AGGREGATE_WEIGHT = 1.0; // 观众数据占 30%

// 性能监控
let lastAggregateTime = 0;
let aggregateCount = 0;
let performanceStats = {
  avgProcessTime: 0,
  maxAudienceCount: 0,
  totalAggregations: 0
};

/**
 * 计算观众活跃度得分（用于采样排序）
 * 得分越高 = 越活跃 = 越应该被采样
 */
function calculateActivityScore(audience, now) {
  if (!audience.data) return 0;
  
  // 因素 1: 时间新鲜度（最近更新的得分高）
  const timeFreshness = 1 - Math.min((now - audience.lastUpdate) / AUDIENCE_TIMEOUT, 1);
  
  // 因素 2: 交互强度
  const intensity = audience.data.intensity || 0;
  
  // 因素 3: 速度（快速滑动得分高）
  const velocity = Math.min((audience.data.velocity || 0) * 2, 1);
  
  // 因素 4: 非静止状态
  const isActive = audience.data.gesture !== 'idle' ? 1 : 0.3;
  
  // 综合得分（权重可调）
  return (timeFreshness * 0.4 + intensity * 0.3 + velocity * 0.2 + isActive * 0.1);
}

/**
 * 采样聚合：只处理最活跃的观众
 */
function aggregateAndSendAudienceData() {
  const startTime = Date.now();
  const now = startTime;
  
  // 定期清理（不是每次都清理，减少开销）
  if (now - lastAggregateTime > CLEANUP_INTERVAL) {
    cleanupInactiveAudiences(now);
    lastAggregateTime = now;
  }

  if (audienceData.size === 0) return;

  // ========== 核心优化：采样聚合 ==========
  let samplesToProcess;
  
  if (audienceData.size <= MAX_SAMPLE_SIZE) {
    // 观众数量少，处理全部
    samplesToProcess = Array.from(audienceData.values());
  } else {
    // 观众数量多，采样最活跃的
    const allAudiences = Array.from(audienceData.values());
    
    // 计算每个观众的活跃度得分
    const audiencesWithScores = allAudiences.map(audience => ({
      audience,
      score: calculateActivityScore(audience, now)
    }));
    
    // 按得分排序，取前 MAX_SAMPLE_SIZE 个
    audiencesWithScores.sort((a, b) => b.score - a.score);
    samplesToProcess = audiencesWithScores
      .slice(0, MAX_SAMPLE_SIZE)
      .map(item => item.audience);
    
    // 性能日志（每 100 次聚合打印一次）
    if (++aggregateCount % 100 === 0) {
      console.log(`⚡ 性能优化: 从 ${audienceData.size} 人中采样 ${samplesToProcess.length} 人 (活跃度排序)`);
    }
  }

  // ========== 聚合计算 ==========
  let totalIntensity = 0;
  let totalDirection = 0;
  let totalDistance = 0;
  let totalVelocity = 0;
  let totalFingers = 0;
  let activeCount = 0; // 实际参与计算的人数
  
  // 触摸手势计数
  let gestureCount = {
    idle: 0,
    swipe_up: 0,
    swipe_down: 0,
    swipe_left: 0,
    swipe_right: 0
  };

  // 加权聚合（活跃度高的观众权重更大）
  let totalWeight = 0;
  
  for (const audience of samplesToProcess) {
    if (audience.data) {
      // 计算该观众的权重
      const activityScore = calculateActivityScore(audience, now);
      const weight = Math.max(activityScore, 0.1); // 最低权重 0.1
      
      totalWeight += weight;
      
      // 加权累加
      totalIntensity += (audience.data.intensity || 0) * weight;
      totalDirection += (audience.data.direction || 0) * weight;
      totalDistance += (audience.data.distance || 0) * weight;
      totalVelocity += (audience.data.velocity || 0) * weight;
      totalFingers += (audience.data.fingerCount || 1) * weight;
      
      const gesture = audience.data.gesture;
      if (gesture && gestureCount.hasOwnProperty(gesture)) {
        gestureCount[gesture] += weight; // 手势计数也加权
      }
      
      activeCount++;
    }
  }

  if (activeCount === 0 || totalWeight === 0) return;

  // 加权平均
  const avgIntensity = totalIntensity / totalWeight;
  const avgDirection = totalDirection / totalWeight;
  const avgDistance = totalDistance / totalWeight;
  const avgVelocity = totalVelocity / totalWeight;
  const avgFingers = totalFingers / totalWeight;

  // 找出最常见的手势（加权后）
  let dominantGesture = 'idle';
  let maxCount = 0;
  for (const [gesture, gestCount] of Object.entries(gestureCount)) {
    if (gestCount > maxCount) {
      maxCount = gestCount;
      dominantGesture = gesture;
    }
  }

  // 发送聚合后的 OSC 消息（观众数据权重 30%）
  const oscWeight = 0.3;
  
  // 触摸手势数据
  sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);
  sendOSCMessage('/audience/swipe/direction', avgDirection);
  sendOSCMessage('/audience/swipe/distance', avgDistance * oscWeight);
  sendOSCMessage('/audience/swipe/velocity', avgVelocity * oscWeight);
  sendOSCMessage('/audience/fingers', Math.round(avgFingers));
  
  // 统计数据
  sendOSCMessage('/audience/count', audienceData.size); // 总人数
  sendOSCMessage('/audience/active_count', activeCount); // 活跃人数
  sendOSCMessage('/audience/gesture_count', Math.round(maxCount));
  
  // 发送主导手势的索引（用于 Max MSP 路由）
  const gestureIndex = {
    'idle': 0,
    'swipe_up': 1,
    'swipe_down': 2,
    'swipe_left': 3,
    'swipe_right': 4
  };
  sendOSCMessage('/audience/gesture/type', gestureIndex[dominantGesture] || 0);
  
  // 广播观众统计数据到前端
  broadcastAudienceCount(activeCount);
  
  // 性能监控
  const processTime = Date.now() - startTime;
  updatePerformanceStats(processTime, audienceData.size);
}

/**
 * 聚合映射后的 OSC 数据（融合模式 - 个体映射 + 集体聚合 + 加权平均）
 * 
 * 数据流：
 * 1. 手机端：个体映射引擎生成 /pigments/VC 等地址的值
 * 2. 服务器端：按地址分组，使用加权平均（活跃度作为权重）
 * 3. 应用全局权重（现为 1.0）
 * 4. 发送到 Max MSP
 */
function aggregateMappedOSCData() {
  const now = Date.now();
  
  // 清理超时的映射数据
  let cleanedCount = 0;
  for (const [id, data] of mappedOSCData.entries()) {
    if (now - data.lastUpdate > AUDIENCE_TIMEOUT) {
      mappedOSCData.delete(id);
      cleanedCount++;
    }
  }
  
  if (mappedOSCData.size === 0) return;
  
  // 按 OSC 地址分组聚合（加权平均）
  const aggregated = new Map(); // address -> { weightedSum, totalWeight, count, values[] }
  
  for (const [audienceId, audienceMappedData] of mappedOSCData.entries()) {
    // 从原始观众数据中获取活跃度（intensity）
    const audienceRaw = audienceData.get(audienceId);
    let intensity = 0.5; // 默认权重
    
    if (audienceRaw && audienceRaw.data) {
      // 使用观众的交互强度作为权重
      intensity = audienceRaw.data.intensity || 0.5;
    }
    
    for (const [address, msgData] of Object.entries(audienceMappedData.messages)) {
      // 支持新旧数据格式：新格式是 { value, oneShot }，旧格式是纯数值
      const value = (typeof msgData === 'object' && msgData !== null) ? msgData.value : msgData;
      const isOneShot = (typeof msgData === 'object' && msgData !== null) ? msgData.oneShot : false;
      
      // 🎹 一次性触发消息（如屏幕键盘）：使用固定权重，不受 intensity 影响
      let effectiveIntensity = intensity;
      if (isOneShot || address.includes('/midi')) {
        effectiveIntensity = 1.0; // 一次性触发使用固定权重
      } else {
        // 其他映射：如果活跃度太低（< 0.1），跳过该观众
        if (intensity < 0.1) continue;
      }
      
      if (!aggregated.has(address)) {
        aggregated.set(address, { 
          weightedSum: 0,      // 加权总和
          totalWeight: 0,      // 总权重
          count: 0,            // 参与人数
          values: [],          // 用于调试
          isOneShot: isOneShot // 记录是否是一次性触发
        });
      }
      
      const agg = aggregated.get(address);
      agg.weightedSum += value * effectiveIntensity;  // 值 × 权重
      agg.totalWeight += effectiveIntensity;          // 累加权重
      agg.count += 1;
      agg.values.push({ value, intensity: effectiveIntensity }); // 记录调试信息
      if (isOneShot) agg.isOneShot = true; // 只要有一个是 oneShot，就标记
    }
  }
  
  // 计算加权平均值并发送
  for (const [address, agg] of aggregated.entries()) {
    let finalValue;
    
    // 🎹 一次性触发消息（如屏幕键盘）：不取平均，使用最新值
    if (agg.isOneShot || address.includes('/midi')) {
      // 音符使用最新触发的值，不平均（避免多人触摸时音符混乱）
      // 取最后一个值（最新触发）
      const latestValue = agg.values[agg.values.length - 1]?.value || 0;
      finalValue = Math.round(latestValue);  // 一次性触发通常需要整数值
    } else {
      // 其他参数：使用加权平均
      const avgValue = agg.totalWeight > 0 ? agg.weightedSum / agg.totalWeight : 0;
      finalValue = avgValue * OSC_AGGREGATE_WEIGHT;  // 应用全局权重
    }
    
    // 发送到 Max MSP
    sendOSCMessage(address, finalValue);
    
    // 🎹 关键修复：一次性触发消息发送后立即清除，避免重复触发
    if (agg.isOneShot || address.includes('/midi')) {
      // 从所有观众的 mappedOSCData 中删除该地址
      for (const [audienceId, audienceMappedData] of mappedOSCData.entries()) {
        if (audienceMappedData.messages[address] !== undefined) {
          delete audienceMappedData.messages[address];
        }
      }
      console.log(`🎹 一次性触发: ${address} = ${finalValue} (已清除，避免重复)`);
    }
    
    // 调试输出
    aggregateCount++;
    
    // 其他参数：每 100 次打印一次
    if (!agg.isOneShot && !address.includes('/midi') && aggregateCount % 100 === 0 && address === '/pigments/VC') {
      const avgValue = agg.totalWeight > 0 ? agg.weightedSum / agg.totalWeight : 0;
      console.log(`🎛️  加权聚合 [${address}]: ${agg.count} 人, 加权平均 ${avgValue.toFixed(3)}, 最终值 ${finalValue.toFixed(3)}, 总权重 ${agg.totalWeight.toFixed(2)}`);
    }
  }
  
  // 清理日志
  if (cleanedCount > 0) {
    console.log(`🧹 清理 ${cleanedCount} 个离线观众的映射数据`);
  }
}

/**
 * 清理离线观众（独立函数，减少主循环开销）
 */
function cleanupInactiveAudiences(now) {
  let removedCount = 0;
  for (const [id, audience] of audienceData.entries()) {
    if (now - audience.lastUpdate > AUDIENCE_TIMEOUT) {
      audienceData.delete(id);
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    console.log(`🧹 清理 ${removedCount} 个离线观众，当前在线: ${audienceData.size}`);
    broadcastAudienceCount();
  }
}

/**
 * 更新性能统计
 */
function updatePerformanceStats(processTime, audienceCount) {
  performanceStats.totalAggregations++;
  performanceStats.avgProcessTime = 
    (performanceStats.avgProcessTime * 0.9 + processTime * 0.1); // 移动平均
  performanceStats.maxAudienceCount = 
    Math.max(performanceStats.maxAudienceCount, audienceCount);
  
  // 每 1000 次聚合打印一次性能报告
  if (performanceStats.totalAggregations % 1000 === 0) {
    console.log(`📊 性能报告: 平均处理时间 ${performanceStats.avgProcessTime.toFixed(2)}ms, 最高在线 ${performanceStats.maxAudienceCount} 人`);
  }
  
  // 性能警告
  if (processTime > 20) {
    console.warn(`⚠️  聚合处理时间过长: ${processTime}ms (观众: ${audienceCount})`);
  }
}

/**
 * 广播观众数量和活跃人数给所有客户端
 */
function broadcastAudienceCount(activeCount = 0) {
  const message = JSON.stringify({
    type: 'audience_count',
    count: audienceData.size,
    activeCount: activeCount,
    timestamp: Date.now()
  });
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * 广播详细的观众列表数据（用于视觉舞台）
 * 为每个观众创建一个可视化的数据包
 */
function broadcastAudienceDetails() {
  const now = Date.now();
  const audienceList = [];
  
  // 转换 Map 数据为数组，包含每个观众的详细信息
  for (const [id, audience] of audienceData.entries()) {
    if (audience.data) {
      const timeSinceUpdate = now - audience.lastUpdate;
      const isActive = timeSinceUpdate < 2000; // 2秒内有交互视为活跃
      
      audienceList.push({
        id: id,
        active: isActive,
        intensity: audience.data.intensity || 0,
        direction: audience.data.direction || 0,
        velocity: audience.data.velocity || 0,
        distance: audience.data.distance || 0,
        gesture: audience.data.gesture || 'idle',
        fingerCount: audience.data.fingerCount || 1,
        position: audience.data.position || { x: 0.5, y: 0.5 }, // 归一化位置 0-1
        lastUpdate: audience.lastUpdate,
        timeSinceUpdate: timeSinceUpdate
      });
    }
  }
  
  const activeCount = audienceList.filter(a => a.active).length;
  
  // 广播详细数据（用于粒子可视化）
  const detailsMessage = JSON.stringify({
    type: 'audience_details',
    audiences: audienceList,
    totalCount: audienceData.size,
    activeCount: activeCount,
    timestamp: now
  });
  
  // 广播简单的计数消息（用于UI更新活跃数）
  const countMessage = JSON.stringify({
    type: 'audience_count',
    count: audienceData.size,
    activeCount: activeCount,
    timestamp: now
  });
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(detailsMessage);
      client.send(countMessage);  // 同时发送计数消息
    }
  });
}

// 定期聚合观众数据（旧系统 - 已禁用，使用新的映射融合系统）
// 注：新系统已包含加权聚合，并使用自定义 OSC 地址
// setInterval(() => {
//   aggregateAndSendAudienceData();
// }, AUDIENCE_AGGREGATE_INTERVAL);

// 定期聚合映射后的 OSC 数据（新系统 - 融合模式 + 加权平均）
setInterval(() => {
  aggregateMappedOSCData();
}, AUDIENCE_AGGREGATE_INTERVAL);

// 定期广播详细观众数据（用于视觉舞台，每100ms一次）
setInterval(() => {
  if (audienceData.size > 0) {
    broadcastAudienceDetails();
  }
}, 100);

// WebSocket 服务器
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('新的 WebSocket 连接');
  
  // 标记客户端类型（演员或观众）
  ws.clientType = 'unknown';
  ws.audienceId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // 处理不同类型的控制消息
      switch (data.type) {
        case 'register_audio_engine':
          // Web Audio 引擎注册
          ws.clientType = 'audio_engine';
          console.log('🎵 Web Audio 引擎已连接');
          
          // 发送注册确认
          ws.send(JSON.stringify({
            type: 'audio_engine_registered',
            timestamp: Date.now()
          }));
          break;
        
        case 'register_audience':
          // 观众注册
          ws.clientType = 'audience';
          ws.audienceId = data.audienceId;
          
          audienceData.set(data.audienceId, {
            id: data.audienceId,
            lastUpdate: Date.now(),
            data: null,
            ws: ws
          });
          
          console.log(`👥 观众加入: ${data.audienceId} (总数: ${audienceData.size})`);
          
          // 发送注册确认
          ws.send(JSON.stringify({
            type: 'audience_registered',
            audienceId: data.audienceId,
            timestamp: Date.now()
          }));
          
          // 广播观众数量
          broadcastAudienceCount();
          break;
        
        case 'audience_gesture':
          // 观众手势数据
          if (audienceData.has(data.audienceId)) {
            // 更新现有观众数据
            audienceData.get(data.audienceId).data = data.data;
            audienceData.get(data.audienceId).lastUpdate = Date.now();
          } else {
            // 观众之前被清理了，现在重新触摸 → 自动恢复
            console.log(`👥 观众自动恢复: ${data.audienceId}`);
            audienceData.set(data.audienceId, {
              id: data.audienceId,
              lastUpdate: Date.now(),
              data: data.data,
              ws: ws
            });
            // 广播观众数量更新
            broadcastAudienceCount();
          }
          break;
        
        case 'audience_heartbeat':
          // 观众心跳 - 保持在线状态
          if (audienceData.has(data.audienceId)) {
            audienceData.get(data.audienceId).lastUpdate = Date.now();
          } else {
            // 如果心跳时发现观众不在，重新添加
            console.log(`👥 观众心跳恢复: ${data.audienceId}`);
            audienceData.set(data.audienceId, {
              id: data.audienceId,
              lastUpdate: Date.now(),
              data: null,
              ws: ws
            });
            broadcastAudienceCount();
          }
          break;
        
        case 'audience_osc_mapped':
          // 观众触摸映射后的 OSC 消息（融合模式）
          // 不直接转发，而是存储起来用于聚合
          if (data.oscMessages && Array.isArray(data.oscMessages)) {
            // 确保该观众的数据结构存在
            if (!mappedOSCData.has(data.audienceId)) {
              mappedOSCData.set(data.audienceId, {
                lastUpdate: Date.now(),
                messages: {}
              });
            }
            
            const audienceOSC = mappedOSCData.get(data.audienceId);
            audienceOSC.lastUpdate = Date.now();
            
            // 按 OSC 地址存储最新值和元数据
            for (const msg of data.oscMessages) {
              if (msg.address && msg.value !== undefined) {
                audienceOSC.messages[msg.address] = {
                  value: msg.value,
                  oneShot: msg.oneShot || false  // 保存一次性触发标记
                };
              }
            }
            
            // 调试输出
            // console.log(`🎛️ 观众 ${data.audienceId}: ${data.oscMessages.length} 条映射消息已存储`);
          }
          break;
        
        case 'audience_leave':
          // 观众离开
          if (data.audienceId && audienceData.has(data.audienceId)) {
            audienceData.delete(data.audienceId);
            console.log(`👥 观众离开: ${data.audienceId} (总数: ${audienceData.size})`);
            broadcastAudienceCount();
          }
          break;
        
        case 'audience_mapping_config_update':
          // 观众映射配置更新 - 广播给所有观众手机
          console.log('📡 广播观众映射配置更新到所有手机');
          let audiencePhoneCount = 0;
          wss.clients.forEach((client) => {
            if (client.clientType === 'audience' && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'mapping_config_sync',
                config: data.config
              }));
              audiencePhoneCount++;
            }
          });
          console.log(`✅ 映射配置已同步到 ${audiencePhoneCount} 台观众手机`);
          break;
        
        case 'slider':
          // 滑块控制: { type: 'slider', address: '/slider1', value: 0.5 }
          sendOSCMessage(data.address, data.value);
          break;
        
        case 'button':
          // 按钮控制: { type: 'button', address: '/button1', value: 1 }
          sendOSCMessage(data.address, data.value);
          break;
        
        case 'pan':
          // 声像控制: { type: 'pan', address: '/pan', value: 0.0 } (-1.0 到 1.0)
          sendOSCMessage(data.address, data.value);
          break;
        
        case 'toggle':
          // 开关控制: { type: 'toggle', address: '/toggle1', value: 1 }
          sendOSCMessage(data.address, data.value);
          break;
        
        case 'mediapipe':
          // MediaPipe 动作捕捉数据: { type: 'mediapipe', address: '/body/...', value: [...] }
          // 地址已经包含演员前缀（/performer1/...），直接发送
          const values = Array.isArray(data.value) ? data.value : [data.value];
          sendOSCMessage(data.address, ...values);
          // console.log(`📍 MediaPipe: ${data.address} = ${values.join(', ')}`);
          break;
        
        default:
          // 通用 OSC 消息: { type: 'osc', address: '/custom', args: [1, 2, 3] }
          if (data.address && data.args) {
            sendOSCMessage(data.address, ...data.args);
          }
      }

      // 广播给所有连接的客户端（可选，但排除观众手势数据）
      if (data.type !== 'audience_gesture') {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (error) {
      console.error('处理 WebSocket 消息错误:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket 连接关闭');
    
    // 如果是音频引擎，记录断开
    if (ws.clientType === 'audio_engine') {
      console.log('🎵 Web Audio 引擎已断开');
    }
    
    // 如果是观众，从列表中移除
    if (ws.clientType === 'audience' && ws.audienceId) {
      if (audienceData.has(ws.audienceId)) {
        audienceData.delete(ws.audienceId);
        console.log(`👥 观众断开: ${ws.audienceId} (总数: ${audienceData.size})`);
        broadcastAudienceCount();
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket 错误:', error);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIPAddress();
  console.log('\n═══════════════════════════════════════');
  console.log('✓ OSC 控制器已启动!');
  console.log('═══════════════════════════════════════');
  console.log(`🌐 Web 服务器: http://localhost:${PORT}`);
  
  // 根据当前系统显示正确的观众链接
  if (PERFORMER_ID === 'audience') {
    // 观众系统
    console.log(`📱 观众触摸互动: http://${localIP}:${PORT}/audience-touch/`);
  } else {
    // 演员系统 - 显示观众系统的固定端口 3002
    console.log(`📱 观众触摸互动: http://${localIP}:3002/audience-touch/`);
    console.log(`📱 观众传感器版: http://${localIP}:3000/audience/`);
  }
  
  console.log(`📡 OSC 端口: ${OSC_PORT}`);
  console.log(`📤 广播模式: ${USE_BROADCAST ? '✓ 启用' : '✗ 禁用'}`);
  if (USE_BROADCAST) {
    const broadcastAddresses = getBroadcastAddress();
    console.log(`📍 广播地址: ${broadcastAddresses.join(', ')}`);
  }
  console.log('═══════════════════════════════════════\n');
});

// 错误处理
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ 错误: 端口 ${PORT} 已被占用`);
    console.error('请关闭占用此端口的其他程序，或使用不同的端口:');
    console.error(`PORT=8080 npm start`);
    process.exit(1);
  } else {
    console.error('服务器错误:', error);
  }
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  
  // 关闭 UDP socket
  try {
    udpSocket.close();
    console.log('✓ UDP socket 已关闭');
  } catch (error) {
    console.error('关闭 UDP socket 失败:', error);
  }
  
  // 关闭 WebSocket 服务器
  try {
    wss.close(() => {
      console.log('✓ WebSocket 服务器已关闭');
    });
  } catch (error) {
    console.error('关闭 WebSocket 服务器失败:', error);
  }
  
  // 关闭 HTTP 服务器
  server.close(() => {
    console.log('✓ HTTP 服务器已关闭');
    console.log('👋 服务器已完全关闭');
    process.exit(0);
  });
  
  // 设置超时以确保进程退出
  setTimeout(() => {
    console.error('❌ 强制关闭...');
    process.exit(1);
  }, 5000);
});

