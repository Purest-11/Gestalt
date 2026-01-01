# 🎯 Max/MSP Connection - Quick Reference

## ⚡ Core Information

| Parameter | Value |
|-----------|-------|
| **Performer UDP Port** | `7400` |
| **Audience UDP Port** | `7402` |
| **Receive Object** | `[udpreceive 7400]` or `[udpreceive 7402]` |

### 🎯 Port Architecture

```
Performer 1  → 7400 → Max/MSP
Performer 2  → 7401 → Max/MSP
Audience     → 7402 → Max/MSP
```

---

## 📡 Basic Max/MSP Patch

```maxpat
[udpreceive 7400]     ← Performer data
[udpreceive 7402]     ← Audience data
      |
[oscparse]
      |
[route /performer1 /audience]
      |
[print]               ← See all messages
```

---

## 📊 OSC Message Reference

### Performer Data (Port 7400)

| OSC Address | Type | Range | Description |
|-------------|------|-------|-------------|
| `/performer1/hand/left/gesture` | int | 0-5 | Left hand gesture |
| `/performer1/hand/right/gesture` | int | 0-5 | Right hand gesture |
| `/performer1/body/{keypoint}/x` | float | 0-1 | Body X position |
| `/performer1/body/{keypoint}/y` | float | 0-1 | Body Y position |
| `/performer1/slider1` - `/slider8` | float | 0-1 | Control sliders |

**Body Keypoints**: nose, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_hip, right_hip

**Hand Gestures**: 0=unknown, 1=open, 2=closed, 3=pointing, 4=thumbs_up, 5=peace

### Audience Data (Port 7402)

| OSC Address | Type | Range | Description |
|-------------|------|-------|-------------|
| `/audience/swipe/intensity` | float | 0-0.3 | Touch intensity (30% weighted) |
| `/audience/swipe/direction` | float | 0-360 | Swipe direction (degrees) |
| `/audience/swipe/velocity` | float | 0-0.3 | Swipe speed |
| `/audience/gesture/type` | int | 0-4 | Gesture type |
| `/audience/count` | int | 0-200+ | Online audience count |
| `/audience/keyboard/note` | int | 36-95 | MIDI note (virtual keyboard) |

**Gesture Types**:
```
0 = idle (still)
1 = swipe_up
2 = swipe_down
3 = swipe_left
4 = swipe_right
```

---

## 🔧 Example Patches

### Receive All Data

```maxpat
[udpreceive 7400]
      |
[oscparse]
      |
[route /performer1]
      |
[route /hand /body /slider1]
   |      |        |
[gesture][position][value]
```

### Audience Volume Control

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
[* 127]           ← Scale to MIDI range
      |
[pack 0. 50]      ← 50ms smoothing
      |
[line~]
      |
[*~ 1.]           ← To audio
```

---

## 🔍 Troubleshooting

### No messages received?

1. ✅ Check port number (7400 for performer, 7402 for audience)
2. ✅ Server is running (`./start.sh`)
3. ✅ Someone is connected and interacting
4. ✅ Check firewall settings

### Values seem wrong?

1. Audience values are pre-weighted at 30% (`oscWeight = 0.3`)
2. Scale values as needed: `[* 127]` for MIDI range
3. Add smoothing with `[line~]` for audio control

---

## 📚 More Information

- **Detailed Guide**: [MAXMSP_AUDIENCE_GUIDE_EN.md](MAXMSP_AUDIENCE_GUIDE_EN.md)
- **Example Patch**: `max-patches/audience-receiver.maxpat`

