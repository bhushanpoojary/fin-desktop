/**
 * AppTitleBar Component
 * 
 * Title bar with integrated channel selector dropdown.
 * Shows the selected channel color as a visual indicator.
 * 
 * Features:
 * - Channel dropdown on click
 * - Color indicator showing active channel
 * - App title
 * - Clean, minimal design
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChannels, useActiveChannel } from '../core/channels';

export interface AppTitleBarProps {
  /** Application title to display */
  title: string;
  
  /** Window ID for channel management */
  windowId: string;
  
  /** Optional subtitle/description */
  subtitle?: string;
  
  /** Additional class name */
  className?: string;
}

/**
 * AppTitleBar Component
 * 
 * Displays app title with channel selector dropdown
 */
export const AppTitleBar: React.FC<AppTitleBarProps> = ({
  title,
  windowId,
  subtitle,
  className = '',
}) => {
  const { channels, activeChannelId, joinChannel, leaveChannel } = useChannels();
  const activeChannel = useActiveChannel();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleChannelSelect = (channelId: string) => {
    console.log(`[AppTitleBar] handleChannelSelect called:`, {
      windowId,
      selectedChannelId: channelId,
      currentActiveChannelId: activeChannelId,
    });

    if (channelId === activeChannelId) {
      // Toggle off - leave channel
      console.log(`[AppTitleBar] Leaving channel ${channelId}`);
      leaveChannel();
    } else {
      // Join new channel
      console.log(`[AppTitleBar] Joining channel ${channelId}`);
      joinChannel(channelId);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className={`fd-app-titlebar ${className}`} style={styles.titleBar}>
      {/* Left side - App title */}
      <div style={styles.titleSection}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      {/* Right side - Channel selector */}
      <div style={styles.channelSection} ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            ...styles.channelButton,
            borderColor: activeChannel?.color || '#4A5568',
          }}
          title={activeChannel ? `${activeChannel.name} Channel` : 'Select Channel'}
        >
          {/* Color indicator */}
          <div
            style={{
              ...styles.colorIndicator,
              backgroundColor: activeChannel?.color || '#4A5568',
            }}
          />
          
          {/* Channel name or prompt */}
          <span style={styles.channelName}>
            {activeChannel ? activeChannel.name : 'Select Channel'}
          </span>
          
          {/* Dropdown arrow */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            style={{
              ...styles.dropdownArrow,
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path
              d="M2 4 L6 8 L10 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div style={styles.dropdown}>
            {channels.map((channel) => {
              const isActive = channel.id === activeChannelId;
              
              return (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel.id)}
                  style={{
                    ...styles.dropdownItem,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  }}
                >
                  {/* Color circle */}
                  <div
                    style={{
                      ...styles.dropdownCircle,
                      backgroundColor: channel.color,
                    }}
                  >
                    {isActive && (
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: '16px',
                          height: '16px',
                          fill: 'white',
                        }}
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Channel name */}
                  <span style={styles.dropdownLabel}>{channel.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Styles for the title bar
 */
const styles = {
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'var(--theme-bg-secondary)',
    borderBottom: '1px solid var(--theme-border-primary)',
    minHeight: '60px',
  } as React.CSSProperties,

  titleSection: {
    flex: 1,
  } as React.CSSProperties,

  title: {
    margin: 0,
    fontSize: 'var(--theme-font-size-xl)',
    fontWeight: 'var(--theme-font-weight-bold)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    color: 'var(--theme-primary)',
  } as React.CSSProperties,

  subtitle: {
    margin: '4px 0 0',
    color: 'var(--theme-text-secondary)',
    fontSize: 'var(--theme-font-size-sm)',
  } as React.CSSProperties,

  channelSection: {
    position: 'relative' as const,
  } as React.CSSProperties,

  channelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'var(--theme-bg-primary)',
    border: '2px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: 'var(--theme-font-size-sm)',
    fontWeight: 'var(--theme-font-weight-medium)',
    color: 'var(--theme-text-primary)',
    transition: 'all 0.2s ease',
    minWidth: '150px',
  } as React.CSSProperties,

  colorIndicator: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    flexShrink: 0,
  } as React.CSSProperties,

  channelName: {
    flex: 1,
    textAlign: 'left' as const,
  } as React.CSSProperties,

  dropdownArrow: {
    transition: 'transform 0.2s ease',
    color: 'var(--theme-text-secondary)',
  } as React.CSSProperties,

  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 4px)',
    right: 0,
    minWidth: '200px',
    background: '#1A202C',
    border: '1px solid var(--theme-border-primary)',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    overflow: 'hidden',
  } as React.CSSProperties,

  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--theme-font-size-sm)',
    color: 'var(--theme-text-primary)',
    textAlign: 'left' as const,
    transition: 'background-color 0.15s ease',
  } as React.CSSProperties,

  dropdownCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,

  dropdownLabel: {
    flex: 1,
  } as React.CSSProperties,
};
