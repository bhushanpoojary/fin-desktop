import type React from "react";
import { InstrumentSourceApp } from "../apps/InstrumentSourceApp";
import { InstrumentTargetApp } from "../apps/InstrumentTargetApp";
import { Fdc3EventsLogScreen } from "../apps/Fdc3EventsLogScreen";
import OrderTicketApp from "../apps/OrderTicketApp";
import NewsApp from "../apps/NewsApp";
import LiveMarketApp from "../apps/LiveMarketApp";
import ThemeTestApp from "./ThemeTestApp";

/**
 * Registry mapping app IDs to their React components.
 * Used by WorkspaceDock to render app components in tabs.
 */
export type AppComponentRegistry = Record<string, React.ComponentType>;

/**
 * Default app registry with all available workspace apps.
 * Maps app IDs to their corresponding React components.
 */
export const defaultAppRegistry: AppComponentRegistry = {
  "order-ticket": OrderTicketApp,
  "blotter": LiveMarketApp, // Trade Blotter uses LiveMarketApp (shows trades)
  "live-market": LiveMarketApp,
  "news": NewsApp,
  "instrument-source": InstrumentSourceApp,
  "instrument-target": InstrumentTargetApp,
  "fdc3-events-log": Fdc3EventsLogScreen,
  "theme-customization": ThemeTestApp,
};
