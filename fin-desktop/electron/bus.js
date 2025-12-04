const { BrowserWindow, ipcMain } = require('electron');

/**
 * Sets up the global message bus handlers for IPC communication.
 * Allows renderer processes to publish messages that are broadcast to all windows.
 */
function setupBusHandlers() {
  ipcMain.on('bus-publish', (event, { topic, payload }) => {
    // Broadcast the message to all renderer windows
    BrowserWindow.getAllWindows().forEach(win => {
      // Avoid echoing the message back to the sender
      if (win.webContents.id !== event.sender.id) {
        win.webContents.send('bus-message', topic, payload);
      }
    });
  });
}

module.exports = { setupBusHandlers };
