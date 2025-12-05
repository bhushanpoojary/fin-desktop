/**
 * Practical Integration Guide
 * 
 * This guide shows how to add Channels API to your existing FinDesktop apps.
 * Follow these steps to enable channel-based communication.
 * 
 * ⚠️ NOTE: This is a guide file meant for reference.
 * Import paths assume this code is moved to your app's location.
 * The imports below may show errors in this location - that's expected.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck - Guide file, imports will work when copied to app location

import React from 'react';
import { 
  ChannelProvider, 
  useChannels, 
  useChannelBroadcasts,
  ChannelBroadcastEvent,
} from '../core/channels';
import { ChannelPicker } from '../ui';

/**
 * STEP 1: Modify Your App Shell
 * ────────────────────────────────────────────────────────────────────
 * 
 * Wrap your main app component with ChannelProvider.
 * This is typically done in your app's entry point or shell.
 */

// Before (your existing AppShell)
export function AppShellBefore({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Header />
      <main>{children}</main>
    </div>
  );
}

// After (with ChannelProvider)
export function AppShellAfter({ children }: { children: React.ReactNode }) {
  // Get windowId from your app context
  // This could come from:
  // - URL query params: new URLSearchParams(window.location.search).get('windowId')
  // - Window name: window.name
  // - Generated: crypto.randomUUID() or similar
  const windowId = getWindowId();
  
  return (
    <ChannelProvider windowId={windowId}>
      <div className="app-shell">
        <Header />
        <main>{children}</main>
      </div>
    </ChannelProvider>
  );
}

/**
 * STEP 2: Add Channel Picker to Your Header/Toolbar
 * ────────────────────────────────────────────────────────────────────
 * 
 * Add the ChannelPicker component to your app's toolbar or header.
 */

// Before
function HeaderBefore() {
  return (
    <header className="app-header">
      <div className="app-title">My Trading App</div>
      <div className="app-actions">
        <button>Settings</button>
      </div>
    </header>
  );
}

// After (with ChannelPicker)
function HeaderAfter() {
  const { activeChannelId, channelService } = useChannels();
  const windowId = getWindowId();
  
  return (
    <header className="app-header">
      <div className="app-title">My Trading App</div>
      
      {/* Add ChannelPicker */}
      <ChannelPicker
        windowId={windowId}
        channelService={channelService}
        activeChannelId={activeChannelId}
        size="medium"
      />
      
      <div className="app-actions">
        <button>Settings</button>
      </div>
    </header>
  );
}

/**
 * STEP 3: Broadcasting Data (Source App)
 * ────────────────────────────────────────────────────────────────────
 * 
 * Modify components that should SEND data on channels.
 * Example: An instrument picker that broadcasts the selected instrument.
 */

// Before
function InstrumentPickerBefore() {
  const [selected, setSelected] = React.useState<string | null>(null);
  
  const handleSelect = (ticker: string) => {
    setSelected(ticker);
    // Maybe update local state only
  };
  
  return (
    <div>
      <button onClick={() => handleSelect('AAPL')}>AAPL</button>
      <button onClick={() => handleSelect('MSFT')}>MSFT</button>
    </div>
  );
}

// After (with channel broadcasting)
function InstrumentPickerAfter() {
  const [selected, setSelected] = React.useState<string | null>(null);
  const { activeChannelId, broadcast } = useChannels();
  
  const handleSelect = (ticker: string) => {
    setSelected(ticker);
    
    // Broadcast to channel if one is active
    if (activeChannelId) {
      broadcast(activeChannelId, {
        type: 'fdc3.instrument',
        name: ticker,
        id: { ticker },
      });
    }
  };
  
  return (
    <div>
      <button onClick={() => handleSelect('AAPL')}>AAPL</button>
      <button onClick={() => handleSelect('MSFT')}>MSFT</button>
      
      {/* Optional: Show channel status */}
      {!activeChannelId && (
        <div className="warning">
          Select a channel to broadcast selections
        </div>
      )}
    </div>
  );
}

/**
 * STEP 4: Receiving Data (Target App)
 * ────────────────────────────────────────────────────────────────────
 * 
 * Modify components that should RECEIVE data from channels.
 * Example: A chart that updates when an instrument is broadcast.
 */

// Before
function InstrumentChartBefore() {
  const [ticker, setTicker] = React.useState('AAPL');
  
  // Maybe ticker is passed as prop or managed locally
  
  return (
    <div>
      <h2>Chart: {ticker}</h2>
      {/* Chart rendering */}
    </div>
  );
}

// After (with channel listening)
function InstrumentChartAfter() {
  const [ticker, setTicker] = React.useState('AAPL');
  
  // Subscribe to channel broadcasts
  useChannelBroadcasts((event) => {
    // Handle instrument contexts
    if (event.context.type === 'fdc3.instrument') {
      const newTicker = event.context.id.ticker;
      console.log(`[Chart] Received ${newTicker} from channel ${event.channelId}`);
      setTicker(newTicker);
    }
  });
  
  return (
    <div>
      <h2>Chart: {ticker}</h2>
      {/* Chart rendering */}
    </div>
  );
}

/**
 * STEP 5: Bidirectional Communication
 * ────────────────────────────────────────────────────────────────────
 * 
 * Some apps both send AND receive on channels.
 * Example: An order ticket that receives instrument context and sends back orders.
 */

function OrderTicket() {
  const [instrument, setInstrument] = React.useState<any>(null);
  const [quantity, setQuantity] = React.useState(100);
  const { activeChannelId, broadcast } = useChannels();
  
  // RECEIVE: Listen for instrument selections
  useChannelBroadcasts((event) => {
    if (event.context.type === 'fdc3.instrument') {
      setInstrument(event.context);
    }
  });
  
  // SEND: Broadcast order when placed
  const handlePlaceOrder = () => {
    if (!instrument || !activeChannelId) return;
    
    broadcast(activeChannelId, {
      type: 'fdc3.order',
      instrument: instrument.id,
      quantity,
      side: 'BUY',
    });
  };
  
  return (
    <div>
      <h2>Order Ticket</h2>
      <div>Instrument: {instrument?.name || 'None'}</div>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
      <button onClick={handlePlaceOrder}>Place Order</button>
    </div>
  );
}

/**
 * STEP 6: Handling Multiple Context Types
 * ────────────────────────────────────────────────────────────────────
 * 
 * Apps often need to handle different types of contexts.
 */

function MultiContextApp() {
  const [instrument, setInstrument] = React.useState<any>(null);
  const [contact, setContact] = React.useState<any>(null);
  
  useChannelBroadcasts((event) => {
    const { context } = event;
    
    // Route by context type
    switch (context.type) {
      case 'fdc3.instrument':
        setInstrument(context);
        break;
        
      case 'fdc3.contact':
        setContact(context);
        break;
        
      case 'fdc3.order':
        // Handle order context
        console.log('Order received:', context);
        break;
        
      default:
        console.log('Unknown context type:', context.type);
    }
  });
  
  return (
    <div>
      <div>Instrument: {instrument?.name || 'None'}</div>
      <div>Contact: {contact?.name || 'None'}</div>
    </div>
  );
}

/**
 * STEP 7: Getting Window ID
 * ────────────────────────────────────────────────────────────────────
 * 
 * Different strategies for obtaining a window ID.
 */

// Option 1: From URL query parameter
function getWindowIdFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('windowId') || generateWindowId();
}

// Option 2: From window name (set by Electron when creating window)
function getWindowIdFromWindowName(): string {
  return window.name || generateWindowId();
}

// Option 3: From Electron IPC
async function getWindowIdFromElectron(): Promise<string> {
  // If you have an electron API exposed
  if (window.desktopApi && (window.desktopApi as any).getWindowId) {
    return await (window.desktopApi as any).getWindowId();
  }
  return generateWindowId();
}

// Option 4: Generate unique ID
function generateWindowId(): string {
  // Using crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Recommended: Use a context provider for window ID
export const WindowContext = React.createContext<string>('');

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const windowId = React.useMemo(() => getWindowIdFromUrl(), []);
  
  return (
    <WindowContext.Provider value={windowId}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindowId(): string {
  return React.useContext(WindowContext);
}

// Then use in your app:
function getWindowId(): string {
  // In a real app, use useWindowId() hook
  return 'window-1';
}

/**
 * STEP 8: Complete Integration Example
 * ────────────────────────────────────────────────────────────────────
 * 
 * Putting it all together.
 */

export function CompleteApp() {
  return (
    <WindowProvider>
      <ChannelProviderWrapper>
        <AppShellAfter>
          <MainContent />
        </AppShellAfter>
      </ChannelProviderWrapper>
    </WindowProvider>
  );
}

function ChannelProviderWrapper({ children }: { children: React.ReactNode }) {
  const windowId = useWindowId();
  
  return (
    <ChannelProvider windowId={windowId}>
      {children}
    </ChannelProvider>
  );
}

function MainContent() {
  // Your app's main content
  return (
    <div>
      <InstrumentPickerAfter />
      <InstrumentChartAfter />
      <OrderTicket />
    </div>
  );
}

/**
 * STEP 9: Optional - Custom Channel Colors in UI
 * ────────────────────────────────────────────────────────────────────
 * 
 * Show channel color in your app's UI
 */

function AppWithChannelColor() {
  const activeChannel = useChannels().channels.find(
    ch => ch.id === useChannels().activeChannelId
  );
  
  return (
    <div 
      style={{
        borderTop: activeChannel 
          ? `3px solid ${activeChannel.color}` 
          : 'none'
      }}
    >
      {/* Your app content */}
    </div>
  );
}

/**
 * STEP 10: Testing Your Integration
 * ────────────────────────────────────────────────────────────────────
 * 
 * 1. Open multiple instances of your app
 * 2. Set them to the same channel (e.g., "Red")
 * 3. Send data from one app
 * 4. Verify other apps receive it
 * 5. Change channel on one app
 * 6. Verify it no longer receives broadcasts from the old channel
 */

/**
 * Common Patterns and Tips
 * ────────────────────────────────────────────────────────────────────
 * 
 * ✅ DO:
 * - Check if activeChannelId exists before broadcasting
 * - Use FDC3 context types for standard data (instrument, contact, etc.)
 * - Show visual indication of active channel (color, name)
 * - Handle missing/unknown context types gracefully
 * - Clean up subscriptions when components unmount (hooks do this automatically)
 * 
 * ❌ DON'T:
 * - Broadcast to channels the window hasn't joined
 * - Assume data will always be received (users might be on different channels)
 * - Hard-code channel IDs in your app (use channel config)
 * - Forget to handle the "no active channel" state
 */
