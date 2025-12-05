/**
 * FDC3 Demo Component with Finsemble-Style Channels
 * 
 * This demonstrates the Finsemble-style channel picker integration.
 * Shows colored circles with Group names and checkmarks for active channel.
 */

import React, { useState } from 'react';
import { 
  ChannelProvider, 
  useChannels, 
  useChannelBroadcasts,
} from '../core/channels';
import type { ChannelBroadcastEvent } from '../core/channels';
import { ChannelPicker } from '../ui';

/**
 * FDC3 Demo Window with Channel Sidebar
 */
export function Fdc3DemoWindow() {
  const windowId = React.useMemo(() => `window-${Date.now()}`, []);
  
  return (
    <ChannelProvider windowId={windowId}>
      <div style={styles.window}>
        {/* Left sidebar with channel picker */}
        <aside style={styles.sidebar}>
          <ChannelSidebar windowId={windowId} />
        </aside>
        
        {/* Main content area */}
        <main style={styles.main}>
          <DemoContent />
        </main>
      </div>
    </ChannelProvider>
  );
}

/**
 * Channel Sidebar (like Finsemble)
 */
function ChannelSidebar({ windowId }: { windowId: string }) {
  const { activeChannelId, channelService } = useChannels();
  
  return (
    <div style={styles.channelSidebar}>
      <ChannelPicker
        windowId={windowId}
        channelService={channelService}
        activeChannelId={activeChannelId}
        size="medium"
        showLabels={true}
      />
    </div>
  );
}

/**
 * Demo Content Area
 */
function DemoContent() {
  const { activeChannelId, broadcast } = useChannels();
  const [lastReceived, setLastReceived] = useState<any>(null);
  
  // Listen for broadcasts
  useChannelBroadcasts((event: ChannelBroadcastEvent) => {
    setLastReceived(event.context);
  });
  
  // Send test instrument
  const handleSendInstrument = (ticker: string) => {
    if (!activeChannelId) {
      alert('Please select a channel first');
      return;
    }
    
    broadcast(activeChannelId, {
      type: 'fdc3.instrument',
      name: ticker,
      id: { ticker },
    });
  };
  
  return (
    <div style={styles.content}>
      <h1 style={styles.title}>Welcome to Finsemble!</h1>
      
      <div style={styles.logo}>
        {/* Finsemble logo placeholder */}
        <svg width="120" height="120" viewBox="0 0 120 120">
          <rect x="30" y="20" width="60" height="30" fill="#1E88E5" />
          <rect x="30" y="55" width="60" height="30" fill="#FFFFFF" />
          <rect x="30" y="70" width="60" height="30" fill="#1E88E5" />
        </svg>
      </div>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Channel Status</h2>
        {activeChannelId ? (
          <div style={styles.status}>
            Connected to <strong>{activeChannelId}</strong>
          </div>
        ) : (
          <div style={styles.statusInactive}>
            Not connected to any channel
          </div>
        )}
      </div>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Send Instrument</h2>
        <div style={styles.buttonGroup}>
          <button 
            style={styles.button}
            onClick={() => handleSendInstrument('AAPL')}
            disabled={!activeChannelId}
          >
            AAPL
          </button>
          <button 
            style={styles.button}
            onClick={() => handleSendInstrument('MSFT')}
            disabled={!activeChannelId}
          >
            MSFT
          </button>
          <button 
            style={styles.button}
            onClick={() => handleSendInstrument('GOOGL')}
            disabled={!activeChannelId}
          >
            GOOGL
          </button>
        </div>
      </div>
      
      {lastReceived && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Last Received</h2>
          <pre style={styles.code}>
            {JSON.stringify(lastReceived, null, 2)}
          </pre>
        </div>
      )}
      
      <button style={styles.launchButton}>
        Launch Docs
      </button>
    </div>
  );
}

/**
 * Styles matching Finsemble aesthetic
 */
const styles = {
  window: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#2D3748',
    color: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  
  sidebar: {
    width: '200px',
    backgroundColor: '#1A202C',
    borderRight: '1px solid #4A5568',
    padding: '16px 0',
  } as React.CSSProperties,
  
  channelSidebar: {
    // Channel picker will be inside here
  } as React.CSSProperties,
  
  main: {
    flex: 1,
    overflow: 'auto',
  } as React.CSSProperties,
  
  content: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,
  
  title: {
    fontSize: '48px',
    fontWeight: 300,
    textAlign: 'center' as const,
    marginBottom: '40px',
  } as React.CSSProperties,
  
  logo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
  } as React.CSSProperties,
  
  section: {
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: '#374151',
    borderRadius: '8px',
  } as React.CSSProperties,
  
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#E2E8F0',
  } as React.CSSProperties,
  
  status: {
    padding: '12px',
    backgroundColor: '#10B981',
    borderRadius: '4px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  
  statusInactive: {
    padding: '12px',
    backgroundColor: '#6B7280',
    borderRadius: '4px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,
  
  button: {
    padding: '12px 24px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  
  code: {
    backgroundColor: '#1F2937',
    padding: '16px',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '12px',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  
  launchButton: {
    width: '100%',
    padding: '16px 32px',
    backgroundColor: '#1E88E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 600,
    marginTop: '32px',
  } as React.CSSProperties,
};
