/**
 * Channel Context and Hooks
 * 
 * React context and hooks for easy integration of the Channels API.
 * 
 * ## Usage
 * 
 * ### 1. Wrap your app with ChannelProvider
 * 
 * ```tsx
 * import { ChannelProvider } from './core/channels/ChannelContext';
 * 
 * function App() {
 *   return (
 *     <ChannelProvider windowId="my-window-1">
 *       <YourApp />
 *     </ChannelProvider>
 *   );
 * }
 * ```
 * 
 * ### 2. Use the useChannels hook in components
 * 
 * ```tsx
 * import { useChannels } from './core/channels/ChannelContext';
 * 
 * function MyComponent() {
 *   const { 
 *     activeChannelId, 
 *     channels, 
 *     joinChannel, 
 *     broadcast 
 *   } = useChannels();
 * 
 *   const handleSendData = () => {
 *     if (activeChannelId) {
 *       broadcast(activeChannelId, { 
 *         type: "instrument", 
 *         id: { ticker: "AAPL" } 
 *       });
 *     }
 *   };
 * 
 *   return <button onClick={handleSendData}>Send Data</button>;
 * }
 * ```
 * 
 * ### 3. Listen for broadcasts
 * 
 * ```tsx
 * import { useChannelBroadcasts } from './core/channels/ChannelContext';
 * 
 * function InstrumentViewer() {
 *   useChannelBroadcasts((event) => {
 *     console.log('Received:', event.context);
 *     // Update your component state based on the broadcast
 *   });
 * 
 *   return <div>...</div>;
 * }
 * ```
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback,
  useRef,
  useMemo,
} from "react";
import { ChannelService, getChannelService } from "./ChannelService";
import type { 
  Channel, 
  ChannelBroadcastEvent 
} from "./ChannelTypes";

/**
 * Channel Context Value
 */
export interface ChannelContextValue {
  /** The ChannelService instance */
  channelService: ChannelService;
  
  /** The current window's ID */
  windowId: string;
  
  /** Currently active channel ID (null if not joined to any channel) */
  activeChannelId: string | null;
  
  /** All available channels */
  channels: Channel[];
  
  /** Join a channel */
  joinChannel: (channelId: string) => void;
  
  /** Leave the current channel */
  leaveChannel: () => void;
  
  /** Broadcast a message to a channel */
  broadcast: (channelId: string, context: any) => void;
  
  /** Get channel by ID */
  getChannel: (channelId: string) => Channel | undefined;
}

/**
 * Channel Context
 */
const ChannelContext = createContext<ChannelContextValue | null>(null);

/**
 * Props for ChannelProvider
 */
export interface ChannelProviderProps {
  /** Unique identifier for this window/app */
  windowId: string;
  
  /** Optional custom ChannelService instance */
  channelService?: ChannelService;
  
  /** Child components */
  children: React.ReactNode;
}

/**
 * ChannelProvider Component
 * 
 * Provides channel context to child components.
 * Manages the active channel state and provides convenience methods.
 */
export const ChannelProvider: React.FC<ChannelProviderProps> = ({
  windowId,
  channelService: customChannelService,
  children,
}) => {
  // Use provided service or get/create shared instance
  const channelService = useMemo(
    () => customChannelService || getChannelService(),
    [customChannelService]
  );

  // Track active channel
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    () => channelService.getWindowChannel(windowId) || null
  );

  // Get all channels
  const channels = useMemo(
    () => channelService.getChannels(),
    [channelService]
  );

  /**
   * Join a channel
   */
  const joinChannel = useCallback(
    (channelId: string) => {
      try {
        channelService.joinChannel(windowId, channelId);
        setActiveChannelId(channelId);
      } catch (error) {
        console.error("[ChannelContext] Error joining channel:", error);
      }
    },
    [channelService, windowId]
  );

  /**
   * Leave current channel
   */
  const leaveChannel = useCallback(() => {
    try {
      channelService.leaveChannel(windowId);
      setActiveChannelId(null);
    } catch (error) {
      console.error("[ChannelContext] Error leaving channel:", error);
    }
  }, [channelService, windowId]);

  /**
   * Broadcast to a channel
   */
  const broadcast = useCallback(
    (channelId: string, context: any) => {
      try {
        channelService.broadcast(channelId, context, windowId);
      } catch (error) {
        console.error("[ChannelContext] Error broadcasting:", error);
      }
    },
    [channelService, windowId]
  );

  /**
   * Get channel by ID
   */
  const getChannel = useCallback(
    (channelId: string) => channelService.getChannel(channelId),
    [channelService]
  );

  // Subscribe to channel join events for this window
  useEffect(() => {
    const unsubscribe = channelService.subscribeToJoinEvents((event) => {
      if (event.windowId === windowId) {
        setActiveChannelId(event.channelId);
      }
    });

    return unsubscribe;
  }, [channelService, windowId]);

  // Subscribe to channel leave events for this window
  useEffect(() => {
    const unsubscribe = channelService.subscribeToLeaveEvents((event) => {
      if (event.windowId === windowId) {
        setActiveChannelId(null);
      }
    });

    return unsubscribe;
  }, [channelService, windowId]);

  // Cleanup on unmount - leave channel
  useEffect(() => {
    return () => {
      if (activeChannelId) {
        channelService.leaveChannel(windowId);
      }
    };
  }, [channelService, windowId, activeChannelId]);

  // Context value
  const value: ChannelContextValue = {
    channelService,
    windowId,
    activeChannelId,
    channels,
    joinChannel,
    leaveChannel,
    broadcast,
    getChannel,
  };

  return (
    <ChannelContext.Provider value={value}>
      {children}
    </ChannelContext.Provider>
  );
};

/**
 * useChannels Hook
 * 
 * Access the channel context.
 * Must be used within a ChannelProvider.
 * 
 * @throws Error if used outside of ChannelProvider
 */
export function useChannels(): ChannelContextValue {
  const context = useContext(ChannelContext);
  
  if (!context) {
    throw new Error("useChannels must be used within a ChannelProvider");
  }
  
  return context;
}

/**
 * useChannelBroadcasts Hook
 * 
 * Subscribe to channel broadcasts for the current window.
 * Automatically filters broadcasts to only those targeting this window.
 * 
 * @param handler - Callback function to handle broadcasts
 * @param deps - Optional dependency array (like useEffect)
 * 
 * @example
 * ```tsx
 * useChannelBroadcasts((event) => {
 *   console.log('Received on channel:', event.channelId);
 *   console.log('Context:', event.context);
 * });
 * ```
 */
export function useChannelBroadcasts(
  handler: (event: ChannelBroadcastEvent) => void,
  deps?: React.DependencyList
): void {
  const { channelService, windowId } = useChannels();
  
  // Use ref to avoid recreating subscription when handler changes
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const wrappedHandler = (event: ChannelBroadcastEvent) => {
      handlerRef.current(event);
    };

    const unsubscribe = channelService.subscribeToBroadcasts(
      windowId,
      wrappedHandler
    );

    return unsubscribe;
  }, [channelService, windowId]);
}

/**
 * useActiveChannel Hook
 * 
 * Get the currently active channel object (not just the ID).
 * Returns null if not joined to any channel.
 * 
 * @example
 * ```tsx
 * const activeChannel = useActiveChannel();
 * 
 * return (
 *   <div>
 *     {activeChannel ? (
 *       <div style={{ color: activeChannel.color }}>
 *         On {activeChannel.name}
 *       </div>
 *     ) : (
 *       <div>Not on any channel</div>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useActiveChannel(): Channel | null {
  const { activeChannelId, getChannel } = useChannels();
  
  return useMemo(() => {
    if (!activeChannelId) return null;
    return getChannel(activeChannelId) || null;
  }, [activeChannelId, getChannel]);
}

/**
 * useChannelMembers Hook
 * 
 * Get the list of window IDs that are members of a specific channel.
 * Useful for showing who else is on the same channel.
 * 
 * @param channelId - The channel to get members for
 * @returns Array of window IDs
 * 
 * @example
 * ```tsx
 * const members = useChannelMembers('red');
 * return <div>{members.length} windows on Red channel</div>;
 * ```
 */
export function useChannelMembers(channelId: string | null): string[] {
  const { channelService } = useChannels();
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!channelId) {
      setMembers([]);
      return;
    }

    // Get initial members
    const updateMembers = () => {
      setMembers(channelService.getChannelMembers(channelId));
    };

    updateMembers();

    // Subscribe to join/leave events to update members
    const unsubscribeJoin = channelService.subscribeToJoinEvents((event) => {
      if (event.channelId === channelId) {
        updateMembers();
      }
    });

    const unsubscribeLeave = channelService.subscribeToLeaveEvents((event) => {
      if (event.channelId === channelId) {
        updateMembers();
      }
    });

    return () => {
      unsubscribeJoin();
      unsubscribeLeave();
    };
  }, [channelService, channelId]);

  return members;
}
