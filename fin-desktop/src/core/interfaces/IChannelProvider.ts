/**
 * IChannelProvider Interface
 * 
 * Public extension contract – do not break without major version bump.
 * 
 * This interface defines the inter-app communication channel contract for FinDesktop.
 * Implement this interface to provide custom channel/messaging mechanisms.
 */

export interface IChannelProvider {
  /**
   * Initialize the channel provider
   */
  initialize(): Promise<void>;

  /**
   * Create a new channel
   * @param channelId Unique channel identifier
   */
  createChannel(channelId: string): Promise<Channel>;

  /**
   * Get an existing channel
   * @param channelId Channel identifier
   */
  getChannel(channelId: string): Channel | null;

  /**
   * Get all available channels
   */
  getAllChannels(): Channel[];

  /**
   * Join a channel
   * @param channelId Channel identifier
   */
  joinChannel(channelId: string): Promise<void>;

  /**
   * Leave a channel
   * @param channelId Channel identifier
   */
  leaveChannel(channelId: string): Promise<void>;

  /**
   * Get the current channel
   */
  getCurrentChannel(): Channel | null;

  /**
   * Broadcast a message to a channel
   * @param channelId Channel identifier
   * @param context Message context
   */
  broadcast(channelId: string, context: ChannelContext): Promise<void>;

  /**
   * Subscribe to channel messages
   * @param channelId Channel identifier
   * @param listener Message listener
   * @returns Unsubscribe function
   */
  subscribe(
    channelId: string,
    listener: (context: ChannelContext) => void
  ): () => void;
}

export interface Channel {
  id: string;
  name: string;
  type: 'app' | 'user' | 'system';
  displayName?: string;
  color?: string;
  memberCount?: number;
}

export interface ChannelContext {
  type: string;
  data: Record<string, any>;
  timestamp?: number;
  sender?: string;
}
