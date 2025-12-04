import React, { createContext, useContext, useEffect, useState } from "react";
import { Fdc3Bus } from "./Fdc3Bus";
import type { SelectedInstrumentContext } from "./types";

const Fdc3BusContext = createContext<Fdc3Bus | undefined>(undefined);

export const Fdc3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bus] = useState(() => new Fdc3Bus());
  return <Fdc3BusContext.Provider value={bus}>{children}</Fdc3BusContext.Provider>;
};

export function useFdc3Bus(): Fdc3Bus {
  const ctx = useContext(Fdc3BusContext);
  if (!ctx) {
    throw new Error("useFdc3Bus must be used inside <Fdc3Provider>");
  }
  return ctx;
}

export function useSelectedInstrument(): SelectedInstrumentContext | undefined {
  const bus = useFdc3Bus();
  const [context, setContext] = useState<SelectedInstrumentContext | undefined>(
    () => bus.getCurrentInstrumentContext()
  );

  useEffect(() => {
    const unsubscribe = bus.subscribeSelectedInstrument(setContext);
    return unsubscribe;
  }, [bus]);

  return context;
}
