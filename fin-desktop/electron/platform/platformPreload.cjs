// Preload for the Platform controller window. Exposes a minimal, safe `window.platform`
// bridge so the React control UI can drive the Platform runtime in the main process.

const { contextBridge, ipcRenderer } = require('electron');

const listeners = new Set();

ipcRenderer.on('platform:state', (_event, state) => {
  for (const listener of listeners) listener(state);
});

contextBridge.exposeInMainWorld('platform', {
  command: (cmd) => ipcRenderer.invoke('platform:command', cmd),
  getState: () => ipcRenderer.invoke('platform:getState'),
  onState: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
});
