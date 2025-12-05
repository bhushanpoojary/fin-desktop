/**
 * ChannelService
 * 
 * Core service for managing Finsemble-style inter-app communication channels.
 * 
 * ## Responsibilities
 * 
 * 1. Load channel definitions from configuration
 * 2. Track which windows are joined to which channels
 * 3. Broadcast messages scoped to specific channels
 * 4. Integrate with the desktop event bus for publish/subscribe
 * 
 * ## Architecture
 * 
 * - Uses window.desktopApi (from preload) for publish/subscribe
 * - Maintains a windowId -> channelId mapping
 * - Broadcasts use topics like "CHANNEL_BROADCAST" with channelId filtering
 * 
 * ## Usage
 * 
 * ```ts
 * const channelService = new ChannelService();
 * 
 * // Window A joins "red" channel
 * channelService.joinChannel("window-1", "red");
 * 
 * // Window B joins "red" channel
 * channelService.joinChannel("window-2", "red");
 * 
 * // Broadcast to all windows on "red" channel
 * channelService.broadcast("red", { type: "instrument", id: { ticker: "AAPL" } });
 * 
 * // Window A leaves the channel
 * channelService.leaveChannel("window-1");
 * ```
 */

import { channelConfig } from "../../config/channels.config";
import type { 
  Channel, 
  ChannelBroadcastEvent,
  ChannelJoinedEvent,
  ChannelLeftEvent 
} from "./ChannelTypes";

/**
 * Channel event topic names
 */
export const CHANNEL_EVENTS = {
  /** Fired when a window joins a channel */
  CHANNEL_JOINED: "CHANNEL_JOINED",
  /** Fired when a window leaves a channel */
  CHANNEL_LEFT: "CHANNEL_LEFT",
  /** Fired when a message is broadcast to a channel */
  CHANNEL_BROADCAST: "CHANNEL_BROADCAST",
} as const;

/**
 * ChannelService
 * 
 * Manages channel membership and broadcasts for the FinDesktop application.
 */
export class ChannelService {
  /** Available channels loaded from config */
  private channels: Channel[];
  
  /** Map of windowId -> channelId tracking which windows are on which channels */
  private windowChannelMap = new Map<string, string>();
  
  /** Reference to the desktop API for event bus access */
  private desktopApi: typeof window.desktopApi;
  
  /** In-memory subscribers for same-window communication */
  private inMemorySubscribers = new Map<string, Set<(event: ChannelBroadcastEvent) => void>>();

  /**
   * Create a new ChannelService
   * 
   * @param desktopApi - The desktop API instance (usually window.desktopApi)
   */
  constructor(desktopApi: typeof window.desktopApi = window.desktopApi) {
    this.channels = [...channelConfig];
    this.desktopApi = desktopApi;
    
    console.log(
      `[ChannelService] Initialized with ${this.channels.length} channels:`,
      this.channels.map((ch) => ch.id).join(", ")
    );
  }

  /**
   * Get all available channels
   */
  getChannels(): Channel[] {
    return this.channels;
  }

  /**
   * Get a channel by ID
   */
  getChannel(channelId: string): Channel | undefined {
    return this.channels.find((ch) => ch.id === channelId);
  }

  /**
   * Get the channel that a window is currently joined to
   * 
   * @param windowId - The window identifier
   * @returns The channel ID, or undefined if not joined to any channel
   */
  getWindowChannel(windowId: string): string | undefined {
    return this.windowChannelMap.get(windowId);
  }

  /**
   * Get all windows joined to a specific channel
   * 
   * @param channelId - The channel identifier
   * @returns Array of window IDs
   */
  getChannelMembers(channelId: string): string[] {
    const members: string[] = [];
    for (const [windowId, joinedChannelId] of this.windowChannelMap.entries()) {
      if (joinedChannelId === channelId) {
        members.push(windowId);
      }
    }
    return members;
  }

  /**
   * Join a window to a channel
   * 
   * If the window is already on a different channel, it will be moved.
   * 
   * @param windowId - The window identifier
   * @param channelId - The channel to join
   * @throws Error if channel doesn't exist
   */
  joinChannel(windowId: string, channelId: string): void {
    // Validate channel exists
    const channel = this.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    // If already on this channel, no-op
    const currentChannel = this.windowChannelMap.get(windowId);
    if (currentChannel === channelId) {
      console.log(`[ChannelService] Window ${windowId} already on channel ${channelId}`);
      return;
    }

    // Leave previous channel if any
    if (currentChannel) {
      this.leaveChannel(windowId);
    }

    // Join new channel
    this.windowChannelMap.set(windowId, channelId);
    
    console.log(`[ChannelService] Window ${windowId} joined channel ${channelId}`);
    console.log(`[ChannelService] Current mappings:`, Array.from(this.windowChannelMap.entries()));

    // Publish join event
    const event: ChannelJoinedEvent = {
      windowId,
      channelId,
      timestamp: Date.now(),
    };
    
    this.desktopApi.publish(CHANNEL_EVENTS.CHANNEL_JOINED, event);
  }

  /**
   * Remove a window from its current channel
   * 
   * @param windowId - The window identifier
   */
  leaveChannel(windowId: string): void {
    const previousChannel = this.windowChannelMap.get(windowId);
    
    if (!previousChannel) {
      console.log(`[ChannelService] Window ${windowId} not on any channel`);
      return;
    }

    // Remove from map
    this.windowChannelMap.delete(windowId);
    
    console.log(`[ChannelService] Window ${windowId} left channel ${previousChannel}`);

    // Publish leave event
    const event: ChannelLeftEvent = {
      windowId,
      channelId: previousChannel,
      timestamp: Date.now(),
    };
    
    this.desktopApi.publish(CHANNEL_EVENTS.CHANNEL_LEFT, event);
  }

  /**
   * Broadcast a context/message to all windows on a specific channel
   * 
   * Only windows that have joined the channel will receive the broadcast.
   * 
   * @param channelId - The channel to broadcast to
   * @param context - The data/context to broadcast
   * @param senderId - Optional identifier of the sender window
   */
  broadcast(channelId: string, context: any, senderId?: string): void {
    // Validate channel exists
    const channel = this.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    // Find all windows on this channel
    const targetWindowIds = this.getChannelMembers(channelId);

    console.log(`[ChannelService] broadcast() called:`, {
      channelId,
      senderId,
      targetWindowIds,
      allMappings: Array.from(this.windowChannelMap.entries()),
    });

    if (targetWindowIds.length === 0) {
      console.warn(`[ChannelService] No windows on channel ${channelId} to broadcast to`);
      return;
    }

    console.log(
      `[ChannelService] Broadcasting to channel ${channelId} (${targetWindowIds.length} windows):`,
      targetWindowIds
    );

    // Publish broadcast event for each target window
    // The consuming app will filter by their windowId
    for (const windowId of targetWindowIds) {
      const event: ChannelBroadcastEvent = {
        channelId,
        windowId,
        context,
        sender: senderId ? { windowId: senderId } : undefined,
        timestamp: Date.now(),
      };

      console.log(`[ChannelService] Publishing to window ${windowId}:`, event);
      this.desktopApi.publish(CHANNEL_EVENTS.CHANNEL_BROADCAST, event);
    }
  }

  /**
   * Subscribe to broadcasts on a specific channel for a specific window
   * 
   * The handler will only be called for broadcasts targeting this window.
   * Uses both IPC and in-memory subscriptions to work within same window.
   * 
   * @param windowId - The window that is subscribing
   * @param handler - Callback function for broadcast events
   * @returns Unsubscribe function
   */
  subscribeToBroadcasts(
    windowId: string,
    handler: (event: ChannelBroadcastEvent) => void
  ): () => void {
    // 1. Add to in-memory subscribers (for same-window communication)
    if (!this.inMemorySubscribers.has(windowId)) {
      this.inMemorySubscribers.set(windowId, new Set());
    }
    this.inMemorySubscribers.get(windowId)!.add(handler);
    
    // 2. Subscribe to IPC broadcasts (for cross-window communication)
    const wrappedHandler = (event: any) => {
      // Type guard and filter
      if (event && event.windowId === windowId) {
        handler(event as ChannelBroadcastEvent);
      }
    };

    const unsubscribe = this.desktopApi.subscribe(
      CHANNEL_EVENTS.CHANNEL_BROADCAST,
      wrappedHandler
    );

    console.log(`[ChannelService] Window ${windowId} subscribed to broadcasts (IPC + in-memory)`);

    return () => {
      // Remove from in-memory subscribers
      const subscribers = this.inMemorySubscribers.get(windowId);
      if (subscribers) {
        subscribers.delete(handler);
        if (subscribers.size === 0) {
          this.inMemorySubscribers.delete(windowId);
        }
      }
      
      // Unsubscribe from IPC
      unsubscribe();
      console.log(`[ChannelService] Window ${windowId} unsubscribed from broadcasts`);
    };
  }

  /**
   * Subscribe to channel join/leave events
   * 
   * Useful for updating UI when channels change.
   * 
   * @param handler - Callback for join events
   * @returns Unsubscribe function
   */
  subscribeToJoinEvents(handler: (event: ChannelJoinedEvent) => void): () => void {
    return this.desktopApi.subscribe(CHANNEL_EVENTS.CHANNEL_JOINED, handler);
  }

  /**
   * Subscribe to channel leave events
   * 
   * @param handler - Callback for leave events
   * @returns Unsubscribe function
   */
  subscribeToLeaveEvents(handler: (event: ChannelLeftEvent) => void): () => void {
    return this.desktopApi.subscribe(CHANNEL_EVENTS.CHANNEL_LEFT, handler);
  }

  /**
   * Cleanup method - removes all window mappings
   * 
   * Call this when shutting down the service.
   */
  cleanup(): void {
    console.log(`[ChannelService] Cleaning up ${this.windowChannelMap.size} window mappings`);
    this.windowChannelMap.clear();
  }
}

/**
 * Singleton instance for convenience
 * 
 * You can use this directly or create your own instance.
 */
let sharedInstance: ChannelService | null = null;

/**
 * Get or create the shared ChannelService instance
 */
export function getChannelService(): ChannelService {
  if (!sharedInstance) {
    sharedInstance = new ChannelService();
  }
  return sharedInstance;
}

/**
 * Reset the shared instance (useful for testing)
 */
export function resetChannelService(): void {
  if (sharedInstance) {
    sharedInstance.cleanup();
  }
  sharedInstance = null;
}
