/**
 * FDC3 Context Provider - Phase 1
 * 
 * React context wrapper that provides FDC3 context bus to all child components
 */

import React, { createContext, useContext, useMemo } from "react";
import { Fdc3ContextBus } from "./Fdc3ContextBus";

type Fdc3ContextValue = {
  bus: Fdc3ContextBus;
};

const Fdc3ReactContext = createContext<Fdc3ContextValue | undefined>(undefined);

export const Fdc3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const bus = useMemo(() => new Fdc3ContextBus(), []);
  
  return (
    <Fdc3ReactContext.Provider value={{ bus }}>
      {children}
    </Fdc3ReactContext.Provider>
  );
};

/**
 * Hook to access FDC3 context bus
 * Must be used inside Fdc3Provider
 */
export function useFdc3(): Fdc3ContextBus {
  const ctx = useContext(Fdc3ReactContext);
  if (!ctx) {
    throw new Error("useFdc3 must be used inside Fdc3Provider");
  }
  return ctx.bus;
}
