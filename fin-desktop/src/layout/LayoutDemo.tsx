import { useState, useEffect } from "react";
import { useActiveLayout } from "./useActiveLayout";
import { LayoutManagerFactory } from "./LayoutManagerFactory";
import type { SavedLayout } from "./types";

/**
 * Demo component to test layout persistence.
 * This simulates saving/loading window positions and states.
 */
export function LayoutDemo() {
  const { activeLayout, isLoading, error, saveCurrentLayout, setActiveLayoutId } = useActiveLayout();
  const [allLayouts, setAllLayouts] = useState<SavedLayout[]>([]);
  const [windowState, setWindowState] = useState({
    position: { x: 100, y: 100 },
    size: { width: 800, height: 600 },
    color: "#667eea",
  });

  // Load all available layouts
  useEffect(() => {
    const loadLayouts = async () => {
      const manager = LayoutManagerFactory.create();
      const layouts = await manager.getAllLayouts();
      setAllLayouts(layouts);
    };
    void loadLayouts();
  }, [activeLayout]);

  // Restore window state from active layout
  useEffect(() => {
    if (activeLayout?.data) {
      const data = activeLayout.data as typeof windowState;
      if (data.position && data.size && data.color) {
        setWindowState(data);
      }
    }
  }, [activeLayout]);

  const handleSaveLayout = async () => {
    console.log("handleSaveLayout called");
    const layoutName = prompt("Enter layout name:", activeLayout?.name || "My Layout");
    if (!layoutName) {
      console.log("No layout name provided, canceling save");
      return;
    }

    try {
      console.log("Saving layout:", layoutName, windowState);
      const savedLayout = await saveCurrentLayout(layoutName, windowState);
      console.log("Layout saved successfully:", savedLayout);
      
      // Reload the layouts list after saving
      const manager = LayoutManagerFactory.create();
      const layouts = await manager.getAllLayouts();
      console.log("Reloaded layouts:", layouts);
      setAllLayouts(layouts);
      alert(`Layout "${layoutName}" saved! It will restore on next launch.`);
    } catch (err) {
      console.error("Error saving layout:", err);
      alert(`Error saving layout: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSwitchLayout = async (layoutId: string) => {
    try {
      await setActiveLayoutId(layoutId);
      // Reload the layouts list after switching
      const manager = LayoutManagerFactory.create();
      const layouts = await manager.getAllLayouts();
      setAllLayouts(layouts);
    } catch (err) {
      alert(`Error switching layout: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteLayout = async (layoutId: string) => {
    if (!confirm("Delete this layout?")) return;
    try {
      const manager = LayoutManagerFactory.create();
      await manager.deleteLayout(layoutId);
      const layouts = await manager.getAllLayouts();
      setAllLayouts(layouts);
    } catch (err) {
      alert(`Error deleting layout: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleCreateDefaultLayout = async () => {
    try {
      await saveCurrentLayout("Default Layout", {
        position: { x: 100, y: 100 },
        size: { width: 800, height: 600 },
        color: "#667eea",
      });
      // Reload the layouts list after creating
      const manager = LayoutManagerFactory.create();
      const layouts = await manager.getAllLayouts();
      setAllLayouts(layouts);
    } catch (err) {
      alert(`Error creating layout: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading layout...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Layout Manager Demo</h1>
      
      {error && (
        <div style={{ padding: "10px", background: "#fee", color: "#c00", borderRadius: "4px", marginBottom: "20px" }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h2>Current Layout: {activeLayout?.name || "None"}</h2>
        {activeLayout && (
          <div style={{ fontSize: "14px", color: "#666" }}>
            <div>ID: {activeLayout.id}</div>
            <div>Created: {new Date(activeLayout.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(activeLayout.updatedAt).toLocaleString()}</div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Simulated Window State</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}>
          Adjust these values and save. They will be restored when you switch back to this layout or reload the app!
        </p>
        
        <div style={{ 
          border: "2px solid #ccc", 
          borderRadius: "8px", 
          padding: "20px",
          background: windowState.color,
          width: `${windowState.size.width / 2}px`,
          height: `${windowState.size.height / 2}px`,
          position: "relative",
          marginBottom: "20px",
          color: "white",
        }}>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>Simulated Window</div>
          <div style={{ fontSize: "12px", marginTop: "10px" }}>
            Position: ({windowState.position.x}, {windowState.position.y})<br />
            Size: {windowState.size.width} × {windowState.size.height}
          </div>
        </div>

        <div style={{ display: "grid", gap: "10px", maxWidth: "400px" }}>
          <label>
            X Position: {windowState.position.x}
            <input 
              type="range" 
              min="0" 
              max="500" 
              value={windowState.position.x}
              onChange={(e) => setWindowState(s => ({ ...s, position: { ...s.position, x: parseInt(e.target.value) }}))}
              style={{ width: "100%", display: "block" }}
            />
          </label>

          <label>
            Y Position: {windowState.position.y}
            <input 
              type="range" 
              min="0" 
              max="500" 
              value={windowState.position.y}
              onChange={(e) => setWindowState(s => ({ ...s, position: { ...s.position, y: parseInt(e.target.value) }}))}
              style={{ width: "100%", display: "block" }}
            />
          </label>

          <label>
            Width: {windowState.size.width}
            <input 
              type="range" 
              min="400" 
              max="1200" 
              value={windowState.size.width}
              onChange={(e) => setWindowState(s => ({ ...s, size: { ...s.size, width: parseInt(e.target.value) }}))}
              style={{ width: "100%", display: "block" }}
            />
          </label>

          <label>
            Height: {windowState.size.height}
            <input 
              type="range" 
              min="300" 
              max="900" 
              value={windowState.size.height}
              onChange={(e) => setWindowState(s => ({ ...s, size: { ...s.size, height: parseInt(e.target.value) }}))}
              style={{ width: "100%", display: "block" }}
            />
          </label>

          <label>
            Color:
            <input 
              type="color" 
              value={windowState.color}
              onChange={(e) => setWindowState(s => ({ ...s, color: e.target.value }))}
              style={{ width: "100%", display: "block", height: "40px" }}
            />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <button 
          onClick={() => {
            console.log("Button clicked!");
            handleSaveLayout();
          }}
          style={{ 
            padding: "10px 20px", 
            background: "#667eea", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            marginRight: "10px",
          }}
        >
          💾 Save Current Layout
        </button>
        
        <button 
          onClick={() => {
            const name = `Quick Save ${Date.now()}`;
            console.log("Quick save clicked, name:", name);
            saveCurrentLayout(name, windowState).then((saved) => {
              console.log("Quick save completed:", saved);
              const manager = LayoutManagerFactory.create();
              manager.getAllLayouts().then(layouts => {
                console.log("Layouts after quick save:", layouts);
                setAllLayouts(layouts);
              });
              alert(`Layout "${name}" saved!`);
            }).catch(err => {
              console.error("Quick save error:", err);
              alert(`Error: ${err.message}`);
            });
          }}
          style={{ 
            padding: "10px 20px", 
            background: "#f59e0b", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            marginRight: "10px",
          }}
        >
          ⚡ Quick Save (No Prompt)
        </button>
        
        {!activeLayout && (
          <button 
            onClick={handleCreateDefaultLayout}
            style={{ 
              padding: "10px 20px", 
              background: "#48bb78", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ✨ Create Default Layout
          </button>
        )}
      </div>

      <div>
        <h2>All Saved Layouts ({allLayouts.length})</h2>
        {allLayouts.length === 0 ? (
          <p style={{ color: "#666" }}>No layouts saved yet. Create one using the button above!</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {allLayouts.map((layout) => (
              <div 
                key={layout.id}
                style={{ 
                  border: "1px solid #ccc", 
                  borderRadius: "8px", 
                  padding: "15px",
                  background: layout.id === activeLayout?.id ? "#f0f8ff" : "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {layout.name}
                    {layout.id === activeLayout?.id && " ✓"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                    Updated: {new Date(layout.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  {layout.id !== activeLayout?.id && (
                    <button
                      onClick={() => handleSwitchLayout(layout.id)}
                      style={{ 
                        padding: "8px 16px", 
                        background: "#667eea", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      Switch
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteLayout(layout.id)}
                    style={{ 
                      padding: "8px 16px", 
                      background: "#e53e3e", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "40px", padding: "20px", background: "#f7fafc", borderRadius: "8px" }}>
        <h3>Testing Instructions:</h3>
        <ol style={{ lineHeight: "1.8" }}>
          <li>Adjust the window state controls (position, size, color)</li>
          <li>Click "Save Current Layout" and give it a name</li>
          <li>Change the window state again</li>
          <li>Create another layout with a different name</li>
          <li><strong>Refresh the page (F5)</strong> - the last active layout should restore!</li>
          <li>Switch between layouts using the "Switch" button - state restores instantly</li>
          <li>The layout persists in localStorage, so it survives app restarts</li>
        </ol>
        
        <div style={{ marginTop: "20px", padding: "15px", background: "#fff3cd", borderRadius: "4px" }}>
          <strong>💡 Tip:</strong> Open Developer Tools → Application → Local Storage → 
          look for key <code>finDesktop.layoutStore.v1</code> to see the raw JSON data!
        </div>
      </div>
    </div>
  );
}
