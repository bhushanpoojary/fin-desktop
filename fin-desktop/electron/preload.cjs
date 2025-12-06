const { contextBridge, ipcRenderer } = require('electron');

// In-memory subscribers map: topic -> array of handler functions
const subscribers = new Map();

// Listen for bus messages from the main process
ipcRenderer.on("bus-message", (event, topic, payload) => {
  console.log(`[preload] Received bus-message:`, { topic, payload });
  const handlers = subscribers.get(topic);
  if (handlers) {
    console.log(`[preload] Found ${handlers.length} handlers for topic ${topic}`);
    handlers.forEach(handler => handler(payload));
  } else {
    console.log(`[preload] No handlers registered for topic ${topic}`);
  }
});

// Create the API object
const api = {
  openApp(appId) {
    return ipcRenderer.invoke("desktop-open-app", appId);
  },

  publish(topic, payload) {
    console.log(`[preload] Publishing:`, { topic, payload });
    ipcRenderer.send("bus-publish", { topic, payload });
  },

  subscribe(topic, handler) {
    // Add handler to the subscribers map
    if (!subscribers.has(topic)) {
      subscribers.set(topic, []);
    }
    subscribers.get(topic).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = subscribers.get(topic);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        // Clean up empty arrays
        if (handlers.length === 0) {
          subscribers.delete(topic);
        }
      }
    };
  },

  // Tray API
  tray: {
    minimizeToTray() {
      ipcRenderer.send('tray-minimize');
    },
    restoreFromTray() {
      ipcRenderer.send('tray-restore');
    },
  },

  // FDC3 Intent API
  // The actual raiseIntent implementation will be provided by the renderer
  _fdc3RaiseIntentImpl: null,
  
  raiseIntent(intent, context) {
    if (!this._fdc3RaiseIntentImpl) {
      throw new Error('FDC3 intent system not initialized. Call setFdc3RaiseIntent first.');
    }
    return this._fdc3RaiseIntentImpl(intent, context);
  },

  // Allow the renderer to set the implementation
  setFdc3RaiseIntent(impl) {
    this._fdc3RaiseIntentImpl = impl;
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld("desktopApi", api);
