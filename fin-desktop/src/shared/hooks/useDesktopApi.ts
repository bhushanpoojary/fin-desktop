import { useEffect, useRef, useCallback } from 'react';
import type { DesktopApi } from '../desktopApi';

export function useDesktopApi() {
  // Cache window.desktopApi in a ref for stable reference across re-renders
  const apiRef = useRef<DesktopApi>(window.desktopApi);

  // Expose openApp method
  const openApp = useCallback((appId: string) => {
    return apiRef.current.openApp(appId);
  }, []);

  // Expose publish method
  const publish = useCallback((topic: string, payload: unknown) => {
    apiRef.current.publish(topic, payload);
  }, []);

  // Subscribe helper that handles cleanup automatically
  const subscribe = useCallback((topic: string, handler: (payload: any) => void) => {
    useEffect(() => {
      const unsubscribe = apiRef.current.subscribe(topic, handler);
      return () => {
        unsubscribe();
      };
    }, [topic, handler]);
  }, []);

  return {
    openApp,
    publish,
    subscribe,
  };
}
