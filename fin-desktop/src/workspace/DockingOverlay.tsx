/**
 * DockingOverlay - Visual Feedback Component
 * 
 * Renders a semi-transparent "ghost" preview showing where a window will dock.
 * Provides smooth visual feedback during drag operations.
 */

import React from 'react';
import type { DockingResult } from './DockingManager';

export interface DockingOverlayProps {
  /**
   * The docking preview to display, or null if no docking
   */
  preview: DockingResult | null;

  /**
   * The workspace container bounds (used for positioning)
   */
  workspaceRect: DOMRect | null;
}

/**
 * DockingOverlay component
 * 
 * Shows a highlighted ghost rectangle when a window is about to dock.
 * The overlay appears within the workspace coordinate system.
 */
export const DockingOverlay: React.FC<DockingOverlayProps> = ({
  preview,
  workspaceRect,
}) => {
  // Don't render if no preview or no workspace rect
  if (!preview || !workspaceRect) {
    return null;
  }

  // Get color based on dock position
  const getOverlayColor = (position?: string): string => {
    switch (position) {
      case 'left':
      case 'right':
        return 'rgba(59, 130, 246, 0.25)'; // Blue
      case 'top':
      case 'bottom':
        return 'rgba(16, 185, 129, 0.25)'; // Green
      case 'center':
        return 'rgba(139, 92, 246, 0.25)'; // Purple
      default:
        return 'rgba(107, 114, 128, 0.25)'; // Gray
    }
  };

  const getBorderColor = (position?: string): string => {
    switch (position) {
      case 'left':
      case 'right':
        return 'rgba(59, 130, 246, 0.6)';
      case 'top':
      case 'bottom':
        return 'rgba(16, 185, 129, 0.6)';
      case 'center':
        return 'rgba(139, 92, 246, 0.6)';
      default:
        return 'rgba(107, 114, 128, 0.6)';
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${preview.x}px`,
    top: `${preview.y}px`,
    width: `${preview.width}px`,
    height: `${preview.height}px`,
    backgroundColor: getOverlayColor(preview.dockPosition),
    border: `2px solid ${getBorderColor(preview.dockPosition)}`,
    borderRadius: '8px',
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'all 0.15s ease-out',
    boxShadow: `0 4px 20px ${getBorderColor(preview.dockPosition)}`,
  };

  // Label for the dock position
  const getDockLabel = (position?: string): string => {
    switch (position) {
      case 'left':
        return 'Dock Left';
      case 'right':
        return 'Dock Right';
      case 'top':
        return 'Dock Top';
      case 'bottom':
        return 'Dock Bottom';
      case 'center':
        return 'Dock Center';
      default:
        return 'Dock';
    }
  };

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: getBorderColor(preview.dockPosition),
    fontSize: '18px',
    fontWeight: '600',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    letterSpacing: '0.5px',
    pointerEvents: 'none',
    userSelect: 'none',
  };

  return (
    <div style={overlayStyle}>
      <div style={labelStyle}>
        {getDockLabel(preview.dockPosition)}
      </div>
    </div>
  );
};

/**
 * Simple CSS classes for smoother animations (optional enhancement)
 * Can be added to a separate CSS file if preferred
 */
export const dockingOverlayStyles = `
  .docking-overlay {
    animation: dockingFadeIn 0.15s ease-out;
  }

  @keyframes dockingFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .docking-overlay-pulse {
    animation: dockingPulse 1.5s ease-in-out infinite;
  }

  @keyframes dockingPulse {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }
`;
