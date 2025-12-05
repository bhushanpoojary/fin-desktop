/**
 * Channels Configuration
 * 
 * ⚠️ CUSTOMER CONFIGURATION FILE ⚠️
 * 
 * This is where app developers define their inter-app communication channels.
 * 
 * ## How to Customize
 * 
 * 1. Add/remove/edit entries in the `channelConfig` array below
 * 2. Each channel needs: `id`, `name`, and `color`
 * 3. DO NOT modify core channel logic in src/core/channels
 * 
 * ## Channel Colors
 * 
 * Use any valid CSS color:
 * - Hex: "#ff4d4f"
 * - RGB: "rgb(255, 77, 79)"
 * - Named: "red", "blue", etc.
 * 
 * ## Best Practices
 * 
 * - Use descriptive IDs for business channels (e.g., "orders", "positions")
 * - Use color names for generic channels (e.g., "red", "green")
 * - Choose distinct colors for easy visual identification
 * - Keep channel count manageable (5-10 channels is typical)
 * 
 * ## Examples
 * 
 * ```ts
 * // Generic color-based channels
 * { id: "red", name: "Red", color: "#ff4d4f" }
 * 
 * // Business-specific channels
 * { id: "orders", name: "Order Desk", color: "#faad14" }
 * { id: "positions", name: "Positions", color: "#13c2c2" }
 * 
 * // Team channels
 * { id: "trading-desk-1", name: "Trading Desk 1", color: "#722ed1" }
 * ```
 */

import type { ChannelConfig } from "../core/channels/ChannelTypes";

/**
 * Default FinDesktop Channels
 * 
 * These are the standard Finsemble-style color channels.
 * Modify this array to define your own channels.
 */
export const channelConfig: ChannelConfig[] = [
  {
    id: "group1",
    name: "Group 1",
    color: "#9575CD", // Purple
  },
  {
    id: "group2",
    name: "Group 2",
    color: "#FFD54F", // Yellow
  },
  {
    id: "group3",
    name: "Group 3",
    color: "#66BB6A", // Green
  },
  {
    id: "group4",
    name: "Group 4",
    color: "#EF5350", // Red
  },
  {
    id: "group5",
    name: "Group 5",
    color: "#42A5F5", // Blue
  },
  {
    id: "group6",
    name: "Group 6",
    color: "#FFA726", // Orange
  },
  
  // Examples of custom channels you can add:
  // {
  //   id: "orders",
  //   name: "Orders",
  //   color: "#13c2c2",
  // },
  // {
  //   id: "positions",
  //   name: "Positions",
  //   color: "#eb2f96",
  // },
  // {
  //   id: "trading-desk-1",
  //   name: "Trading Desk 1",
  //   color: "#2f54eb",
  // },
];

/**
 * Get all configured channels
 */
export function getChannelConfig(): ChannelConfig[] {
  return channelConfig;
}

/**
 * Get a specific channel by ID
 */
export function getChannelById(id: string): ChannelConfig | undefined {
  return channelConfig.find((ch) => ch.id === id);
}

/**
 * Validate channel configuration
 * Throws if configuration is invalid
 */
export function validateChannelConfig(): void {
  const ids = new Set<string>();
  
  for (const channel of channelConfig) {
    // Check for required fields
    if (!channel.id || !channel.name || !channel.color) {
      throw new Error(
        `Invalid channel configuration: Missing required fields (id, name, color) in channel: ${JSON.stringify(channel)}`
      );
    }
    
    // Check for duplicate IDs
    if (ids.has(channel.id)) {
      throw new Error(`Duplicate channel ID found: ${channel.id}`);
    }
    ids.add(channel.id);
    
    // Validate ID format (alphanumeric, hyphens, underscores)
    if (!/^[a-z0-9_-]+$/i.test(channel.id)) {
      throw new Error(
        `Invalid channel ID "${channel.id}": Must contain only letters, numbers, hyphens, and underscores`
      );
    }
  }
  
  console.log(`[ChannelConfig] Validated ${channelConfig.length} channels`);
}
