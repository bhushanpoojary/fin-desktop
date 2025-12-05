/**
 * Channel Integration Example
 * 
 * This file demonstrates how to integrate the Channels API into your FinDesktop app.
 * Copy and adapt this code to your application structure.
 * 
 * ⚠️ NOTE: This is an example file meant for reference.
 * Import paths assume this code is moved to your app's location.
 * The imports below may show errors in this location - that's expected.
 * 
 * ## Integration Steps:
 * 
 * 1. Wrap your app with ChannelProvider
 * 2. Add ChannelPicker to your UI (typically in a header/toolbar)
 * 3. Use useChannels() to send data
 * 4. Use useChannelBroadcasts() to receive data
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck - Example file, imports will work when copied to app location

import React, { useState } from 'react';
import { 
  ChannelProvider, 
  useChannels, 
  useChannelBroadcasts,
  useActiveChannel,
  ChannelBroadcastEvent,
} from '../core/channels';
import { ChannelPicker } from '../ui';

/**
 * Example: Main App with Channel Integration
 * 
 * This wraps your entire app with the ChannelProvider.
 */
export function AppWithChannels() {
  // In a real app, get this from your window/app context
  const windowId = `window-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <ChannelProvider windowId={windowId}>
      <AppContent />
    </ChannelProvider>
  );
}

/**
 * Example: App Content with Channel Features
 */
function AppContent() {
  const { activeChannelId, channelService } = useChannels();
  
  // Get windowId from context (in a real app, this would come from your app state)
  const windowId = React.useMemo(
    () => `window-${Math.random().toString(36).substr(2, 9)}`,
    []
  );
  
  return (
    <div style={styles.app}>
      {/* Header with Channel Picker */}
      <header style={styles.header}>
        <h1>FinDesktop App</h1>
        
        {/* Channel Picker - shows colored pills */}
        <ChannelPicker
          windowId={windowId}
          channelService={channelService}
          activeChannelId={activeChannelId}
          size="medium"
          showLabels={true}
        />
      </header>
      
      {/* Main content area */}
      <main style={styles.main}>
        <InstrumentBroadcaster />
        <InstrumentReceiver />
      </main>
    </div>
  );
}

/**
 * Example: Component that SENDS data on channels
 */
function InstrumentBroadcaster() {
  const { activeChannelId, broadcast } = useChannels();
  const activeChannel = useActiveChannel();
  const [selectedTicker, setSelectedTicker] = useState('');
  
  const instruments = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];
  
  const handleBroadcast = (ticker: string) => {
    if (!activeChannelId) {
      alert('Please select a channel first');
      return;
    }
    
    setSelectedTicker(ticker);
    
    // Broadcast FDC3-style instrument context
    broadcast(activeChannelId, {
      type: 'fdc3.instrument',
      name: ticker,
      id: {
        ticker: ticker,
      },
    });
    
    console.log(`[Broadcaster] Sent ${ticker} on ${activeChannelId}`);
  };
  
  return (
    <div style={styles.card}>
      <h2>Instrument Broadcaster</h2>
      
      {activeChannel ? (
        <div style={styles.channelStatus}>
          <div
            style={{
              ...styles.channelIndicator,
              backgroundColor: activeChannel.color,
            }}
          />
          <span>Broadcasting on {activeChannel.name}</span>
        </div>
      ) : (
        <div style={styles.channelStatus}>
          <span>⚠️ Not on any channel - select one above</span>
        </div>
      )}
      
      <div style={styles.buttonGrid}>
        {instruments.map((ticker) => (
          <button
            key={ticker}
            onClick={() => handleBroadcast(ticker)}
            disabled={!activeChannelId}
            style={{
              ...styles.button,
              backgroundColor: selectedTicker === ticker ? '#1890ff' : '#f0f0f0',
              color: selectedTicker === ticker ? '#fff' : '#000',
            }}
          >
            {ticker}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Component that RECEIVES data from channels
 */
function InstrumentReceiver() {
  const [receivedInstruments, setReceivedInstruments] = useState<any[]>([]);
  const activeChannel = useActiveChannel();
  
  // Subscribe to channel broadcasts
  useChannelBroadcasts((event: ChannelBroadcastEvent) => {
    console.log('[Receiver] Got broadcast:', event);
    
    // Filter for instrument contexts
    if (event.context.type === 'fdc3.instrument') {
      setReceivedInstruments((prev) => [
        {
          ticker: event.context.id.ticker,
          channel: event.channelId,
          timestamp: event.timestamp || Date.now(),
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);
    }
  });
  
  return (
    <div style={styles.card}>
      <h2>Instrument Receiver</h2>
      
      {activeChannel ? (
        <div style={styles.channelStatus}>
          <div
            style={{
              ...styles.channelIndicator,
              backgroundColor: activeChannel.color,
            }}
          />
          <span>Listening on {activeChannel.name}</span>
        </div>
      ) : (
        <div style={styles.channelStatus}>
          <span>⚠️ Not on any channel - won't receive data</span>
        </div>
      )}
      
      <div style={styles.messageList}>
        <h3>Received Messages</h3>
        {receivedInstruments.length === 0 ? (
          <p style={styles.emptyState}>
            No messages received yet. Join a channel and wait for broadcasts.
          </p>
        ) : (
          <ul style={styles.list}>
            {receivedInstruments.map((msg, idx) => (
              <li key={idx} style={styles.listItem}>
                <strong>{msg.ticker}</strong>
                <span style={styles.meta}>
                  on {msg.channel} at {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Inline styles for the example
 */
const styles = {
  app: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #e8e8e8',
    backgroundColor: '#fafafa',
  },
  main: {
    flex: 1,
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    overflow: 'auto',
  },
  card: {
    padding: '24px',
    border: '1px solid #e8e8e8',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  channelStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  channelIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '8px',
  },
  button: {
    padding: '12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  messageList: {
    marginTop: '16px',
  },
  emptyState: {
    color: '#8c8c8c',
    fontStyle: 'italic',
    textAlign: 'center' as const,
    padding: '24px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: '12px',
    color: '#8c8c8c',
  },
};

/**
 * Alternative: Simpler integration without the full example UI
 */
export function SimpleChannelIntegration() {
  const windowId = 'my-window-1';
  
  return (
    <ChannelProvider windowId={windowId}>
      <YourExistingApp />
    </ChannelProvider>
  );
}

/**
 * Placeholder for your actual app
 */
function YourExistingApp() {
  const { broadcast } = useChannels();
  // Use broadcast() to send data when needed
  
  // Your app logic here
  // Use broadcast() to send data
  // Use useChannelBroadcasts() to receive data
  
  return <div>Your App Content</div>;
}

/**
 * Example: Manual ChannelService usage (without React)
 * 
 * Use this if you're not using React or need more control.
 */
export function manualChannelServiceExample() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ChannelService } = require('../core/channels/ChannelService');
  
  // Create service instance
  const channelService = new ChannelService();
  
  // Get available channels
  const channels = channelService.getChannels();
  console.log('Available channels:', channels);
  
  // Join a channel
  channelService.joinChannel('window-1', 'red');
  
  // Subscribe to broadcasts
  const unsubscribe = channelService.subscribeToBroadcasts('window-1', (event: any) => {
    console.log('Received broadcast:', event.context);
  });
  
  // Broadcast data
  channelService.broadcast('red', {
    type: 'fdc3.instrument',
    id: { ticker: 'AAPL' },
  }, 'window-1');
  
  // Cleanup
  unsubscribe();
  channelService.leaveChannel('window-1');
}
