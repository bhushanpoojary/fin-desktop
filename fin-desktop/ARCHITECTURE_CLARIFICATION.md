# FinDesktop Architecture - Application vs Website

## Overview

FinDesktop has two separate components with distinct purposes:

## 1. 🖥️ Desktop Application (This Codebase)

**Purpose:** The actual FinDesktop workspace application that runs on user's computers.

**Key Components:**
- **WorkspaceShell** - Main workspace container
- **Launcher** - App launcher modal for opening financial apps
- **WorkspaceDock** - Tab-based layout system with FlexLayout
- **Welcome Page** - Initial tab that shows when workspace opens
- **Window Docking System** - Custom windowing with snap behavior (newly implemented)
- **FDC3 Integration** - Financial desktop interoperability

**User Experience:**
```
User opens FinDesktop
    ↓
WorkspaceShell loads
    ↓
Shows Welcome tab with "🚀 Open Launcher" button
    ↓
User clicks Launcher button
    ↓
Launcher modal opens with app grid
    ↓
User selects app (e.g., "Market Data", "Order Ticket")
    ↓
App opens in new tab in WorkspaceDock
```

**Location:** `src/workspace/WorkspaceShell.tsx`

### Launcher Integration

The Launcher is fully integrated:
- Button in top navigation bar
- "🚀 Open Launcher" button on Welcome page
- Modal overlay when opened
- Launches apps into WorkspaceDock tabs
- Source: `src/features/launcher/Launcher.tsx`

### Welcome Page

The Welcome page is the default tab:
- Shows when workspace first opens
- Has "Welcome to the Workspace" message
- Has prominent "🚀 Open Launcher" button
- Users can drag and open more apps
- Source: `src/workspace/WorkspaceDock.tsx` (welcome tab factory)

---

## 2. 🌐 Marketing Website (External - Separate Project)

**Purpose:** Public-facing website to showcase FinDesktop features and documentation.

**What It Shows:**
- Feature cards ("Window Docking", "FDC3 Compatibility", etc.)
- "Try Demo" buttons
- Documentation and API reference
- Getting started guides
- Marketing content ("Why Choose FinDesktop?")

**Target Audience:**
- Potential customers
- Developers evaluating the framework
- Online visitors researching financial desktop solutions

**Relationship:**
- Completely separate from the desktop application
- May link to download/install the desktop app
- Shows screenshots and demos
- Hosts online documentation

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                 FINDESKTOP ECOSYSTEM                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  1. Desktop Application (This Repo)              │ │
│  │                                                   │ │
│  │  ┌─────────────────────────────────────────┐    │ │
│  │  │ WorkspaceShell                          │    │ │
│  │  │  ├─ Header (Launcher button, Save...)   │    │ │
│  │  │  ├─ WorkspaceDock (FlexLayout)          │    │ │
│  │  │  │   ├─ Welcome Tab (default)           │    │ │
│  │  │  │   │   └─ "🚀 Open Launcher" button   │    │ │
│  │  │  │   ├─ Market Data Tab                 │    │ │
│  │  │  │   ├─ Order Ticket Tab                │    │ │
│  │  │  │   └─ ... more app tabs               │    │ │
│  │  │  └─ Launcher Modal (when opened)        │    │ │
│  │  │      └─ App grid for selection          │    │ │
│  │  └─────────────────────────────────────────┘    │ │
│  │                                                   │ │
│  │  User's Computer (Electron or Browser)           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  2. Marketing Website (Separate Project)         │ │
│  │                                                   │ │
│  │  ┌─────────────────────────────────────────┐    │ │
│  │  │ Landing Page                            │    │ │
│  │  │  ├─ Hero section                        │    │ │
│  │  │  ├─ Feature cards:                      │    │ │
│  │  │  │   ├─ Window Docking (Try Demo →)     │    │ │
│  │  │  │   └─ FDC3 Compatibility (Try Demo →) │    │ │
│  │  │  ├─ Documentation links                 │    │ │
│  │  │  └─ "Why Choose FinDesktop?"            │    │ │
│  │  └─────────────────────────────────────────┘    │ │
│  │                                                   │ │
│  │  Public Internet (Marketing/Docs)                │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## What's Included in the Desktop Application

### ✅ Already Integrated (Do Not Remove)

1. **Launcher** (`src/features/launcher/Launcher.tsx`)
   - App grid modal
   - Integrated in WorkspaceShell
   - Button in header + welcome page

2. **Welcome Page** (in WorkspaceDock)
   - Default tab when workspace opens
   - "🚀 Open Launcher" button
   - Friendly onboarding

3. **WorkspaceDock** (FlexLayout-based)
   - Tab-based layout system
   - Drag to split views
   - Floating windows
   - Layout persistence

4. **WorkspaceShell** (Container)
   - Header with controls
   - Layout management
   - FDC3 provider
   - Tray integration

### ✅ Newly Added (Window Docking System)

The new window docking system is **supplementary** to the existing tab-based system:

- **Workspace.tsx** - Alternative windowing container
- **DesktopWindow.tsx** - Free-floating windows with snap behavior
- **DockingManager.ts** - Snap logic
- **DockingOverlay.tsx** - Visual feedback
- **WindowDockingDemo.tsx** - Standalone demo

**Usage:** Can be used alongside or as alternative to WorkspaceDock.

---

## How They Work Together

### Typical User Flow (Desktop App)

```
1. User launches FinDesktop
2. WorkspaceShell renders
3. Welcome tab shows: "Welcome to the Workspace"
4. User clicks "🚀 Open Launcher"
5. Launcher modal appears with app grid
6. User clicks "Market Data" app
7. New tab opens with Market Data app
8. User can:
   - Open more apps via Launcher
   - Drag tabs to split views
   - Save layout
   - Minimize to tray
   - Use FDC3 interop between apps
```

### Marketing Website Flow (Separate)

```
1. Visitor arrives at website
2. Sees feature cards and demos
3. Clicks "Try Demo" buttons
4. May see embedded demos or videos
5. Can download/install desktop app
6. Reads documentation
```

---

## Key Takeaway

**Desktop Application** (this codebase):
- ✅ Keep Launcher
- ✅ Keep Welcome page
- ✅ Keep WorkspaceDock
- ✅ Keep WorkspaceShell
- ✅ New window docking is supplementary

**Marketing Website** (separate project):
- 🌐 External public-facing site
- 🌐 Feature showcases
- 🌐 Documentation hosting
- 🌐 Not part of this codebase

---

## Files to Preserve

**Never remove these:**
- `src/workspace/WorkspaceShell.tsx` - Main container
- `src/workspace/WorkspaceDock.tsx` - Tab system with Welcome page
- `src/features/launcher/Launcher.tsx` - App launcher
- All existing workspace infrastructure

**New additions (keep):**
- `src/workspace/Workspace.tsx` - Alternative windowing
- `src/workspace/DesktopWindow.tsx` - Window component
- `src/workspace/DockingManager.ts` - Snap logic
- `src/workspace/DockingOverlay.tsx` - Visual feedback
- All documentation files

---

## Summary

The FinDesktop desktop application already has everything it needs:
- ✅ Launcher is integrated
- ✅ Welcome page is the default tab
- ✅ WorkspaceDock manages tabs
- ✅ New window docking system is supplementary

The marketing website in your screenshot is a **separate project** for online visitors to learn about the product.
