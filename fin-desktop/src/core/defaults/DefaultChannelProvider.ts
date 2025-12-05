/**
 * DefaultChannelProvider
 * 
 * Default implementation of IChannelProvider for FinDesktop.
 * This provides basic inter-app communication channels.
 * 
 * Customers can extend or replace this with their own implementation.
 */

import type { IChannelProvider, Channel, ChannelContext } from '../interfaces/IChannelProvider';

export class DefaultChannelProvider implements IChannelProvider {
  private channels: Map<string, Channel> = new Map();
  private currentChannelId: string | null = null;
  private subscriptions: Map<string, Set<(context: ChannelContext) => void>> = new Map();

  async initialize(): Promise<void> {
    console.log('DefaultChannelProvider initialized');
    
    // Create default system channels
    await this.createChannel('global');
    await this.createChannel('red');
    await this.createChannel('green');
    await this.createChannel('blue');
    await this.createChannel('yellow');
  }

  async createChannel(channelId: string): Promise<Channel> {
    const channel: Channel = {
      id: channelId,
      name: channelId,
      type: channelId === 'global' ? 'system' : 'user',
      displayName: channelId.charAt(0).toUpperCase() + channelId.slice(1),
      color: this.getChannelColor(channelId),
      memberCount: 0,
    };

    this.channels.set(channelId, channel);
    this.subscriptions.set(channelId, new Set());
    console.log('Channel created:', channelId);

    return channel;
  }

  getChannel(channelId: string): Channel | null {
    return this.channels.get(channelId) || null;
  }

  getAllChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  async joinChannel(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.currentChannelId = channelId;
      channel.memberCount = (channel.memberCount || 0) + 1;
      console.log('Joined channel:', channelId);
    } else {
      throw new Error(`Channel not found: ${channelId}`);
    }
  }

  async leaveChannel(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.memberCount = Math.max(0, (channel.memberCount || 0) - 1);
      if (this.currentChannelId === channelId) {
        this.currentChannelId = null;
      }
      console.log('Left channel:', channelId);
    }
  }

  getCurrentChannel(): Channel | null {
    if (this.currentChannelId) {
      return this.channels.get(this.currentChannelId) || null;
    }
    return null;
  }

  async broadcast(channelId: string, context: ChannelContext): Promise<void> {
    const listeners = this.subscriptions.get(channelId);
    if (listeners) {
      const enrichedContext: ChannelContext = {
        ...context,
        timestamp: context.timestamp || Date.now(),
      };

      console.log(`Broadcasting to channel ${channelId}:`, enrichedContext.type);

      // Notify all subscribers
      listeners.forEach((listener) => {
        try {
          listener(enrichedContext);
        } catch (error) {
          console.error('Error in channel listener:', error);
        }
      });
    }
  }

  subscribe(
    channelId: string,
    listener: (context: ChannelContext) => void
  ): () => void {
    let listeners = this.subscriptions.get(channelId);
    if (!listeners) {
      listeners = new Set();
      this.subscriptions.set(channelId, listeners);
    }

    listeners.add(listener);
    console.log(`Subscribed to channel: ${channelId}`);

    // Return unsubscribe function
    return () => {
      listeners?.delete(listener);
      console.log(`Unsubscribed from channel: ${channelId}`);
    };
  }

  private getChannelColor(channelId: string): string {
    const colors: Record<string, string> = {
      global: '#6c757d',
      red: '#ff0000',
      green: '#00ff00',
      blue: '#0000ff',
      yellow: '#ffff00',
    };
    return colors[channelId] || '#6c757d';
  }
}
