/**
 * DesktopWindow - Movable and Resizable Window Component
 * 
 * A window component that can be dragged, resized, and positioned within a workspace.
 * Supports the docking system via drag callbacks.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { WindowLayout } from './DockingManager';

export interface DesktopWindowProps {
  /**
   * Window layout information
   */
  layout: WindowLayout;

  /**
   * Callback when window is being dragged
   */
  onDrag?: (id: string, x: number, y: number) => void;

  /**
   * Callback when drag ends
   */
  onDragEnd?: (id: string) => void;

  /**
   * Callback when window is being resized
   */
  onResize?: (id: string, width: number, height: number) => void;

  /**
   * Callback when window is clicked (for activation)
   */
  onClick?: (id: string) => void;

  /**
   * Window title
   */
  title?: string;

  /**
   * Window content
   */
  children?: React.ReactNode;

  /**
   * Minimum width
   */
  minWidth?: number;

  /**
   * Minimum height
   */
  minHeight?: number;
}

type ResizeHandle = 
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'
  | null;

/**
 * DesktopWindow component
 * 
 * Renders a draggable, resizable window with a title bar.
 */
export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  layout,
  onDrag,
  onDragEnd,
  onResize,
  onClick,
  title = 'Window',
  children,
  minWidth = 200,
  minHeight = 150,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const dragStartRef = useRef({ x: 0, y: 0, windowX: 0, windowY: 0 });
  const resizeStartRef = useRef({ 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0, 
    windowX: 0, 
    windowY: 0 
  });

  // Handle title bar drag start
  const handleTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle left click
    if (e.button !== 0) return;

    // Don't drag if clicking on buttons
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      windowX: layout.x,
      windowY: layout.y,
    };

    // Activate window on drag
    onClick?.(layout.id);
  }, [layout.id, layout.x, layout.y, onClick]);

  // Handle resize handle mouse down
  const handleResizeMouseDown = useCallback(
    (handle: ResizeHandle) => (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setResizeHandle(handle);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: layout.width,
        height: layout.height,
        windowX: layout.x,
        windowY: layout.y,
      };

      onClick?.(layout.id);
    },
    [layout.id, layout.x, layout.y, layout.width, layout.height, onClick]
  );

  // Handle mouse move (both drag and resize)
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        const newX = dragStartRef.current.windowX + deltaX;
        const newY = dragStartRef.current.windowY + deltaY;

        onDrag?.(layout.id, newX, newY);
      } else if (isResizing && resizeHandle) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;

        let newWidth = resizeStartRef.current.width;
        let newHeight = resizeStartRef.current.height;
        let newX = resizeStartRef.current.windowX;
        let newY = resizeStartRef.current.windowY;

        // Calculate new dimensions based on handle
        if (resizeHandle.includes('right')) {
          newWidth = Math.max(minWidth, resizeStartRef.current.width + deltaX);
        }
        if (resizeHandle.includes('left')) {
          newWidth = Math.max(minWidth, resizeStartRef.current.width - deltaX);
          if (newWidth > minWidth) {
            newX = resizeStartRef.current.windowX + deltaX;
          }
        }
        if (resizeHandle.includes('bottom')) {
          newHeight = Math.max(minHeight, resizeStartRef.current.height + deltaY);
        }
        if (resizeHandle.includes('top')) {
          newHeight = Math.max(minHeight, resizeStartRef.current.height - deltaY);
          if (newHeight > minHeight) {
            newY = resizeStartRef.current.windowY + deltaY;
          }
        }

        // Apply resize (position change handled via onDrag if needed)
        onResize?.(layout.id, newWidth, newHeight);
        if (newX !== resizeStartRef.current.windowX || newY !== resizeStartRef.current.windowY) {
          onDrag?.(layout.id, newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.(layout.id);
      }
      if (isResizing) {
        setIsResizing(false);
        setResizeHandle(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    resizeHandle,
    layout.id,
    minWidth,
    minHeight,
    onDrag,
    onDragEnd,
    onResize,
  ]);

  // Window styles
  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${layout.x}px`,
    top: `${layout.y}px`,
    width: `${layout.width}px`,
    height: `${layout.height}px`,
    backgroundColor: 'var(--theme-bg-primary, #1a1a1a)',
    border: layout.isActive 
      ? '2px solid var(--theme-primary, #667eea)' 
      : '1px solid var(--theme-border-primary, #333)',
    borderRadius: '8px',
    boxShadow: layout.isActive
      ? '0 8px 32px rgba(102, 126, 234, 0.3)'
      : '0 4px 16px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: layout.isActive ? 1000 : 100,
    transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s ease',
    cursor: isDragging ? 'grabbing' : 'default',
  };

  const titleBarStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: layout.isActive 
      ? 'var(--theme-primary, #667eea)' 
      : 'var(--theme-bg-secondary, #2a2a2a)',
    color: layout.isActive ? '#fff' : 'var(--theme-text-secondary, #999)',
    borderBottom: '1px solid var(--theme-border-primary, #333)',
    cursor: 'grab',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
    backgroundColor: 'var(--theme-bg-primary, #1a1a1a)',
  };

  // Resize handle component
  const ResizeHandleComponent: React.FC<{ 
    position: ResizeHandle; 
    cursor: string 
  }> = ({ position, cursor }) => (
    <div
      onMouseDown={handleResizeMouseDown(position)}
      style={{
        position: 'absolute',
        ...getResizeHandlePosition(position),
        cursor,
        zIndex: 10,
      }}
    />
  );

  return (
    <div
      ref={windowRef}
      style={windowStyle}
      onClick={() => onClick?.(layout.id)}
    >
      {/* Title bar */}
      <div 
        style={titleBarStyle} 
        onMouseDown={handleTitleBarMouseDown}
      >
        <span>{title}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Could implement minimize
            }}
            style={windowButtonStyle}
          >
            −
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Could implement maximize
            }}
            style={windowButtonStyle}
          >
            □
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Could implement close
            }}
            style={{ ...windowButtonStyle, color: '#ef4444' }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>{children}</div>

      {/* Resize handles */}
      <ResizeHandleComponent position="top-left" cursor="nwse-resize" />
      <ResizeHandleComponent position="top" cursor="ns-resize" />
      <ResizeHandleComponent position="top-right" cursor="nesw-resize" />
      <ResizeHandleComponent position="left" cursor="ew-resize" />
      <ResizeHandleComponent position="right" cursor="ew-resize" />
      <ResizeHandleComponent position="bottom-left" cursor="nesw-resize" />
      <ResizeHandleComponent position="bottom" cursor="ns-resize" />
      <ResizeHandleComponent position="bottom-right" cursor="nwse-resize" />
    </div>
  );
};

// Helper to get resize handle positions
function getResizeHandlePosition(position: ResizeHandle): React.CSSProperties {
  const size = 8;
  const corner = 12;

  switch (position) {
    case 'top-left':
      return { top: 0, left: 0, width: corner, height: corner };
    case 'top':
      return { top: 0, left: corner, right: corner, height: size };
    case 'top-right':
      return { top: 0, right: 0, width: corner, height: corner };
    case 'left':
      return { top: corner, bottom: corner, left: 0, width: size };
    case 'right':
      return { top: corner, bottom: corner, right: 0, width: size };
    case 'bottom-left':
      return { bottom: 0, left: 0, width: corner, height: corner };
    case 'bottom':
      return { bottom: 0, left: corner, right: corner, height: size };
    case 'bottom-right':
      return { bottom: 0, right: 0, width: corner, height: corner };
    default:
      return {};
  }
}

// Window button style
const windowButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '0 4px',
  lineHeight: 1,
  opacity: 0.7,
  transition: 'opacity 0.2s',
};
