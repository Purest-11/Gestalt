# ◈ Gestalt

> **A framework that turns your audience into co-creators**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[English](#what-is-this) | [中文](README_CN.md)**

---

## What is this?

Gestalt is an **interactive music performance system** that enables audience participation via mobile phones:

- 🎭 **Performers** control music parameters through camera-based motion capture
- 👥 **Audience** collectively influences sound by touching their phone screens
- 🎵 **All data** is sent in real-time to Max/MSP for audio synthesis

**Use cases**: Interactive concerts, immersive theater, new media art exhibitions, educational demos

---

## 🚀 Two Ways to Install

### Method 1: Docker (Recommended for beginners) ⭐

**Pros**: One-click startup, no need to install Node.js

```bash
# 1. Install Docker Desktop
#    Download: https://www.docker.com/products/docker-desktop/

# 2. Clone the project
git clone https://github.com/Purest-11/Gestalt.git
cd Gestalt

# 3. Start
./docker-start.sh
```

First launch takes **2-5 minutes** to download images.

👉 **Full guide**: [Docker Guide (English)](docs/DOCKER_GUIDE_EN.md)

---

### Method 2: Direct Run

**For**: Users who want more control

```bash
# 1. Install Node.js (if not installed)
#    Download: https://nodejs.org/

# 2. Clone and install
git clone https://github.com/Purest-11/Gestalt.git
cd Gestalt
npm install

# 3. Start
./start.sh
```

👉 **Full guide**: [Quick Start (English)](QUICK_START.md)

---

## 📱 After Starting

You'll see an interactive menu. **Select option 1** (Local Mode) to test.

Access URLs will be displayed:

| Page | URL | Description |
|------|-----|-------------|
| Motion Capture | `http://localhost:3000/mocap/?performer=1` | For performer, needs camera |
| Audience Touch | `http://YOUR_IP:3002/audience-touch/` | For audience on phones |
| Monitor Panel | `http://localhost:3002/?performer=audience` | View audience as particles |

**Test flow**:
1. Open Motion Capture → Allow camera → Wave your hands
2. Scan QR code on your phone → Touch and swipe
3. Check Monitor → See audience become particles

---

## 🎹 Connect to Max/MSP

The system sends OSC data:

| Data Type | UDP Port | Description |
|-----------|----------|-------------|
| Performer | 7400 | Motion capture, controllers |
| Audience | 7402 | Touch, gestures |

**In Max, create receiver**:
```
[udpreceive 7400]    ← Performer data
[udpreceive 7402]    ← Audience data
      |
[oscparse]
      |
[route /performer1 /audience]
```

👉 **Full OSC reference**: [Max/MSP Quick Reference (English)](docs/MAXMSP_QUICK_REF_EN.md)

---

## 🌐 Performance Scenarios

| Scenario | Menu Option | Description |
|----------|-------------|-------------|
| **Local venue** | Option 1 | Everyone on same WiFi |
| **International** | Option 2 | Audience on any network (Cloudflare) |
| **China** | Option 3 | Audience on any network (cpolar) |
| **Large venue** | Options 4-7 | Dual-machine mode |

---

## 📖 Documentation

| I want to... | Read this |
|--------------|-----------|
| Quick start with Docker | [Docker Guide (EN)](docs/DOCKER_GUIDE_EN.md) |
| Quick start without Docker | [Quick Start (EN)](QUICK_START.md) |
| See all OSC addresses | [Max/MSP Reference (EN)](docs/MAXMSP_QUICK_REF_EN.md) |
| Handle audience data | [Audience Data Guide (EN)](docs/MAXMSP_AUDIENCE_GUIDE_EN.md) |

---

## 📊 Performance

Tested on MacBook Pro (M-series):

| Concurrent Users | Status |
|-----------------|--------|
| 50 | ✅ Stable |
| 100 | ✅ Stable |
| 150 | ✅ Stable |
| 200 | ✅ Stable (batched connections) |

Run your own test: `./run-stress-test.sh`

---

## 📜 Citation

If you use Gestalt in your research or creative work:

```bibtex
@software{gestalt2025,
  author = {Sitong Wu},
  title = {Gestalt: A Symbiotic Framework for Real-Time Collaboration between Performers and Mass Audiences},
  year = {2025},
  url = {https://github.com/Purest-11/Gestalt}
}
```

---

## 📄 License

MIT License — Free to use, modify, and distribute

---

**Made with ♥ for interactive music performance**
