import { describe, it, expect, vi } from 'vitest'
import { Fdc3ContextBus } from '../Fdc3ContextBus'
import type { InstrumentContext } from '../Fdc3Types'

describe('Fdc3ContextBus', () => {
  it('delivers broadcast context to subscribers', () => {
    const bus = new Fdc3ContextBus()
    const handler = vi.fn()
    bus.subscribeContext(handler)

    const ctx: InstrumentContext = { instrument: 'AAPL' }
    bus.broadcastInstrument(ctx)

    expect(handler).toHaveBeenCalledWith(ctx)
  })

  it('replays the last context to new subscribers immediately', () => {
    const bus = new Fdc3ContextBus()
    bus.broadcastInstrument({ instrument: 'MSFT' })

    const late = vi.fn()
    bus.subscribeContext(late)

    expect(late).toHaveBeenCalledTimes(1)
    expect(late).toHaveBeenCalledWith({ instrument: 'MSFT' })
  })

  it('stops notifying after unsubscribe', () => {
    const bus = new Fdc3ContextBus()
    const handler = vi.fn()
    const unsubscribe = bus.subscribeContext(handler)

    unsubscribe()
    bus.broadcastInstrument({ instrument: 'GOOG' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('emits a CONTEXT_BROADCAST event to event subscribers', () => {
    const bus = new Fdc3ContextBus()
    const onEvent = vi.fn()
    bus.subscribeEvents(onEvent)

    bus.broadcastInstrument({ instrument: 'TSLA' })

    expect(onEvent).toHaveBeenCalledWith({
      type: 'CONTEXT_BROADCAST',
      context: { instrument: 'TSLA' },
    })
  })

  it('tracks the last broadcast context', () => {
    const bus = new Fdc3ContextBus()
    expect(bus.getLastContext()).toBeNull()

    bus.broadcastInstrument({ instrument: 'NVDA' })
    expect(bus.getLastContext()).toEqual({ instrument: 'NVDA' })
  })
})
