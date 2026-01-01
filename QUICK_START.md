# ◈ Gestalt Quick Start

**For artists who just want it to work.**

---

## Choose Your Method

| Method | Best For |
|--------|----------|
| **[Docker](#-docker-method)** ⭐ | Beginners, quick setup |
| **[Direct](#-direct-method)** | More control, no Docker |

---

## 🐳 Docker Method

### Step 1: Install Docker Desktop

1. Download from https://www.docker.com/products/docker-desktop/
2. Install and **launch it**
3. Wait until you see "Docker is running"

### Step 2: Download & Start

```bash
# Download (or get ZIP from GitHub)
git clone https://github.com/YOUR_USERNAME/gestalt.git
cd gestalt

# Start
./docker-start.sh
```

**First time takes 2-5 minutes** (downloading images).

### Step 3: Choose Mode

You'll see this menu:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Single Machine Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1) 🎭 Local Performance
     Audience must join same WiFi

  2) 🌐 Public Mode [Cloudflare]
     International venues

  3) 🇨🇳 Public Mode [cpolar]
     China venues (faster)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🖥️🖥️ Dual Machine Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  4) 👁️ Visual Machine - Local
  5) 🌐 Visual Machine - Cloudflare
  6) 🇨🇳 Visual Machine - cpolar
```

**For first test, select `1`** (Local Performance).

### Step 4: Open in Browser

After startup, you'll see URLs:

```
🎭 Performer:  http://localhost:3000/mocap/?performer=1
👥 Audience:   http://YOUR_IP:3002/audience-touch/
📊 Monitor:    http://localhost:3002/?performer=audience
```

**Test:**
1. Open **Performer URL** in Chrome → Allow camera → Wave hands
2. Open **Audience URL** on phone (scan QR in monitor panel)
3. Check **Monitor** to see particles

### Step 5: Connect Max/MSP

```
[udpreceive 7400]    ← Performer data
[udpreceive 7402]    ← Audience data
      |
[oscparse]
      |
[print]              ← See incoming data
```

**Done!** 🎉

---

## 💻 Direct Method

### Step 1: Install Node.js

1. Download from https://nodejs.org/ (LTS version)
2. Install it

Verify:
```bash
node --version    # Should show v18+
```

### Step 2: Download & Start

```bash
git clone https://github.com/YOUR_USERNAME/gestalt.git
cd gestalt
npm install
./start.sh
```

### Step 3: Choose Mode

You'll see this menu:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Single Machine Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1) 🎭 Local Performance + Split Screen
  2) 🌐 Public Mode (International) [Cloudflare]
  3) 🇨🇳 Public Mode (China) [cpolar]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🖥️🖥️ Dual Machine Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  4) 🎭 Performer Machine (MediaPipe + Max MSP)
  5) 👁️ Visual Machine - Local
  6) 🌐 Visual Machine - Cloudflare
  7) 🇨🇳 Visual Machine - cpolar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚙️ Other Options
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  8) 🔗 Show Access URLs
  9) 🛑 Stop All Systems
  L) 🌍 Change Language
  q) Exit
```

**For first test, select `1`**.

### Step 4: Test

Same as Docker — open URLs in browser.

---

## 🎯 Which Mode to Choose?

| Situation | Mode |
|-----------|------|
| **Testing / Rehearsal** | 1 (Local) |
| **Small venue (<100 people)** | 1 (Local) |
| **International event** | 2 (Cloudflare) |
| **China event** | 3 (cpolar) |
| **Large venue (>100 people)** | 4+5/6/7 (Dual machine) |

---

## ❓ Common Issues

### Camera not working
- Use **Chrome** browser
- Allow camera permission
- Close other apps using camera

### Phone can't connect
- Both devices on **same WiFi**
- Check IP address is correct
- Firewall might block port 3002

### No data in Max
- Check port: 7400 (performer) or 7402 (audience)
- Make sure server is running

### Docker won't start
- Make sure Docker Desktop is **running** (whale icon)
- Mac: Allow Docker in System Preferences

### China users: Docker download slow
- Run `./docker-mirror-setup.sh` to configure mirror
- Or select option `m` in docker-start.sh menu

---

## 📚 More Info

- [Full OSC Reference](docs/MAXMSP_QUICK_REF.md)
- [Docker Guide](docs/DOCKER_GUIDE.md)
- [Audience Data Guide](docs/MAXMSP_AUDIENCE_GUIDE.md)
