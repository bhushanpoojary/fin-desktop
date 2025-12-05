/**
 * ChannelPicker Component
 * 
 * UI component for selecting and displaying the active channel.
 * Shows channels as colored pill buttons in a horizontal list.
 * 
 * ## Features
 * 
 * - Visual pills with channel colors
 * - Active state highlighting
 * - "None" option to leave channels
 * - Integrates with ChannelService
 * 
 * ## Usage
 * 
 * ```tsx
 * import { ChannelPicker } from './ui/ChannelPicker';
 * import { getChannelService } from './core/channels/ChannelService';
 * 
 * function MyApp() {
 *   const [activeChannel, setActiveChannel] = useState<string | null>(null);
 *   const channelService = getChannelService();
 *   const windowId = "window-1"; // Get from your app context
 * 
 *   return (
 *     <ChannelPicker
 *       windowId={windowId}
 *       channelService={channelService}
 *       activeChannelId={activeChannel}
 *       onChannelChanged={setActiveChannel}
 *     />
 *   );
 * }
 * ```
 */

import React, { useMemo } from "react";
import { ChannelService } from "../core/channels/ChannelService";
import type { Channel } from "../core/channels/ChannelTypes";

/**
 * Props for ChannelPicker component
 */
export interface ChannelPickerProps {
  /** Unique identifier for the current window/app */
  windowId: string;
  
  /** ChannelService instance to use for channel operations */
  channelService: ChannelService;
  
  /** Currently active channel ID (optional - for controlled mode) */
  activeChannelId?: string | null;
  
  /** Callback when channel changes (optional) */
  onChannelChanged?: (channelId: string | null) => void;
  
  /** Show labels on pills (default: true) */
  showLabels?: boolean;
  
  /** Size variant (default: "medium") */
  size?: "small" | "medium" | "large";
  
  /** Custom CSS class name */
  className?: string;
}

/**
 * ChannelPicker Component
 * 
 * Displays available channels as colored circles with labels (Finsemble-style).
 */
export const ChannelPicker: React.FC<ChannelPickerProps> = ({
  windowId,
  channelService,
  activeChannelId,
  onChannelChanged,
  showLabels = true,
  size = "medium",
  className = "",
}) => {
  // Get channels from service
  const channels = useMemo<Channel[]>(
    () => channelService.getChannels(),
    [channelService]
  );

  /**
   * Handle channel selection
   */
  const handleSelect = (channelId: string) => {
    try {
      channelService.joinChannel(windowId, channelId);
      onChannelChanged?.(channelId);
    } catch (error) {
      console.error("[ChannelPicker] Error joining channel:", error);
    }
  };

  // Size-based styling
  const sizeConfig = {
    small: { circleSize: 24, fontSize: 12, padding: "6px 12px" },
    medium: { circleSize: 32, fontSize: 14, padding: "8px 16px" },
    large: { circleSize: 40, fontSize: 16, padding: "10px 20px" },
  };

  const currentSize = sizeConfig[size];

  return (
    <div className={`fd-channel-picker ${className}`} style={styles.container}>
      <div className="fd-channel-list" style={styles.channelList}>
        {channels.map((ch) => {
          const isActive = ch.id === activeChannelId;
          
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => handleSelect(ch.id)}
              className={`fd-channel-item ${isActive ? "active" : ""}`}
              title={`${ch.name} Channel - Click to ${isActive ? 'leave' : 'join'}`}
              style={{
                ...styles.channelItem,
                padding: currentSize.padding,
                backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
              }}
            >
              <div
                className="fd-channel-circle"
                style={{
                  ...styles.channelCircle,
                  backgroundColor: ch.color,
                  width: currentSize.circleSize,
                  height: currentSize.circleSize,
                }}
              >
                {isActive && (
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      width: currentSize.circleSize * 0.6,
                      height: currentSize.circleSize * 0.6,
                      fill: "white",
                    }}
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
              {showLabels && (
                <span
                  className="fd-channel-label"
                  style={{
                    ...styles.channelLabel,
                    fontSize: currentSize.fontSize,
                  }}
                >
                  {ch.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Inline styles for the ChannelPicker
 * 
 * These provide the base styling. Apps can override with CSS classes.
 */
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,

  channelList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0,
  } as React.CSSProperties,

  channelItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    width: "100%",
    textAlign: "left" as const,
  } as React.CSSProperties,

  channelCircle: {
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "transform 0.2s ease",
  } as React.CSSProperties,

  channelLabel: {
    color: "#ffffff",
    fontWeight: 400,
    fontFamily: "system-ui, -apple-system, sans-serif",
    userSelect: "none" as const,
  } as React.CSSProperties,
};

/**
 * ChannelPicker with Dropdown variant
 * 
 * Alternative implementation using a select dropdown instead of pills.
 * Use this if you have many channels or limited horizontal space.
 */
export const ChannelPickerDropdown: React.FC<ChannelPickerProps> = ({
  windowId,
  channelService,
  activeChannelId,
  onChannelChanged,
  className = "",
}) => {
  const channels = useMemo<Channel[]>(
    () => channelService.getChannels(),
    [channelService]
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    
    if (value === "") {
      // Clear/leave channel
      channelService.leaveChannel(windowId);
      onChannelChanged?.(null);
    } else {
      // Join selected channel
      try {
        channelService.joinChannel(windowId, value);
        onChannelChanged?.(value);
      } catch (error) {
        console.error("[ChannelPicker] Error joining channel:", error);
      }
    }
  };

  // Find active channel for color indicator
  const activeChannel = channels.find((ch) => ch.id === activeChannelId);

  return (
    <div className={`fd-channel-picker-dropdown ${className}`} style={dropdownStyles.container}>
      {activeChannel && (
        <div
          className="fd-channel-indicator"
          style={{
            ...dropdownStyles.indicator,
            backgroundColor: activeChannel.color,
          }}
          title={`${activeChannel.name} Channel`}
        />
      )}
      
      <select
        value={activeChannelId || ""}
        onChange={handleChange}
        className="fd-channel-select"
        style={dropdownStyles.select}
      >
        <option value="">No Channel</option>
        {channels.map((ch) => (
          <option key={ch.id} value={ch.id}>
            {ch.name}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Styles for dropdown variant
 */
const dropdownStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,

  indicator: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "1px solid rgba(0, 0, 0, 0.1)",
  } as React.CSSProperties,

  select: {
    padding: "4px 8px",
    fontSize: "13px",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    outline: "none",
  } as React.CSSProperties,
};
