/**
 * DesktopEventBus
 * 
 * Simple event bus / emitter used by the renderer to react to tray events
 * and other desktop-level interactions.
 * 
 * This is a minimal, type-safe event system for desktop events.
 */

/**
 * Desktop event types that can be published through the event bus
 */
export type DesktopEvent =
  | { type: "OPEN_SETTINGS" }
  | { type: "RESTORE_MAIN_WINDOW" }
  | { type: "EXIT_REQUESTED" };

/**
 * Event handler function type
 */
export type DesktopEventHandler = (event: DesktopEvent) => void;

/**
 * Desktop Event Bus interface
 * 
 * Provides a simple publish/subscribe mechanism for desktop events.
 * 
 * Example usage (renderer process):
 * ```ts
 * eventBus.subscribe(evt => {
 *   if (evt.type === "RESTORE_MAIN_WINDOW") {
 *     // Bring workspace UI into view, if needed
 *   }
 * });
 * ```
 */
export interface IDesktopEventBus {
  /**
   * Publish an event to all subscribers
   */
  publish(event: DesktopEvent): void;

  /**
   * Subscribe to desktop events
   * @returns Unsubscribe function
   */
  subscribe(handler: DesktopEventHandler): () => void;
}

/**
 * Simple in-memory implementation of IDesktopEventBus
 */
export class DesktopEventBus implements IDesktopEventBus {
  private handlers: Set<DesktopEventHandler> = new Set();

  /**
   * Publish an event to all subscribers
   */
  publish(event: DesktopEvent): void {
    console.log(`[DesktopEventBus] Publishing event: ${event.type}`);
    this.handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('[DesktopEventBus] Error in event handler:', error);
      }
    });
  }

  /**
   * Subscribe to desktop events
   * @returns Unsubscribe function
   */
  subscribe(handler: DesktopEventHandler): () => void {
    this.handlers.add(handler);
    console.log(`[DesktopEventBus] Handler subscribed (${this.handlers.size} total)`);

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler);
      console.log(`[DesktopEventBus] Handler unsubscribed (${this.handlers.size} remaining)`);
    };
  }

  /**
   * Get the number of active subscribers (for debugging/testing)
   */
  getSubscriberCount(): number {
    return this.handlers.size;
  }
}
