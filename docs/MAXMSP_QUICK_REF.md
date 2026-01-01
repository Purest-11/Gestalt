# 🎯 Max MSP 连接 - 快速参考卡

## ⚡ 核心信息

| 参数 | 值 |
|------|-----|
| **UDP 端口** | `7402` |
| **接收对象** | `[udpreceive 7402]` |
| **启动脚本** | `./start-audience.sh` |
| **代码位置** | `server.js` 第 340-363 行 |

### 🎯 完整端口架构

```
演员1  → 7400 → Pigments 1
演员2  → 7401 → Pigments 2
观众   → 7402 → Pigments 3
```

---

## 📡 Max MSP 基础 Patch

```maxpat
[udpreceive 7402]  ← 观众系统专用端口
     |
[print OSC]  ← 查看所有消息
     |
[route /audience]
     |
   你的处理...
```

---

## 📊 OSC 消息速查表

### 主要参数

| OSC 地址 | 类型 | 范围 | 说明 |
|---------|------|------|------|
| `/audience/swipe/intensity` | float | 0-0.3 | 滑动强度 |
| `/audience/swipe/direction` | float | 0-360 | 滑动方向 |
| `/audience/swipe/velocity` | float | 0-0.3 | 滑动速度 |
| `/audience/gesture/type` | int | 0-4 | 手势类型 |
| `/audience/count` | int | 0-200+ | 在线人数 |

### 手势类型对照

```
0 = idle (静止)
1 = swipe_up (向上)
2 = swipe_down (向下)
3 = swipe_left (向左)
4 = swipe_right (向右)
```

---

## 🔧 自定义映射位置

### 打开文件

```bash
code /Users/sitongwu/Desktop/正式工程/osc/server.js
```

### 跳转到第 340 行

按 `Cmd+G` (Mac) 或 `Ctrl+G` (Windows)，输入 `340`

### 修改这段代码

```javascript
// 第 340-363 行
const oscWeight = 0.3;

// 🔥 在这里修改 OSC 地址和参数
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);
sendOSCMessage('/audience/swipe/direction', avgDirection);
// ... 继续修改 ...
```

---

## 📝 常见修改示例

### 1. 改变 OSC 地址

```javascript
// 原代码
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);

// 改为
sendOSCMessage('/synth/volume', avgIntensity * oscWeight);
```

### 2. 改变数值范围

```javascript
// 原代码（0-0.3）
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);

// 改为 MIDI (0-127)
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight * 127);

// 改为百分比 (0-100)
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight * 100);
```

### 3. 根据手势发送不同参数

```javascript
if (dominantGesture === 'swipe_up') {
  sendOSCMessage('/synth/pitch', 1.0 + avgIntensity);
} else if (dominantGesture === 'swipe_down') {
  sendOSCMessage('/synth/pitch', 1.0 - avgIntensity);
}
```

---

## ✅ 测试流程

1. **启动观众系统服务器**
   ```bash
   ./start-audience.sh
   ```
   **重要：必须使用此脚本启动，确保端口为 7402**

2. **打开 Max Patch**
   - 文件: `max-patches/audience-receiver.maxpat`
   - 或创建: `[udpreceive 7402]` → `[print OSC]`

3. **手机访问**
   - 地址: `http://你的IP:3002/audience-touch/`
   - 注意端口为 **3002**（不是 3000）

4. **触摸测试**
   - 观察 Max 控制台输出

---

## 🔍 故障排除

### 收不到消息？

```maxpat
[udpreceive 7402]  ← 确认端口！
     |
[print 测试]  ← 看不到输出？检查：
```

1. ✅ 使用 `./start-audience.sh` 启动
2. ✅ 端口确实是 **7402**
3. ✅ 有观众在线并触摸
4. ✅ 检查防火墙设置

### 数值不对？

1. 检查 `oscWeight = 0.3`（第 341 行）
2. 观众端需要触摸（强度才 > 0）
3. 数值范围可能需要缩放

---

## 📚 完整文档

- **详细指南**: `MAXMSP_AUDIENCE_GUIDE.md`
- **示例 Patch**: `max-patches/audience-receiver.maxpat`
- **配置文件**: `audience-config.js`

---

## 🎮 可用的变量

在 `server.js` 第 340 行，你可以使用：

```javascript
avgIntensity   // 平均强度 (0-1)
avgDirection   // 平均方向 (0-360)
avgDistance    // 平均距离 (0-1)
avgVelocity    // 平均速度 (0-1)
avgFingers     // 平均手指数 (1-5)
dominantGesture // 主导手势 ('idle', 'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right')
audienceData.size // 观众总数
activeCount    // 活跃观众数
```

---

## ⚙️ 修改后记得

1. **保存文件** (`Cmd+S` / `Ctrl+S`)
2. **重启服务器** (终端按 `Ctrl+C`，然后 `npm start`)
3. **测试连接** (手机触摸观察 Max 输出)

---

**快速联系：查看 `MAXMSP_AUDIENCE_GUIDE.md` 获取更多示例和详细说明**
