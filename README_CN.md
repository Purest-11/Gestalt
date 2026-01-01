# ◈ Gestalt

> **让观众成为你作品的一部分**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[English](README.md) | [中文](#这是什么)**

---

## 这是什么？

Gestalt 是一个**互动音乐表演系统**，让你的观众可以通过手机参与演出：

- 🎭 **演员** 通过摄像头进行动作捕捉，控制音乐参数
- 👥 **观众** 用手机触摸屏幕，集体影响声音
- 🎵 **所有数据** 实时发送到 Max/MSP 进行音频合成

**适合**：互动音乐会、沉浸式剧场、新媒体艺术展、教学演示

---

## 🚀 两种安装方式

### 方式一：Docker（推荐新手）⭐

**优点**：一键启动，无需安装 Node.js 等开发工具

```bash
# 1. 安装 Docker Desktop
#    下载地址：https://www.docker.com/products/docker-desktop/

# 2. 下载本项目
git clone https://github.com/Purest-11/Gestalt.git
cd Gestalt

# 3. 一键启动
./docker-start.sh
```

首次启动需要下载镜像，约 **2-5 分钟**。

**国内用户**：如果下载很慢，运行 `./docker-mirror-setup.sh` 配置镜像加速。

👉 **详细教程**：[Docker 完整指南（中文）](docs/DOCKER_GUIDE.md)

---

### 方式二：直接运行

**适合**：需要更多控制权，或 Docker 安装有困难的用户

```bash
# 1. 安装 Node.js（如果没有）
#    下载地址：https://nodejs.org/

# 2. 下载项目
git clone https://github.com/Purest-11/Gestalt.git
cd Gestalt

# 3. 安装依赖
npm install

# 4. 启动
./start.sh
```

👉 **详细教程**：[快速开始（中文）](快速开始.md)

---

## 📱 启动后做什么？

启动后会看到交互式菜单，**选择 1（本地模式）** 开始测试。

系统启动后会显示访问地址：

| 页面 | 地址 | 说明 |
|------|------|------|
| 动作捕捉 | `http://localhost:3000/mocap/?performer=1` | 演员用，需要摄像头 |
| 观众触摸 | `http://你的IP:3002/audience-touch/` | 观众用手机访问 |
| 监控面板 | `http://localhost:3002/?performer=audience` | 查看观众粒子 |

**测试流程**：
1. 打开动作捕捉页面 → 允许摄像头 → 挥手看追踪效果
2. 用手机扫描控制面板中的二维码 → 触摸滑动
3. 查看监控面板 → 看到观众变成粒子

---

## 🎹 连接 Max/MSP

系统通过 OSC 协议发送数据：

| 数据类型 | UDP 端口 | 说明 |
|---------|----------|------|
| 演员数据 | 7400 | 动作捕捉、控制器 |
| 观众数据 | 7402 | 触摸、手势 |

**在 Max 中创建接收**：
```
[udpreceive 7400]    ← 演员数据
[udpreceive 7402]    ← 观众数据
      |
[oscparse]
      |
[route /performer1 /audience]
```

👉 **完整 OSC 地址列表**：[Max/MSP 参考手册（中文）](docs/MAXMSP_QUICK_REF.md)

---

## 🌐 演出场景选择

| 场景 | 菜单选择 | 说明 |
|------|---------|------|
| **本地演出** | 选项 1 | 所有人连同一 WiFi |
| **国际演出** | 选项 2 | 观众可用任何网络（Cloudflare） |
| **国内演出** | 选项 3 | 观众可用任何网络（cpolar，国内更快） |
| **大型演出** | 选项 4-7 | 双机模式，分担负载 |

---

## 📖 文档索引

| 我想... | 看这个 |
|---------|--------|
| 快速跑起来（Docker） | [Docker 指南（中文）](docs/DOCKER_GUIDE.md) |
| 快速跑起来（直接运行） | [快速开始（中文）](快速开始.md) |
| 了解所有 OSC 数据 | [Max/MSP 参考（中文）](docs/MAXMSP_QUICK_REF.md) |
| 处理观众数据 | [观众数据指南（中文）](docs/MAXMSP_AUDIENCE_GUIDE.md) |

---

## 📊 性能参考

MacBook Pro (M 系列) 测试结果：

| 并发观众 | 状态 |
|---------|------|
| 50 人 | ✅ 稳定 |
| 100 人 | ✅ 稳定 |
| 150 人 | ✅ 稳定 |
| 200 人 | ✅ 稳定（分批连接） |

你可以运行自己的测试：`./run-stress-test.sh`

---

## 📜 引用

如果在研究或作品中使用了 Gestalt：

```bibtex
@software{gestalt2025,
  author = {Sitong Wu},
  title = {Gestalt: A Symbiotic Framework for Real-Time Collaboration between Performers and Mass Audiences},
  year = {2025},
  url = {https://github.com/Purest-11/Gestalt}
}
```

---

## 📄 许可证

MIT License — 可自由使用、修改、分发

---

**为互动音乐表演而生 ♥**
