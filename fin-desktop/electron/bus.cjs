const { BrowserWindow, ipcMain } = require('electron');

/**
 * Sets up the global message bus handlers for IPC communication.
 * Allows renderer processes to publish messages that are broadcast to all windows.
 */
function setupBusHandlers() {
  ipcMain.on('bus-publish', (event, { topic, payload }) => {
    const allWindows = BrowserWindow.getAllWindows();
    console.log(`[bus.cjs] Received bus-publish:`, {
      topic,
      payload,
      senderId: event.sender.id,
      totalWindows: allWindows.length,
    });

    // Broadcast the message to all renderer windows
    let broadcastCount = 0;
    allWindows.forEach(win => {
      // Avoid echoing the message back to the sender
      if (win.webContents.id !== event.sender.id) {
        console.log(`[bus.cjs] Sending to window ${win.webContents.id}`);
        win.webContents.send('bus-message', topic, payload);
        broadcastCount++;
      }
    });
    
    console.log(`[bus.cjs] Broadcasted to ${broadcastCount} windows (excluded sender)`);
  });
}

module.exports = { setupBusHandlers };
