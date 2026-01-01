# Max MSP Patch 使用说明

## 📁 文件说明

### `audience-receiver.maxpat`

这是一个基础的观众系统接收器 patch，用于测试和开发。

**功能：**
- 接收端口 **7402** 的 OSC 消息（观众系统专用端口）
- 显示所有观众数据（人数、强度、方向、速度、手势类型）
- 自动解析手势类型（idle/swipe_up/swipe_down/swipe_left/swipe_right）

### 🎯 端口架构

```
演员1  → 端口 7400
演员2  → 端口 7401
观众   → 端口 7402  ← 本 patch 接收此端口
```

---

## 🚀 快速开始

### 1. 打开 Patch

在 Max MSP 中：
```
File → Open → 选择 audience-receiver.maxpat
```

### 2. 启动观众系统服务器

在终端：
```bash
cd /Users/sitongwu/Desktop/正式工程/osc
./start-audience.sh
```

**重要：必须使用 `start-audience.sh` 启动，确保端口为 7402**

### 3. 测试连接

1. 在手机访问观众端
2. 触摸屏幕
3. 观察 Max patch 中的数值变化

---

## 📊 接收的参数

| 参数 | 说明 | 范围 |
|------|------|------|
| 观众总数 | 在线观众数量 | 0 - 200+ |
| 活跃观众数 | 正在交互的观众 | 0 - 80 |
| 强度 | 滑动强度（已加权 30%）| 0 - 0.3 |
| 方向 | 滑动方向（角度）| 0 - 360 |
| 速度 | 滑动速度（已加权 30%）| 0 - 0.3 |
| 手势类型 | 0=静止, 1=上, 2=下, 3=左, 4=右 | 0 - 4 |

---

## 🔧 自定义开发

### 连接到合成器

```maxpat
[route /audience/swipe/intensity]
     |
   [f 0.]
     |
  [* 127]  ← 转换为 MIDI 范围
     |
[poly~ my_synth 16]
```

### 手势路由

```maxpat
[route /audience/gesture/type]
     |
   [sel 0 1 2 3 4]
     |  |  |  |  |
   idle 上 下 左 右
```

---

## 📝 修改建议

### 1. 添加平滑

用 `[line~]` 或 `[rampsmooth~]` 平滑数值变化

### 2. 映射曲线

用 `[scale]` 重新映射范围

### 3. 阈值过滤

用 `[thresh]` 或 `[if]` 过滤小值

---

## 🎯 完整文档

详细文档请查看：`MAXMSP_AUDIENCE_GUIDE.md`
