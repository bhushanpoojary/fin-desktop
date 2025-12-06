/**
 * FDC3 Initialization Example
 * 
 * This file demonstrates how to initialize the FDC3 intent system
 * in your application startup code.
 * 
 * Copy this code into your main.tsx or App.tsx file.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";
import { IntentResolverProvider } from "../shared/providers/IntentResolverProvider";
import { initializeFdc3Intents, createFdc3DesktopApi } from "../shared/fdc3DesktopApi";
import { appDirectory } from "../config/FinDesktopConfig";

// Initialize FDC3 intent system
function initializeFdc3() {
  // Get the base desktop API from the window
  const baseDesktopApi = window.desktopApi;

  if (!baseDesktopApi) {
    console.error("DesktopApi not available - FDC3 intents will not work");
    return;
  }

  // Initialize the intent system with app directory
  initializeFdc3Intents(appDirectory, baseDesktopApi);

  // Create enhanced API with raiseIntent support
  const enhancedApi = createFdc3DesktopApi(baseDesktopApi);

  // Replace window.desktopApi with enhanced version
  window.desktopApi = enhancedApi;

  console.log("FDC3 intent system initialized with", appDirectory.length, "apps");
}

// Initialize before rendering
initializeFdc3();

// Render the app with IntentResolverProvider
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IntentResolverProvider>
      <App />
    </IntentResolverProvider>
  </React.StrictMode>
);

/**
 * Alternative: Initialize in App component
 * 
 * If you prefer to initialize inside a component, use useEffect:
 */
/*
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    initializeFdc3();
  }, []);

  return (
    // Your app content
  );
}
*/
