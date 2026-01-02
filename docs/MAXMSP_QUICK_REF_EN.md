# 🎯 Max/MSP Connection - Quick Reference

## ⚡ Core Information

| Parameter | Value |
|-----------|-------|
| **Performer UDP Port** | `7400` |
| **Audience UDP Port** | `7402` |
| **Receive Object** | `[udpreceive 7400]` or `[udpreceive 7402]` |
| **Template Project** | `max-patches/Gestalt-Max:Msp Template Project/` |

### 🎯 Port Architecture

```
Performer 1  → 7400 → Max/MSP → Pigments 1
Performer 2  → 7401 → Max/MSP → Pigments 2
Audience     → 7402 → Max/MSP → Pigments 3
```

---

## 📦 Open the Template Project

1. Navigate to `max-patches/Gestalt-Max:Msp Template Project/` folder
2. Double-click to open `Gestalt patch.maxpat`
3. Load Pigments presets from `reference sound/` (optional)

The template is pre-configured with OSC receiving and parameter routing, ready to use.

---

## 🎛️ Custom Mapping: Two Methods

### Method 1: Web GUI Mapping Editor (Recommended) ⭐

The system provides a visual mapping editor — **no coding required**:

1. Open monitor panel at `http://localhost:3002/?performer=audience`
2. Click the **Mapping Editor** button (bottom left)
3. In the interface:
   - Select input source (gesture, swipe intensity, direction, etc.)
   - Set OSC address (e.g., `/pigments/CUTOFF1`)
   - Adjust value range and weight
4. Click save, changes apply immediately

### Method 2: Max/MSP Routing Configuration

In the declarative mapping system, OSC addresses defined on the Web must match Max/MSP routing configuration. Three key configuration points:

**(1) Port Configuration**

The `udpreceive` object port must match the system assignment:
- Performer: `[udpreceive 7400]`
- Audience: `[udpreceive 7402]`

**(2) Address Routing**

OSC addresses in `route` objects must **exactly match** addresses configured in the Web mapping editor, including case and slash format:

```maxpat
[udpreceive 7402]
      |
[oscparse]
      |
[route /pigments]
      |
[route /VC /CUTOFF1 /LFO1_RATE]
   |       |           |
[param1] [param2]   [param3]
```

If addresses don't match, OSC messages will be ignored.

**(3) Parameter Binding**

Routed values are sent to Pigments synthesizer using `[paramID $1]` format:

```maxpat
[route /CUTOFF1]
      |
[200 $1]          ← 200 is Pigments' CUTOFF1 parameter ID
      |
[vst~ Pigments]
```

Parameter IDs can be found in Pigments' parameter index.

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

## ✅ Test Flow

1. **Start the system**
   ```bash
   ./start.sh
   # Select 1 (Local Mode)
   ```

2. **Open Max template**
   - File: `max-patches/Gestalt-Max:Msp Template Project/Gestalt patch.maxpat`

3. **Access on phone**
   - Scan QR code on the monitor panel
   - Or visit: `http://YOUR_IP:3002/audience-touch/`

4. **Test**
   - Touch and swipe on phone
   - Watch Max console output

---

## 🔍 Troubleshooting

### No messages received?

1. ✅ Check port number (7400 for performer, 7402 for audience)
2. ✅ Server is running (`./start.sh`)
3. ✅ Someone is connected and interacting
4. ✅ Check firewall settings

### OSC addresses don't match?

Ensure addresses in Web mapping editor **exactly match** Max/MSP `route` objects:
- Case sensitive
- Consistent slash format
- No extra spaces

---

## 📚 More Information

- **Detailed Guide**: [MAXMSP_AUDIENCE_GUIDE_EN.md](MAXMSP_AUDIENCE_GUIDE_EN.md)
- **Template Project**: `max-patches/Gestalt-Max:Msp Template Project/`
- **Pigments Presets**: `max-patches/Gestalt-Max:Msp Template Project/reference sound/`
