/**
 * Channel Types
 * 
 * Type definitions for the FinDesktop Channels API.
 * Provides Finsemble-style named, colored channels for inter-app communication.
 */

/**
 * Channel Configuration
 * 
 * Defines the static configuration for a channel.
 * This is what app developers define in their config file.
 */
export type ChannelConfig = {
  /** Unique channel identifier (e.g., "red", "green", "orders") */
  id: string;
  /** Display name shown in UI (e.g., "Red", "Orders Channel") */
  name: string;
  /** CSS color for visual identification (e.g., "#ff4d4f", "rgb(255, 77, 79)") */
  color: string;
};

/**
 * Channel
 * 
 * Runtime representation of a channel.
 * Currently identical to ChannelConfig, but kept separate to allow
 * future extensions (e.g., tracking member count, last activity, etc.)
 */
export type Channel = ChannelConfig;

/**
 * Channel Broadcast Event
 * 
 * Payload sent when a message is broadcast to a channel.
 */
export interface ChannelBroadcastEvent {
  /** ID of the channel receiving the broadcast */
  channelId: string;
  /** Target window ID (recipient) */
  windowId: string;
  /** Context/data being broadcast */
  context: any;
  /** Optional sender information */
  sender?: {
    windowId: string;
    appId?: string;
  };
  /** Timestamp of the broadcast */
  timestamp?: number;
}

/**
 * Channel Joined Event
 * 
 * Payload sent when a window joins a channel.
 */
export interface ChannelJoinedEvent {
  /** Window that joined */
  windowId: string;
  /** Channel that was joined */
  channelId: string;
  /** Timestamp of the join */
  timestamp?: number;
}

/**
 * Channel Left Event
 * 
 * Payload sent when a window leaves a channel.
 */
export interface ChannelLeftEvent {
  /** Window that left */
  windowId: string;
  /** Channel that was left */
  channelId: string;
  /** Timestamp of the leave */
  timestamp?: number;
}
