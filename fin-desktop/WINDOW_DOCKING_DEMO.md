# Window Docking Demo - Quick Start

## 🚀 Run the Test in 30 Seconds

```powershell
# Start the test version with window docking
npm run dev:test-docking
```

That's it! The app will launch with window docking enabled.

## 🎯 What to Do

### Test 1: Snap to Left Half
1. **Grab** the window title bar
2. **Drag** toward the left edge of your screen
3. **Get close** to the edge (within 10 pixels)
4. **Release** the mouse

**✅ Expected:** Window snaps to fill the left half of your screen

**Console output:**
```
🔷 [Docking] LEFT HALF - Window snapped to left side
```

---

### Test 2: Snap to Right Half
1. **Grab** the window title bar
2. **Drag** toward the right edge of your screen
3. **Get close** to the edge (within 10 pixels)
4. **Release** the mouse

**✅ Expected:** Window snaps to fill the right half of your screen

**Console output:**
```
🔶 [Docking] RIGHT HALF - Window snapped to right side
```

---

### Test 3: Snap to Fullscreen
1. **Grab** the window title bar
2. **Drag** toward the top edge of your screen
3. **Get close** to the edge (within 10 pixels)
4. **Release** the mouse

**✅ Expected:** Window snaps to fill the entire screen

**Console output:**
```
🔳 [Docking] FULLSCREEN - Window snapped to fullscreen
```

---

### Test 4: Multiple Windows Side-by-Side

1. **Launch an app** from the FinDesktop launcher (e.g., "Order Ticket")
2. **Drag** the Order Ticket window to the **left edge** → Snaps left
3. **Launch another app** (e.g., "News")
4. **Drag** the News window to the **right edge** → Snaps right

**✅ Expected:** Two windows side-by-side, each taking half the screen

---

## 📺 Visual Guide

```
Before docking:                    After docking LEFT:
┌─────────────────────┐           ┌──────────┬──────────┐
│                     │           │          │          │
│    [Your Window]    │    →      │ [Window] │          │
│                     │           │ (Left)   │          │
└─────────────────────┘           └──────────┴──────────┘
   (drag to left edge)                (fills left half)


Before docking:                    After docking RIGHT:
┌─────────────────────┐           ┌──────────┬──────────┐
│                     │           │          │          │
│    [Your Window]    │    →      │          │ [Window] │
│                     │           │          │ (Right)  │
└─────────────────────┘           └──────────┴──────────┘
   (drag to right edge)               (fills right half)


Before docking:                    After docking TOP:
┌─────────────────────┐           ┌─────────────────────┐
│    [Your Window]    │           │                     │
│                     │    →      │     [Window]        │
│                     │           │    (Fullscreen)     │
└─────────────────────┘           └─────────────────────┘
   (drag to top edge)                (fills entire screen)
```

---

## 🎬 Demo Script (5 Minutes)

### Minute 1: Launch & Explain
```powershell
npm run dev:test-docking
```
- "This is FinDesktop with window docking"
- "Watch the console for docking events"
- "Edge threshold is 10 pixels"

### Minute 2: Left Half Demo
- Drag main window to left edge
- "See? Perfect left half snap"
- Point out console message

### Minute 3: Right Half Demo
- Drag main window to right edge
- "Now right half"
- Show smooth animation

### Minute 4: Fullscreen Demo
- Drag to top edge
- "Top edge triggers fullscreen"
- "Notice it takes priority"

### Minute 5: Multi-Window
- Open Order Ticket app
- Dock to left
- Open News app
- Dock to right
- "Perfect workspace layout!"

---

## 🔧 Troubleshooting

### "Nothing happens when I drag"

**Possible causes:**
1. **Not close enough** - Get within 10 pixels of the edge
2. **Window is maximized** - Restore window first
3. **Dragging too fast** - Try slower, more controlled drag

**Solution:**
```powershell
# Try with larger threshold (easier to trigger)
# Edit electron/main-test-docking.cjs line 17:
this.edgeThreshold = 50; // Instead of 10
```

### "Snaps too aggressively"

**Solution:**
```javascript
// Reduce threshold in electron/main-test-docking.cjs:
this.edgeThreshold = 5; // More precise
```

### "Console shows errors"

Check:
- Vite dev server is running (port 5173)
- No port conflicts
- DevTools console for renderer errors

---

## 🎨 What You'll See in Console

### Startup:
```
============================================================
🎯 FinDesktop Window Docking Test
============================================================

📋 Test Instructions:
   1. Drag window close to LEFT edge → Snaps to left half
   2. Drag window close to RIGHT edge → Snaps to right half
   3. Drag window close to TOP edge → Snaps to fullscreen

⚙️  Settings: Edge threshold = 10px
   (Window must be within 10 pixels of edge to snap)

💡 Tips:
   - Open app windows from the launcher
   - Each window docks independently
   - Watch console for docking events
   - Use DevTools to inspect window behavior

============================================================

[TestWM] Created window: MainWorkspace (ID: 1)
[TestWM] Window ready: MainWorkspace
```

### During Docking:
```
🔷 [Docking] LEFT HALF - Window snapped to left side
🔶 [Docking] RIGHT HALF - Window snapped to right side
🔳 [Docking] FULLSCREEN - Window snapped to fullscreen
```

### Opening Apps:
```
[Test] Opening app: OrderTicketApp
[TestWM] Created window: OrderTicketApp (ID: 2)
[TestWM] Window ready: OrderTicketApp
```

---

## ⚡ Quick Commands

```powershell
# Run test version
npm run dev:test-docking

# Run normal version (without docking test)
npm run dev

# Stop app
Ctrl+C in terminal

# Clear and restart
Ctrl+C
npm run dev:test-docking
```

---

## 📊 Success Criteria

After testing, you should verify:

- [x] ✅ Left edge snap works
- [x] ✅ Right edge snap works  
- [x] ✅ Top edge snap works (fullscreen)
- [x] ✅ Smooth animations
- [x] ✅ Console shows docking events
- [x] ✅ Multiple windows dock independently
- [x] ✅ Launcher apps can be docked
- [x] ✅ No errors in console

---

## 🎓 Understanding the Implementation

The test file (`electron/main-test-docking.cjs`) implements:

1. **TestWindowManager class** - Manages windows with docking
2. **Edge detection** - Calculates distance from screen edges
3. **Docking positions** - LEFT, RIGHT, FULLSCREEN
4. **Event handling** - Listens to window 'move' events
5. **Recursion prevention** - Prevents infinite docking loops

Key code:
```javascript
// Detect edge proximity
const distanceFromLeft = Math.abs(bounds.x - workArea.x);
if (distanceFromLeft <= threshold) {
  return 'LEFT'; // Dock to left
}

// Apply docking
win.setBounds(targetBounds, true); // true = animate
```

---

## 🚦 Next Steps

### After Successful Test:

1. **Integrate into main app** (see `TESTING_GUIDE.md`)
2. **Customize edge threshold** in config
3. **Add user preferences** for docking on/off
4. **Implement keyboard shortcuts** (Win+Left, Win+Right)
5. **Add visual indicators** during drag

### Production Integration:

Replace `electron/main-test-docking.cjs` logic with the full `WindowManager` from `src/main/windowManager.ts`.

See integration guide: `src/main/TESTING_GUIDE.md`

---

## 📹 Record a Demo

```powershell
# Use Windows Game Bar (Win+G) or OBS to record:
1. Start recording
2. Launch: npm run dev:test-docking
3. Demonstrate all three snapping modes
4. Show multiple windows
5. Stop recording
```

Perfect for sharing with your team!

---

## 🎉 You're Ready!

Just run:
```powershell
npm run dev:test-docking
```

Then drag windows to edges and watch the magic happen! 🚀

Questions? Check `src/main/TESTING_GUIDE.md` for detailed troubleshooting.
