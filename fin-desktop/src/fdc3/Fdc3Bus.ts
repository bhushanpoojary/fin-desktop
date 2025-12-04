import type { SelectedInstrumentContext } from "./types";

type InstrumentHandler = (ctx: SelectedInstrumentContext) => void;

const FDC3_INSTRUMENT_TOPIC = "fdc3.instrument.selected";

export class Fdc3Bus {
  private currentContext?: SelectedInstrumentContext;
  private instrumentHandlers = new Set<InstrumentHandler>();
  private desktopUnsubscribe?: () => void;

  constructor() {
    // Subscribe to cross-window events via desktop API
    if (typeof window !== "undefined" && window.desktopApi) {
      this.desktopUnsubscribe = window.desktopApi.subscribe(
        FDC3_INSTRUMENT_TOPIC,
        (context: SelectedInstrumentContext) => {
          this.currentContext = context;
          // Notify local handlers
          for (const handler of this.instrumentHandlers) {
            handler(context);
          }
        }
      );
    }
  }

  getCurrentInstrumentContext(): SelectedInstrumentContext | undefined {
    return this.currentContext;
  }

  publishSelectedInstrument(context: SelectedInstrumentContext): void {
    this.currentContext = {
      ...context,
      timestamp: context.timestamp ?? new Date().toISOString()
    };

    // Notify local handlers immediately
    for (const handler of this.instrumentHandlers) {
      handler(this.currentContext);
    }

    // Broadcast to other windows via desktop API
    if (typeof window !== "undefined" && window.desktopApi) {
      window.desktopApi.publish(FDC3_INSTRUMENT_TOPIC, this.currentContext);
    }
  }

  subscribeSelectedInstrument(handler: InstrumentHandler): () => void {
    this.instrumentHandlers.add(handler);
    // Optionally send current context immediately
    if (this.currentContext) {
      handler(this.currentContext);
    }
    return () => {
      this.instrumentHandlers.delete(handler);
    };
  }

  destroy(): void {
    if (this.desktopUnsubscribe) {
      this.desktopUnsubscribe();
    }
    this.instrumentHandlers.clear();
  }
}
