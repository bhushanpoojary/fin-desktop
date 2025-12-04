import { useEffect, useState, useCallback } from "react";
import type { SavedLayout } from "./types";
import { LayoutManagerFactory } from "./LayoutManagerFactory";

interface UseActiveLayoutState {
  activeLayout?: SavedLayout;
  isLoading: boolean;
  error?: string;
}

export function useActiveLayout() {
  const [state, setState] = useState<UseActiveLayoutState>({
    activeLayout: undefined,
    isLoading: true
  });

  useEffect(() => {
    const manager = LayoutManagerFactory.create();

    let cancelled = false;

    const load = async () => {
      try {
        const current = await manager.getActiveLayout();
        if (cancelled) return;

        // If no active layout, just keep undefined for now (or create default later)
        setState({
          activeLayout: current,
          isLoading: false
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          activeLayout: undefined,
          isLoading: false,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const setActiveLayoutId = useCallback(async (layoutId: string) => {
    const manager = LayoutManagerFactory.create();
    await manager.setActiveLayout(layoutId);
    const activeLayout = await manager.getActiveLayout();
    setState(prev => ({
      ...prev,
      activeLayout
    }));
  }, []);

  const saveCurrentLayout = useCallback(
    async (name: string, data: unknown) => {
      const manager = LayoutManagerFactory.create();
      const saved = await manager.saveLayout({ name, data });
      await manager.setActiveLayout(saved.id);
      setState({
        activeLayout: saved,
        isLoading: false
      });
      return saved;
    },
    []
  );

  return {
    activeLayout: state.activeLayout,
    isLoading: state.isLoading,
    error: state.error,
    setActiveLayoutId,
    saveCurrentLayout
  };
}
