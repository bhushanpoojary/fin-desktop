const { contextBridge, ipcRenderer } = require('electron');

// In-memory subscribers map: topic -> array of handler functions
const subscribers = new Map();

// Listen for bus messages from the main process
ipcRenderer.on("bus-message", (event, topic, payload) => {
  const handlers = subscribers.get(topic);
  if (handlers) {
    handlers.forEach(handler => handler(payload));
  }
});

// Create the API object
const api = {
  openApp(appId) {
    return ipcRenderer.invoke("desktop-open-app", appId);
  },

  publish(topic, payload) {
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
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld("desktopApi", api);
