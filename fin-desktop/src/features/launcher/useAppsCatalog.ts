import { useEffect, useState } from "react";
import type { AppDefinition } from "../../config/types";
import { ConfigProviderFactory } from "../../config/ConfigProviderFactory";

export interface AppsCatalogState {
  apps: AppDefinition[];
  categories: string[];
  isLoading: boolean;
  error?: string;
}

export function useAppsCatalog(): AppsCatalogState {
  const [state, setState] = useState<AppsCatalogState>({
    apps: [],
    categories: [],
    isLoading: true
  });

  useEffect(() => {
    const provider = ConfigProviderFactory.create();

    let cancelled = false;

    provider
      .getApps()
      .then(apps => {
        if (cancelled) return;

        const categories = Array.from(
          new Set(
            apps
              .map(a => a.category?.trim())
              .filter((c): c is string => Boolean(c))
          )
        ).sort();

        setState({
          apps,
          categories,
          isLoading: false
        });
      })
      .catch(err => {
        if (cancelled) return;
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : String(err)
        }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
