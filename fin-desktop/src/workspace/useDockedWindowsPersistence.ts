/**
 * useDockedWindowsPersistence - Hook for persisting docked windows to workspace layouts
 * 
 * Integrates the window docking system with the existing workspace persistence mechanism.
 * Saves/loads docked windows alongside FlexLayout tabs.
 */

import { useEffect, useCallback, useState } from 'react';
import type { WindowLayout } from './DockingManager';
import { LayoutManagerFactory } from '../layout/LayoutManagerFactory';

export interface ExtendedLayoutData {
  flexLayout?: unknown; // FlexLayout model JSON
  dockedWindows?: WindowLayout[]; // Our docked windows
}

export interface UseDockedWindowsPersistenceOptions {
  /**
   * Whether to auto-save on every change (default: true)
   */
  autoSave?: boolean;
  
  /**
   * Debounce delay in ms (default: 1000)
   */
  debounceMs?: number;
}

export function useDockedWindowsPersistence(
  windows: WindowLayout[],
  options: UseDockedWindowsPersistenceOptions = {}
) {
  const { autoSave = true, debounceMs = 1000 } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load docked windows from the active layout
   */
  const loadDockedWindows = useCallback(async (): Promise<WindowLayout[]> => {
    try {
      const manager = LayoutManagerFactory.create();
      const activeLayout = await manager.getActiveLayout();
      
      if (activeLayout?.data) {
        const layoutData = activeLayout.data as ExtendedLayoutData;
        return layoutData.dockedWindows || [];
      }
      
      return [];
    } catch (err) {
      console.error('Failed to load docked windows:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save docked windows to the active layout
   */
  const saveDockedWindows = useCallback(async (windowsToSave: WindowLayout[]) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const manager = LayoutManagerFactory.create();
      const activeLayout = await manager.getActiveLayout();
      
      if (!activeLayout) {
        console.warn('No active layout to save docked windows to');
        return;
      }

      // Merge docked windows into existing layout data
      const existingData = (activeLayout.data || {}) as ExtendedLayoutData;
      const updatedData: ExtendedLayoutData = {
        ...existingData,
        dockedWindows: windowsToSave,
      };

      await manager.saveLayout({
        id: activeLayout.id,
        name: activeLayout.name,
        data: updatedData,
      });

      console.log(`Saved ${windowsToSave.length} docked windows to layout "${activeLayout.name}"`);
    } catch (err) {
      console.error('Failed to save docked windows:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Auto-save with debouncing
   */
  useEffect(() => {
    if (!autoSave || isLoading) return;

    const timeoutId = setTimeout(() => {
      void saveDockedWindows(windows);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [windows, autoSave, debounceMs, isLoading, saveDockedWindows]);

  return {
    loadDockedWindows,
    saveDockedWindows,
    isLoading,
    isSaving,
    error,
  };
}

/**
 * Extract docked windows from a layout data object
 */
export function extractDockedWindows(layoutData: unknown): WindowLayout[] {
  if (!layoutData || typeof layoutData !== 'object') {
    return [];
  }
  
  const data = layoutData as ExtendedLayoutData;
  return data.dockedWindows || [];
}

/**
 * Merge docked windows into layout data
 */
export function mergeDockedWindows(
  layoutData: unknown,
  dockedWindows: WindowLayout[]
): ExtendedLayoutData {
  const existingData = (layoutData || {}) as ExtendedLayoutData;
  return {
    ...existingData,
    dockedWindows,
  };
}
