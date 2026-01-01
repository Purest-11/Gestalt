# 🐳 Gestalt Docker Deployment Guide

> One-click deployment with Docker

---

## 🚀 Quick Start

### 1. Install Docker Desktop

Download: https://www.docker.com/products/docker-desktop/

Launch and wait until "Docker is running" appears.

### 2. Start the System

```bash
cd Gestalt
./docker-start.sh
```

First launch takes **2-5 minutes** to download images.

---

## 🎛️ Interactive Launcher

Running `./docker-start.sh` shows an interactive menu:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Single Machine Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1) 🎭 Local Performance      ← Select this for first test
  2) 🌐 Public Mode [Cloudflare]
  3) 🇨🇳 Public Mode [cpolar]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🖥️🖥️ Dual Machine Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  4) 👁️ Visual Machine - Local
  5) 🌐 Visual Machine - Cloudflare
  6) 🇨🇳 Visual Machine - cpolar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚙️ Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  7) 📊 View Status
  8) 📋 View Logs
  9) 🔄 Rebuild
  0) 🔑 Configure cpolar
  m) 🚀 Configure Mirror [China users]
  L) 🌍 Change Language
  s) 🛑 Stop All Services
  q) Exit
```

---

## 📍 Access URLs

After startup:

| Page | URL |
|------|-----|
| Motion Capture | http://localhost:3000/mocap/?performer=1 |
| Audience Touch | http://YOUR_IP:3002/audience-touch/ |
| Monitor Panel | http://localhost:3002/?performer=audience |

### Max/MSP Configuration

```
[udpreceive 7400]    ← Performer data
[udpreceive 7402]    ← Audience data
      |
[oscparse]
```

---

## ⚠️ Latency Reference

| Deployment | Latency | Best For |
|------------|---------|----------|
| **Local WiFi** | 20-30ms ⭐ | Live performance |
| **Cloudflare (Europe)** | 50-150ms ✓ | International events |
| **Cloudflare (from China)** | 700-1200ms ❌ | Not recommended |
| **cpolar (China)** | 50-200ms ✓ | China events |

**Best practice**: Use local WiFi with portable router for live performances.

---

## 🎯 Deployment Scenarios

### A: Local Performance (Recommended)

```
Portable Router / WiFi Hotspot
    ├── Your Computer (Docker)
    ├── Audience Phone 1
    ├── Audience Phone 2
    └── ...
```

**Pros**: Lowest latency (20-30ms), most stable

### B: International Event

```
Your Computer
    └── Docker + Cloudflare Tunnel
            └── Public URL → Audience access
```

**Pros**: Audience on any network
**Use**: ICMC, international conferences

### C: Cloud Server

```
Cloud Server (AWS/Azure)
    └── Docker Container
            └── Fixed IP/Domain → Audience access
```

**Pros**: Always available, pre-deployable
**Use**: Exhibitions, installations

---

## 📦 Prerequisites

### Install Docker

**macOS:**
```bash
# Download Docker Desktop
# https://www.docker.com/products/docker-desktop

# Or via Homebrew
brew install --cask docker
```

**Windows:**
- Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

**Linux:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in
```

### Verify Installation

```bash
docker --version
docker-compose --version
```

---

## 🔧 Manual Commands (Advanced)

### Start Local Mode

```bash
docker-compose up -d
```

### Start with Cloudflare Tunnel

```bash
docker-compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d
```

### View Logs

```bash
docker-compose logs -f
```

### Stop All

```bash
docker-compose down
```

### Rebuild

```bash
docker-compose up -d --build
```

---

## 🔍 Troubleshooting

### Docker won't start

1. Ensure Docker Desktop is running (whale icon)
2. On Mac: Allow Docker in System Preferences → Security
3. Try restarting Docker Desktop

### Build fails (China users)

Docker Hub may be slow/blocked in China:

```bash
# Run mirror configuration
./docker-mirror-setup.sh
```

Or select option `m` in the docker-start.sh menu.

### Can't connect to audience page

1. Check IP address is correct
2. Ensure firewall allows port 3002
3. Verify Docker container is running: `docker ps`

### No OSC data in Max

1. Confirm ports: 7400 (performer), 7402 (audience)
2. Docker sends to `host.docker.internal` (your Mac)
3. Check container logs: `docker-compose logs -f`

---

## 📚 More Information

- **Quick Start**: [QUICK_START.md](../QUICK_START.md)
- **Max/MSP Reference**: [MAXMSP_QUICK_REF_EN.md](MAXMSP_QUICK_REF_EN.md)
- **Audience Data Guide**: [MAXMSP_AUDIENCE_GUIDE_EN.md](MAXMSP_AUDIENCE_GUIDE_EN.md)

