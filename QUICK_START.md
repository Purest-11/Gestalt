# 🚀 Quick Start Guide

> From zero to running in under 10 minutes

**[English](#step-1-install-nodejs) | [中文](快速开始.md)**

---

## Step 1: Install Node.js

**If you don't have Node.js:**

Download: https://nodejs.org/ (choose LTS version)

**Verify installation:**
```bash
node --version
# Should show v18.0.0 or higher
```

---

## Step 2: Download the Project

### Option A: Via Terminal
```bash
git clone https://github.com/Purest-11/Gestalt.git
cd Gestalt
```

### Option B: Direct Download
1. Visit https://github.com/Purest-11/Gestalt
2. Click green "Code" button → "Download ZIP"
3. Extract and open the folder in Terminal

---

## Step 3: Install Dependencies

```bash
npm install
```

Wait about 1-2 minutes.

---

## Step 4: Start the System

```bash
./start.sh
```

You'll see an interactive menu:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Single Machine Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1) 🎭 Local Performance      ← Select this for first test
  2) 🌐 Public Mode [Cloudflare]
  3) 🇨🇳 Public Mode [cpolar]

  ...more options...
```

**Enter `1` and press Enter** for local mode.

---

## Step 5: Test the System

The console shows access URLs:

```
╔════════════════════════════════════════════╗
║          📱 Performer Motion Capture        ║
╠════════════════════════════════════════════╣
║  http://localhost:3000/mocap/?performer=1   ║
╚════════════════════════════════════════════╝

╔════════════════════════════════════════════╗
║            👥 Audience Monitor              ║
╠════════════════════════════════════════════╣
║  http://192.168.1.xxx:3002/?performer=audience ║
╚════════════════════════════════════════════╝
```

### Test Flow

1. **Open Motion Capture Page**
   - Go to `http://localhost:3000/mocap/?performer=1`
   - Allow camera access
   - Wave your hands, see skeleton overlay

2. **Open Audience Page on Phone**
   - Use your phone's camera to scan the QR code displayed on the monitor page
   - Or enter the URL manually: `http://YOUR_IP:3002/audience-touch/`
   - Touch and swipe on the screen

3. **Check Monitor Panel**
   - Go to `http://localhost:3002/?performer=audience`
   - See audience members as particles
   - See your motion captured data

---

## Step 6: Connect Max/MSP

The system sends OSC data via UDP:

| Data | Port | Object |
|------|------|--------|
| Performer | 7400 | `[udpreceive 7400]` |
| Audience | 7402 | `[udpreceive 7402]` |

**Create this in Max:**

```maxpat
[udpreceive 7400]
      |
[oscparse]
      |
[route /performer1]
      |
[print]           ← See all performer data
```

---

## 🎯 Practical Scenarios

### Scenario 1: Rehearsal

Just you and your laptop:
- Run `./start.sh` → Select 1 (Local)
- Open motion capture on your browser
- Connect Max/MSP
- Done!

### Scenario 2: Local Performance

Venue with WiFi or portable router:
- Connect your computer and audience phones to same network
- Run `./start.sh` → Select 1 (Local)
- Audience scans QR code to join
- **Best latency: 20-30ms**

### Scenario 3: International Event

Conference attendees on various networks:
- Run `./start.sh` → Select 2 (Cloudflare)
- System creates a public URL automatically
- Share the URL with attendees
- **Note**: Higher latency (50-150ms)

---

## ⚠️ Common Issues

### "Command not found: ./start.sh"

```bash
chmod +x start.sh
./start.sh
```

### Camera not working

- Ensure browser has camera permission
- Try Chrome (better compatibility)
- Check no other app is using the camera

### Audience can't connect

1. Ensure phone is on same WiFi as your computer
2. Check IP address is correct
3. Verify firewall isn't blocking port 3002

### Max not receiving data

1. Check `[udpreceive 7400]` is open (not locked)
2. Ensure server is running
3. Verify with `[print]` after route

---

## 📖 Next Steps

| I want to... | Read this |
|--------------|-----------|
| Use Docker instead | [Docker Guide (EN)](docs/DOCKER_GUIDE_EN.md) |
| See all OSC addresses | [Max/MSP Reference (EN)](docs/MAXMSP_QUICK_REF_EN.md) |
| Handle audience data | [Audience Guide (EN)](docs/MAXMSP_AUDIENCE_GUIDE_EN.md) |

---

**Good luck with your performance!** 🎭
