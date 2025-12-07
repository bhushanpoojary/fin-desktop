/**
 * WindowDockingDemo - Demonstration Application
 * 
 * Shows the complete window docking system in action.
 * Demonstrates edge snapping, window-to-window snapping, and visual feedback.
 */

import React from 'react';
import { Workspace } from './Workspace';
import type { WindowLayout } from './DockingManager';

/**
 * Demo app showing window docking functionality
 */
export const WindowDockingDemo: React.FC = () => {
  // Set up initial windows
  const initialWindows: WindowLayout[] = [
    {
      id: 'window-1',
      x: 50,
      y: 50,
      width: 400,
      height: 300,
      isActive: true,
    },
    {
      id: 'window-2',
      x: 500,
      y: 100,
      width: 350,
      height: 250,
      isActive: false,
    },
  ];

  // Manage windows state locally
  const [windows, setWindows] = React.useState<WindowLayout[]>(initialWindows);

  const addWindow = (newWindow: WindowLayout) => {
    setWindows(prev => [...prev, { ...newWindow, isActive: false }]);
  };

  const removeWindow = React.useCallback((id: string) => {
    console.log('Removing window:', id);
    setWindows(prev => {
      const filtered = prev.filter(w => w.id !== id);
      console.log('Windows before:', prev.length, 'Windows after:', filtered.length);
      return filtered;
    });
  }, []);

  // Add a new window at a random position
  const handleAddWindow = React.useCallback(() => {
    const id = `window-${Date.now()}`;
    const randomX = Math.floor(Math.random() * 300) + 100;
    const randomY = Math.floor(Math.random() * 200) + 100;

    addWindow({
      id,
      x: randomX,
      y: randomY,
      width: 320,
      height: 240,
    });
  }, []);

  // Custom content renderer for demo windows
  const renderWindowContent = React.useCallback((windowId: string) => {
    const windowNumber = windowId.split('-')[1];

    return (
      <div style={{ 
        color: 'var(--theme-text-primary, #fff)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--theme-primary, #667eea)' }}>
          Window {windowNumber}
        </h3>
        
        <div style={{ flex: 1, overflow: 'auto' }}>
          <section style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>🎯 Docking Features</h4>
            <ul style={{ fontSize: '13px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li><strong>Edge Snapping:</strong> Drag to workspace edges</li>
              <li><strong>Window Snapping:</strong> Drag near other windows</li>
              <li><strong>Visual Feedback:</strong> Ghost preview shows dock target</li>
              <li><strong>Magnetic Alignment:</strong> Auto-aligns within 16px</li>
            </ul>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>🎮 Try These Actions</h4>
            <ul style={{ fontSize: '13px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Drag me to the <strong>left edge</strong> → Half-screen left</li>
              <li>Drag me to the <strong>right edge</strong> → Half-screen right</li>
              <li>Drag me to the <strong>top edge</strong> → Half-screen top</li>
              <li>Drag me to the <strong>bottom edge</strong> → Half-screen bottom</li>
              <li>Drag me near another window → Snap together</li>
              <li>Drag me over another window → Center dock</li>
            </ul>
          </section>

          <section>
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>⚡ Resize</h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
              Grab any edge or corner to resize this window.
            </p>
          </section>
        </div>

        <div style={{ 
          marginTop: '16px', 
          paddingTop: '12px', 
          borderTop: '1px solid var(--theme-border-primary, #333)' 
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Button clicked for window:', windowId);
              removeWindow(windowId);
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              position: 'relative',
              zIndex: 10,
            }}
          >
            Close This Window
          </button>
        </div>
      </div>
    );
  }, [removeWindow]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--theme-bg-primary, #0a0a0a)',
    }}>
      {/* Header with controls */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'var(--theme-bg-secondary, #1a1a1a)',
        borderBottom: '1px solid var(--theme-border-primary, #333)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            color: 'var(--theme-primary, #667eea)',
            fontWeight: '700',
          }}>
            🪟 FinDesktop Window Docking Demo
          </h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '13px', 
            color: 'var(--theme-text-secondary, #999)' 
          }}>
            Drag windows to see magnetic snapping and docking behavior
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAddWindow}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--theme-primary, #667eea)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
            }}
          >
            + Add Window
          </button>
          
          <button
            onClick={() => setWindows([])}
            disabled={windows.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: windows.length === 0 ? '#444' : '#ef4444',
              color: windows.length === 0 ? '#666' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: windows.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: windows.length === 0 ? 0.5 : 1,
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Workspace area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Workspace
          windows={windows}
          onWindowsChange={setWindows}
          snapThreshold={16}
          renderWindowContent={renderWindowContent}
        />
      </div>

      {/* Footer with instructions */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: 'var(--theme-bg-secondary, #1a1a1a)',
        borderTop: '1px solid var(--theme-border-primary, #333)',
        fontSize: '12px',
        color: 'var(--theme-text-secondary, #999)',
        display: 'flex',
        gap: '24px',
        justifyContent: 'center',
      }}>
        <span>💡 <strong>Tip:</strong> Snap threshold is 16 pixels</span>
        <span>🎨 <strong>Colors:</strong> Blue (H/V edges) • Green (T/B edges) • Purple (center)</span>
        <span>📊 <strong>Windows:</strong> {windows.length} active</span>
      </div>
    </div>
  );
};

export default WindowDockingDemo;
