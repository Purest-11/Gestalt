# 🎮 Max/MSP Audience System Connection Guide

## 📡 Quick Connection

### Port Architecture

```
Performer 1  → Port 7400 → Max/MSP
Performer 2  → Port 7401 → Max/MSP
Audience     → Port 7402 → Max/MSP
```

### Basic Max/MSP Setup

```maxpat
[udpreceive 7402]     ← Audience system port
      |
[oscparse]
      |
[route /audience]
      |
[print]               ← See all messages
```

---

## 📊 OSC Message List

### 1. Touch Gesture Data

| OSC Address | Type | Range | Description |
|-------------|------|-------|-------------|
| `/audience/swipe/intensity` | float | 0-0.3 | Swipe intensity (30% weighted) |
| `/audience/swipe/direction` | float | 0-360 | Swipe direction (degrees) |
| `/audience/swipe/distance` | float | 0-0.3 | Swipe distance (30% weighted) |
| `/audience/swipe/velocity` | float | 0-0.3 | Swipe speed (30% weighted) |
| `/audience/fingers` | int | 1-5 | Average finger count |

### 2. Gesture Types

| OSC Address | Type | Value | Description |
|-------------|------|-------|-------------|
| `/audience/gesture/type` | int | 0 | Idle (still) |
| | | 1 | Swipe up |
| | | 2 | Swipe down |
| | | 3 | Swipe left |
| | | 4 | Swipe right |

### 3. Statistics

| OSC Address | Type | Description |
|-------------|------|-------------|
| `/audience/count` | int | Total online audience |
| `/audience/active_count` | int | Active audience count |
| `/audience/gesture_count` | int | People doing dominant gesture |

### 4. Virtual Keyboard

| OSC Address | Type | Range | Description |
|-------------|------|-------|-------------|
| `/audience/keyboard/note` | int | 36-95 | MIDI note number (C2-B6) |
| `/audience/keyboard/velocity` | int | 1-127 | Note velocity |

---

## 🔧 Customizing OSC Mapping

### Location: `server.js` lines 340-363

```javascript
// Default OSC output (30% weight for audience)
const oscWeight = 0.3;

sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);
sendOSCMessage('/audience/swipe/direction', avgDirection);
sendOSCMessage('/audience/swipe/velocity', avgVelocity * oscWeight);
```

### Example: Change OSC Address

```javascript
// Original
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);

// Changed to
sendOSCMessage('/synth/volume', avgIntensity * oscWeight);
```

### Example: Change Value Range

```javascript
// Original (0-0.3)
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight);

// MIDI range (0-127)
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight * 127);

// Percentage (0-100)
sendOSCMessage('/audience/swipe/intensity', avgIntensity * oscWeight * 100);
```

### Example: Different Parameters per Gesture

```javascript
if (dominantGesture === 'swipe_up') {
  sendOSCMessage('/synth/pitch', 1.0 + avgIntensity);
} else if (dominantGesture === 'swipe_down') {
  sendOSCMessage('/synth/pitch', 1.0 - avgIntensity);
} else if (dominantGesture === 'swipe_left') {
  sendOSCMessage('/synth/pan', -0.8);
} else if (dominantGesture === 'swipe_right') {
  sendOSCMessage('/synth/pan', 0.8);
}
```

---

## 🎨 Complete Max/MSP Patch

### Full Receiver

```maxpat
┌──────────────────────────────────────────────────────┐
│                 [udpreceive 7402]                    │
│                        |                             │
│                   [oscparse]                         │
│                        |                             │
│                [route /audience]                     │
│                        |                             │
│    ┌───────────────────┼───────────────────┐        │
│    |         |         |         |         |        │
│ [/count] [/active] [/swipe]  [/gesture] [/keyboard] │
│    |         |         |         |         |        │
│  [i 0]     [i 0]   [route      [/type]  [/note]    │
│    |         |    /intensity]    |         |        │
│ Audience  Active     |        [sel 0-4]  MIDI      │
│  Count    Count   [f 0.]         |       Note      │
│                      |      Gesture Type           │
│                  Intensity                          │
└──────────────────────────────────────────────────────┘
```

### Synth Control Example

```maxpat
[udpreceive 7402]
      |
[oscparse]
      |
[route /audience]
      |
[route /swipe]
      |
[route /intensity]
      |
[* 127]                 ← Scale to MIDI
      |
[pack 0. 50]            ← 50ms smoothing
      |
[line~]
      |
[*~ 1.]                 ← To synth volume
```

---

## 🧪 Testing

### 1. Start the System

```bash
./start.sh
# Select option 1 (Local Mode)
```

### 2. Create Test Patch in Max

```maxpat
[udpreceive 7402]
      |
[oscparse]
      |
[print received]
```

### 3. Open Audience Page on Phone

Visit: `http://YOUR_IP:3002/audience-touch/`

### 4. Touch and Watch Max Console

You should see:
```
received: /audience/swipe/intensity 0.123
received: /audience/count 1
received: /audience/gesture/type 1
```

---

## 🔍 Troubleshooting

### Max not receiving messages?

1. Check port is **7402** (not 7400)
2. Ensure server is running
3. Verify audience is connected and touching
4. Check Max console shows "bound to port 7402"

### Values seem wrong?

- Audience values are weighted at 30% by default
- Scale as needed: `[* 127]` for MIDI range
- Add smoothing: `[line~]` with `[pack 0. 50]`

### After modifying server.js

1. Save the file
2. Restart server: `Ctrl+C` then `./start.sh`
3. Reconnect in Max

---

## 📚 Available Variables in server.js

```javascript
avgIntensity   // Average intensity (0-1)
avgDirection   // Average direction (0-360)
avgDistance    // Average distance (0-1)
avgVelocity    // Average velocity (0-1)
avgFingers     // Average finger count (1-5)
dominantGesture // 'idle', 'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right'
audienceData.size // Total audience count
activeCount    // Active audience count
```

---

**Good luck with your performance!** 🚀

