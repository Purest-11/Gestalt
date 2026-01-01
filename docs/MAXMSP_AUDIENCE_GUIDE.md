# 🎮 Max MSP 观众系统连接指南

## 📡 快速连接

### 🎯 三层架构端口分配

```
演员1系统  → 端口 7400 → Max MSP → Pigments 1
演员2系统  → 端口 7401 → Max MSP → Pigments 2
观众系统   → 端口 7402 → Max MSP → Pigments 3
```

### 1. Max MSP 端口配置

在 Max MSP 中创建 `udpreceive` 对象：

```
[udpreceive 7402]
```

**端口号：7402**（观众系统的专用 OSC 端口）

---

## 🎯 完整的 Max MSP 连接 Patch

### 基础接收 Patch

```maxpat
┌─────────────────────────────────────┐
│     [udpreceive 7402]               │  ← 观众系统专用端口
│             |                       │
│        [print OSC]                  │  ← 查看所有收到的消息
│             |                       │
│     [route /audience]               │
│             |                       │
│    ┌────────┼────────┐             │
│    |        |        |             │
│ [/count] [/swipe] [/gesture]       │
└─────────────────────────────────────┘
```

### 完整接收 Patch（推荐）

```maxpat
┌─────────────────────────────────────────────────────────┐
│                   [udpreceive 7402]                     │  ← 观众系统端口
│                           |                             │
│                   [route /audience]                     │
│                           |                             │
│    ┌──────────────────────┼──────────────────────┐    │
│    |         |            |           |          |     │
│ [/count] [/active_count] [/swipe] [/gesture] [/fingers]│
│    |         |            |           |          |     │
│  [i 0]     [i 0]      [route /intensity /direction]    │
│    |         |            |           |                │
│ 观众总数  活跃人数     强度/方向   手势类型  手指数量  │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 接收的 OSC 消息列表

### 1. 触摸手势数据

| OSC 地址 | 数据类型 | 范围 | 说明 |
|---------|---------|------|------|
| `/audience/swipe/intensity` | float | 0.0 - 0.3 | 滑动强度（已乘 30% 权重）|
| `/audience/swipe/direction` | float | 0 - 360 | 滑动方向（角度）|
| `/audience/swipe/distance` | float | 0.0 - 0.3 | 滑动距离（已乘 30% 权重）|
| `/audience/swipe/velocity` | float | 0.0 - 0.3 | 滑动速度（已乘 30% 权重）|
| `/audience/fingers` | int | 1 - 5 | 平均手指数量 |

### 2. 手势类型

| OSC 地址 | 数据类型 | 值 | 说明 |
|---------|---------|-----|------|
| `/audience/gesture/type` | int | 0 | 静止（idle）|
|  |  | 1 | 向上滑动（swipe_up）|
|  |  | 2 | 向下滑动（swipe_down）|
|  |  | 3 | 向左滑动（swipe_left）|
|  |  | 4 | 向右滑动（swipe_right）|

### 3. 统计数据

| OSC 地址 | 数据类型 | 说明 |
|---------|---------|------|
| `/audience/count` | int | 在线观众总数 |
| `/audience/active_count` | int | 活跃观众数量（实际参与计算）|
| `/audience/gesture_count` | int | 执行主导手势的人数 |

---

## 🎨 自定义映射代码位置

### 📍 代码位置：`server.js` 第 340-363 行

```javascript
// ============================================
// ⭐ 这里是自定义映射的位置！⭐
// ============================================

// 发送聚合后的 OSC 消息（观众数据权重 30%）
const oscWeight = 0.3;

// 触摸手势数据
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);
sendOSCMessage('/audience/swipe/direction', avgDirection);
sendOSCMessage('/audience/swipe/distance', avgDistance * oscWeight);
sendOSCMessage('/audience/swipe/velocity', avgVelocity * oscWeight);
sendOSCMessage('/audience/fingers', Math.round(avgFingers));

// 统计数据
sendOSCMessage('/audience/count', audienceData.size);
sendOSCMessage('/audience/active_count', activeCount);
sendOSCMessage('/audience/gesture_count', Math.round(maxCount));

// 手势类型索引
const gestureIndex = {
  'idle': 0,
  'swipe_up': 1,
  'swipe_down': 2,
  'swipe_left': 3,
  'swipe_right': 4
};
sendOSCMessage('/audience/gesture/type', gestureIndex[dominantGesture] || 0);
```

---

## 🔧 如何自定义映射

### 方式 1：修改 OSC 地址（推荐）

如果你想改变 OSC 地址名称（例如：`/audience/swipe/intensity` → `/synth/volume`）

**编辑 `server.js` 第 344 行：**

```javascript
// 原代码：
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);

// 修改为：
sendOSCMessage('/synth/volume', avgIntensity * oscWeight);
```

---

### 方式 2：修改数值范围

如果你想改变数值范围（例如：0-0.3 → 0-127）

**编辑 `server.js` 第 344 行：**

```javascript
// 原代码（范围 0-0.3）：
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);

// 修改为 MIDI 范围（0-127）：
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight * 127);

// 修改为百分比（0-100）：
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight * 100);
```

---

### 方式 3：根据手势类型发送不同参数

如果你想让不同手势触发不同的合成器参数：

**编辑 `server.js` 第 340-363 行，完全替换为：**

```javascript
// 发送聚合后的 OSC 消息（观众数据权重 30%）
const oscWeight = 0.3;

// 根据主导手势发送不同参数
if (dominantGesture === 'swipe_up') {
  // 向上滑动：控制音量和亮度
  sendOSCMessage('/synth/volume', avgIntensity * oscWeight);
  sendOSCMessage('/visual/brightness', avgVelocity * oscWeight);
  sendOSCMessage('/synth/pitch', 1.0 + avgDistance * oscWeight); // 升调
  
} else if (dominantGesture === 'swipe_down') {
  // 向下滑动：降低音量，增加低频
  sendOSCMessage('/synth/volume', (1 - avgIntensity) * oscWeight);
  sendOSCMessage('/synth/bass', avgVelocity * oscWeight);
  sendOSCMessage('/synth/pitch', 1.0 - avgDistance * oscWeight); // 降调
  
} else if (dominantGesture === 'swipe_left') {
  // 向左滑动：滤波器、左声道
  sendOSCMessage('/synth/filter', (1 - avgIntensity) * oscWeight);
  sendOSCMessage('/synth/pan', -0.8); // 左声道
  sendOSCMessage('/visual/rotation', -avgVelocity * oscWeight);
  
} else if (dominantGesture === 'swipe_right') {
  // 向右滑动：混响、右声道
  sendOSCMessage('/synth/reverb', avgIntensity * oscWeight);
  sendOSCMessage('/synth/pan', 0.8); // 右声道
  sendOSCMessage('/visual/rotation', avgVelocity * oscWeight);
  
} else {
  // 静止：渐变到默认状态
  sendOSCMessage('/synth/volume', 0.5);
  sendOSCMessage('/synth/filter', 0.5);
}

// 始终发送统计数据
sendOSCMessage('/audience/count', audienceData.size);
sendOSCMessage('/audience/active_count', activeCount);
sendOSCMessage('/audience/gesture/type', gestureIndex[dominantGesture] || 0);
```

---

### 方式 4：添加新的计算参数

如果你想添加自己的参数计算：

**在 `server.js` 第 339 行后添加：**

```javascript
// 找出最常见的手势（加权后）
let dominantGesture = 'idle';
let maxCount = 0;
for (const [gesture, gestCount] of Object.entries(gestureCount)) {
  if (gestCount > maxCount) {
    maxCount = gestCount;
    dominantGesture = gesture;
  }
}

// ⭐ 在这里添加你的自定义计算 ⭐

// 示例 1: 计算观众活跃度（0-1）
const audienceActivity = Math.min(activeCount / 100, 1.0);

// 示例 2: 计算整体能量（综合强度和速度）
const totalEnergy = (avgIntensity + avgVelocity) * 0.5;

// 示例 3: 计算方向的 X/Y 分量
const directionX = Math.cos(avgDirection * Math.PI / 180);
const directionY = Math.sin(avgDirection * Math.PI / 180);

// 发送聚合后的 OSC 消息（观众数据权重 30%）
const oscWeight = 0.3;

// 发送你的自定义参数
sendOSCMessage('/audience/activity', audienceActivity);
sendOSCMessage('/audience/energy', totalEnergy * oscWeight);
sendOSCMessage('/audience/direction_x', directionX);
sendOSCMessage('/audience/direction_y', directionY);

// ... 其他原有的 OSC 消息 ...
```

---

## 📝 完整示例：4 种手势映射到音色

### 修改 server.js

**找到第 340-363 行，完全替换为：**

```javascript
// ============================================
// 自定义映射：4 种手势控制不同音色
// ============================================

const oscWeight = 0.3;

// 计算基础参数
const intensity = avgIntensity * oscWeight;
const velocity = avgVelocity * oscWeight;
const distance = avgDistance * oscWeight;

// 根据手势类型映射到不同音色
switch (dominantGesture) {
  case 'swipe_up':
    // 音色 1：明亮、高音
    sendOSCMessage('/synth/timbre', 1);
    sendOSCMessage('/synth/brightness', intensity * 127);
    sendOSCMessage('/synth/pitch', 1.0 + distance);
    sendOSCMessage('/synth/attack', 0.01); // 快速起音
    break;
    
  case 'swipe_down':
    // 音色 2：黑暗、低音
    sendOSCMessage('/synth/timbre', 2);
    sendOSCMessage('/synth/darkness', intensity * 127);
    sendOSCMessage('/synth/pitch', 1.0 - distance);
    sendOSCMessage('/synth/attack', 0.5); // 慢速起音
    break;
    
  case 'swipe_left':
    // 音色 3：滤波、左声道
    sendOSCMessage('/synth/timbre', 3);
    sendOSCMessage('/synth/filter_freq', (1 - intensity) * 5000);
    sendOSCMessage('/synth/pan', -0.8);
    sendOSCMessage('/synth/resonance', velocity * 10);
    break;
    
  case 'swipe_right':
    // 音色 4：混响、右声道
    sendOSCMessage('/synth/timbre', 4);
    sendOSCMessage('/synth/reverb_mix', intensity);
    sendOSCMessage('/synth/pan', 0.8);
    sendOSCMessage('/synth/delay_time', velocity);
    break;
    
  default:
    // 静止状态：归零
    sendOSCMessage('/synth/timbre', 0);
    sendOSCMessage('/synth/volume', 0.0);
    break;
}

// 通用参数
sendOSCMessage('/synth/velocity', velocity * 127);
sendOSCMessage('/synth/fingers', Math.round(avgFingers));

// 统计数据
sendOSCMessage('/audience/count', audienceData.size);
sendOSCMessage('/audience/active_count', activeCount);
sendOSCMessage('/audience/gesture/type', gestureIndex[dominantGesture] || 0);
```

---

## 🎮 Max MSP 接收 Patch（完整版）

### 创建这个 Patch 来接收所有参数

```maxpat
┌──────────────────────────────────────────────────────────┐
│                   [udpreceive 7400]                      │
│                           |                              │
│                      [print OSC]  ← 查看所有消息         │
│                           |                              │
│                   [route /audience /synth]               │
│                      |              |                    │
│           ┌──────────┼───────┐      └──> [route /timbre]│
│           |          |       |                |          │
│        [/count] [/active_count] [/gesture]  [i 0]       │
│           |          |             |          |          │
│         [i 0]      [i 0]         [sel 0 1 2 3 4]        │
│           |          |             |  |  |  |  |         │
│     显示观众数   显示活跃数       静止 上 下 左 右      │
│                                    |  |  |  |  |         │
│                              [gate 5 1]                  │
│                                    |  |  |  |  |         │
│                           ┌────────┼──┼──┼──┼─────┐     │
│                           |        |  |  |  |     |     │
│                    [音色1参数] [音色2] [音色3] [音色4]  │
└──────────────────────────────────────────────────────────┘
```

### 示例：连接到 poly~ 合成器

```maxpat
┌─────────────────────────────────────────────┐
│         [udpreceive 7400]                   │
│                 |                           │
│         [route /synth]                      │
│                 |                           │
│    [route /timbre /brightness /pitch ...]  │
│        |          |            |            │
│      [i 0]     [f 0.]       [f 1.]         │
│        |          |            |            │
│        └──────────┼────────────┘            │
│                   |                         │
│            [pack 0 0. 1.]                   │
│                   |                         │
│         [poly~ my_synth 16]                 │
│                   |                         │
│              [dac~ 1 2]                     │
└─────────────────────────────────────────────┘
```

---

## 🧪 测试连接

### 1. 启动观众系统

**使用专用启动脚本（推荐）：**

```bash
./start-audience.sh
```

**或手动指定端口：**

```bash
OSC_PORT=7402 PORT=3002 npm start
```

### 2. 在 Max MSP 中测试接收

**创建简单的测试 patch：**

```maxpat
[udpreceive 7402]  ← 确保使用 7402 端口
     |
[print 收到OSC]
```

### 3. 手机访问观众端

访问 `http://你的IP:3002/audience-touch/`，触摸屏幕

**注意：观众系统使用端口 3002（Web）和 7402（OSC）**

### 4. 观察 Max 控制台

你应该看到类似这样的消息：

```
收到OSC: /audience/swipe/intensity 0.123
收到OSC: /audience/swipe/direction 45.6
收到OSC: /audience/gesture/type 1
收到OSC: /audience/count 5
```

---

## ⚙️ 修改后的步骤

### 1. 编辑 server.js

```bash
# 打开文件
code /Users/sitongwu/Desktop/正式工程/osc/server.js

# 或者
open -a "Visual Studio Code" /Users/sitongwu/Desktop/正式工程/osc/server.js
```

### 2. 找到第 340-363 行

使用 `Cmd+G`（Mac）或 `Ctrl+G`（Windows）跳转到行号

### 3. 修改 OSC 映射代码

根据上面的示例修改

### 4. 保存并重启服务器

```bash
# 在终端按 Ctrl+C 停止
# 然后重新启动
npm start
```

### 5. 在 Max MSP 中更新接收路径

修改 `[route /audience]` 为你的新路径（如果你改了的话）

---

## 📊 预设映射方案

### 方案 1：音量控制（简单）

```javascript
// server.js 第 340 行开始
const oscWeight = 0.3;
sendOSCMessage('/synth/volume', avgIntensity * oscWeight * 127);
sendOSCMessage('/audience/count', audienceData.size);
```

### 方案 2：方向控制声相（中等）

```javascript
// server.js 第 340 行开始
const oscWeight = 0.3;
const directionX = Math.cos(avgDirection * Math.PI / 180);
const directionY = Math.sin(avgDirection * Math.PI / 180);

sendOSCMessage('/synth/pan', directionX); // -1 到 1
sendOSCMessage('/synth/volume', avgIntensity * oscWeight * 127);
sendOSCMessage('/visual/y_pos', directionY);
```

### 方案 3：4 手势 4 音色（复杂）

见上方完整示例

---

## 🔍 故障排除

### 问题 1：Max MSP 收不到消息

**检查：**
1. 端口是否为 **7402**（不是 7400）
2. 服务器是否使用 `./start-audience.sh` 启动
3. 观众端是否有人在线
4. Max 控制台是否显示 `udpreceive: bound to port 7402`

**解决：**
```maxpat
[udpreceive 7402]  ← 确认端口号
     |
[print 测试]  ← 如果看不到任何输出，检查防火墙
```

### 问题 2：收到消息但数值不对

**检查：**
- 观众端正在触摸（强度 > 0）
- `oscWeight = 0.3`（默认 30% 权重）
- 数值范围是否需要缩放

**调试：**
```javascript
// 在 server.js 第 344 行添加日志
console.log('发送强度:', avgIntensity * oscWeight);
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);
```

### 问题 3：消息太多/太少

**调整聚合频率：**
```javascript
// server.js 第 195 行
const AUDIENCE_AGGREGATE_INTERVAL = 50; // 改为 100 减少频率
```

---

## 📚 进阶技巧

### 1. 平滑数值变化

在 Max MSP 中使用 `[line~]` 平滑：

```maxpat
[route /synth/volume]
     |
   [f 0.]
     |
[pack 0. 50]  ← 50ms 平滑过渡
     |
  [line~]
     |
  [*~ 1.]
```

### 2. 映射曲线

使用 `pow` 改变响应曲线：

```javascript
// server.js 中
// 线性响应
sendOSCMessage('/synth/volume', avgIntensity * oscWeight);

// 指数响应（更敏感）
sendOSCMessage('/synth/volume', Math.pow(avgIntensity, 2) * oscWeight);

// 对数响应（更平滑）
sendOSCMessage('/synth/volume', Math.sqrt(avgIntensity) * oscWeight);
```

### 3. 阈值过滤

只在强度超过阈值时发送：

```javascript
// server.js 第 340 行后
const oscWeight = 0.3;
const threshold = 0.1; // 10% 阈值

if (avgIntensity > threshold) {
  sendOSCMessage('/synth/volume', avgIntensity * oscWeight);
} else {
  sendOSCMessage('/synth/volume', 0);
}
```

---

## ✅ 快速检查清单

- [ ] Max MSP 中 `[udpreceive 7400]` 已创建
- [ ] 服务器已启动（`npm start`）
- [ ] 观众端可以访问
- [ ] Max 控制台显示绑定成功
- [ ] 触摸后 Max 收到消息
- [ ] 参数值在预期范围内
- [ ] 自定义映射已应用
- [ ] 服务器已重启

---

## 🎉 完成！

你现在可以：
1. ✅ 在 Max MSP 中接收观众数据
2. ✅ 自定义 OSC 地址和参数
3. ✅ 根据手势类型路由不同参数
4. ✅ 实时控制合成器和视觉效果

**祝演出成功！** 🚀
