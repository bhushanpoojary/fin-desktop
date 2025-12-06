import React, { useState, useMemo, useEffect } from "react";
import type { AppDefinition } from "../../config/types";
import { useAppsCatalog } from "./useAppsCatalog";
import { LauncherSearchBox } from "./LauncherSearchBox";
import { useLogger } from "../../logging/useLogger";
import "./Launcher.css";

export interface LauncherProps {
  onLaunch?: (app: AppDefinition) => void;
}

export const Launcher: React.FC<LauncherProps> = ({ onLaunch }) => {
  const { apps, categories, isLoading, error } = useAppsCatalog();
  const logger = useLogger("Launcher");
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Log when the launcher mounts
  useEffect(() => {
    logger.info("Launcher mounted", { appCount: apps.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps.length]);

  // Log when loading completes or fails
  useEffect(() => {
    if (!isLoading && !error && apps.length > 0) {
      logger.info("Apps catalog loaded successfully", { appCount: apps.length });
    }
    if (error) {
      logger.error("Failed to load apps catalog", { error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, error, apps.length]);

  const filteredApps = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    return apps.filter((app) => {
      // Filter by category
      if (selectedCategory && app.category !== selectedCategory) {
        return false;
      }

      // Filter by search text
      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        app.title,
        app.id,
        ...(app.tags ?? [])
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [apps, searchText, selectedCategory]);

  const handleAppClick = (app: AppDefinition) => {
    logger.info("App launch clicked", { appId: app.id, appTitle: app.title });
    onLaunch?.(app);
  };

  const handleAppKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    app: AppDefinition
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAppClick(app);
    }
  };

  const getAppInitial = (title: string): string => {
    return title.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="launcher-container">
        <div className="launcher-loading">Loading apps…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="launcher-container">
        <div className="launcher-error">
          <strong>Error loading apps:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="launcher-container">
      <LauncherSearchBox
        searchText={searchText}
        onSearchTextChange={setSearchText}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <div className="launcher-results-info">
        {filteredApps.length} {filteredApps.length === 1 ? "app" : "apps"}
        {searchText && ` matching "${searchText}"`}
      </div>

      <div className="launcher-grid">
        {filteredApps.length === 0 ? (
          <div className="launcher-no-results">
            No apps found. Try adjusting your search.
          </div>
        ) : (
          filteredApps.map((app) => (
            <button
              key={app.id}
              className="launcher-app-tile"
              onClick={() => handleAppClick(app)}
              onKeyDown={(e) => handleAppKeyDown(e, app)}
              title={`Launch ${app.title}`}
            >
              <div className="launcher-app-icon">
                {app.iconUrl ? (
                  <img src={app.iconUrl} alt={app.title} />
                ) : (
                  <div className="launcher-app-icon-placeholder">
                    {getAppInitial(app.title)}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="launcher-app-title">{app.title}</div>
                {app.category && (
                  <div className="launcher-app-category">{app.category}</div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
