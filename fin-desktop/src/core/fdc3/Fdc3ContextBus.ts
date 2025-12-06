/**
 * FDC3 Context Bus - Phase 1
 * 
 * Simple in-memory pub/sub context bus for FDC3-style context communication
 */

import type { InstrumentContext, Fdc3Event } from "./Fdc3Types";

export class Fdc3ContextBus {
  private contextSubscribers: ((ctx: InstrumentContext) => void)[] = [];
  private eventSubscribers: ((evt: Fdc3Event) => void)[] = [];
  private lastContext: InstrumentContext | null = null;

  /**
   * Subscribe to latest instrument context
   * Handler is immediately called with last context if present
   */
  subscribeContext(handler: (ctx: InstrumentContext) => void): () => void {
    this.contextSubscribers.push(handler);
    
    // Immediately replay last context if present
    if (this.lastContext) {
      handler(this.lastContext);
    }
    
    return () => {
      this.contextSubscribers = this.contextSubscribers.filter(h => h !== handler);
    };
  }

  /**
   * Subscribe to raw FDC3 events (for event log)
   */
  subscribeEvents(handler: (evt: Fdc3Event) => void): () => void {
    this.eventSubscribers.push(handler);
    return () => {
      this.eventSubscribers = this.eventSubscribers.filter(h => h !== handler);
    };
  }

  /**
   * Broadcast new instrument context from an app
   */
  broadcastInstrument(context: InstrumentContext) {
    this.lastContext = context;
    const evt: Fdc3Event = { type: "CONTEXT_BROADCAST", context };
    
    // Notify all context subscribers
    this.contextSubscribers.forEach(h => h(context));
    
    // Notify all event subscribers (for logging)
    this.eventSubscribers.forEach(h => h(evt));
  }

  /**
   * Get the last broadcast context
   */
  getLastContext(): InstrumentContext | null {
    return this.lastContext;
  }
}
