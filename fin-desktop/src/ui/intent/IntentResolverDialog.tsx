/**
 * Intent Resolver Dialog
 * 
 * UI component for selecting an application when multiple apps can handle an intent
 */

import React from "react";
import type { IntentName } from "../../core/fdc3/Fdc3Intents";
import type { AppDefinition } from "../../core/fdc3/Fdc3AppDirectory";
import "./IntentResolverDialog.css";

export interface IntentResolverDialogProps {
  intent: IntentName;
  apps: AppDefinition[];
  onSelect: (appId: string) => void;
  onCancel: () => void;
}

/**
 * Dialog for resolving intents when multiple apps are available
 */
export const IntentResolverDialog: React.FC<IntentResolverDialogProps> = ({
  intent,
  apps,
  onSelect,
  onCancel,
}) => {
  return (
    <div className="intent-resolver-backdrop" onClick={onCancel}>
      <div className="intent-resolver-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="intent-resolver-header">
          <h2>Select Application</h2>
          <button
            className="intent-resolver-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="intent-resolver-content">
          <p className="intent-resolver-message">
            Multiple applications can handle the <strong>{intent}</strong> intent.
            Please select which application to use:
          </p>

          <div className="intent-resolver-apps">
            {apps.map((app) => (
              <div key={app.id} className="intent-resolver-app-item">
                <div className="intent-resolver-app-info">
                  <h3>{app.title}</h3>
                  <p className="intent-resolver-app-meta">
                    {app.componentId}
                  </p>
                  {app.isDefaultForIntent?.includes(intent) && (
                    <span className="intent-resolver-default-badge">Default</span>
                  )}
                </div>
                <button
                  className="intent-resolver-select-btn"
                  onClick={() => onSelect(app.id)}
                >
                  Use this app
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="intent-resolver-footer">
          <button className="intent-resolver-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
