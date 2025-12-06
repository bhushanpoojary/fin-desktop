# FDC3 Phase 1 - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FDC3 Phase 1 Architecture                    │
└─────────────────────────────────────────────────────────────────────┘

                            ┌──────────────────┐
                            │  Fdc3Provider    │
                            │  (React Context) │
                            └────────┬─────────┘
                                     │
                                     │ provides
                                     │
                            ┌────────▼─────────┐
                            │ Fdc3ContextBus   │
                            │  (Singleton)     │
                            └────────┬─────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                │                    │                    │
      ┌─────────▼──────────┐  ┌──────▼────────┐  ┌──────▼────────┐
      │ Context Subscribers│  │ Event         │  │ Last Context  │
      │ (Array)            │  │ Subscribers   │  │ (State)       │
      └─────────┬──────────┘  └──────┬────────┘  └──────┬────────┘
                │                    │                    │
                │                    │                    │
    ┌───────────┴────────────┐  ┌────┴─────────┐  ┌─────┴──────┐
    │                        │  │              │  │            │
┌───▼────────────┐  ┌────────▼──▼─┐  ┌────────▼──▼───┐  ┌────▼────────┐
│ SimpleInstrument│  │ SimpleInstrument│  │ Fdc3EventLog │  │ New         │
│ Source          │  │ Target (1)      │  │ Panel        │  │ Subscriber  │
│ (Broadcaster)   │  └─────────────────┘  └──────────────┘  └─────────────┘
└────────┬────────┘           ▲                   ▲
         │                    │                   │
         │                    │                   │
         │ broadcasts         │ receives          │ monitors
         │                    │                   │
         └────────────────────┴───────────────────┘
                    InstrumentContext
                    { instrument, sourceAppId, timestamp }
```

## Data Flow Diagram

```
User Action                  FDC3 Bus                    Listeners
─────────────────────────────────────────────────────────────────

1. Click "AAPL"
   │
   ├─► broadcastInstrument()
   │      │
   │      ├─► Store as lastContext
   │      │
   │      ├─► Create Fdc3Event
   │      │      │
   │      │      ├─► Notify contextSubscribers ──► Target App 1
   │      │      │                                  (Updates UI)
   │      │      │
   │      │      ├─────────────────────────────► Target App 2
   │      │      │                                (Updates UI)
   │      │      │
   │      │      └─► Notify eventSubscribers ───► Event Log
   │                                              (Logs event)
   │
   └─► Show "Last broadcast: AAPL"


2. New Target Opens
   │
   ├─► subscribeContext()
   │      │
   │      ├─► Add to subscribers list
   │      │
   │      └─► Immediately call with lastContext ──► Target App 3
                                                     (Shows AAPL)
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      DemoWorkspace                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Fdc3Provider                           │  │
│  │                                                           │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐│  │
│  │  │   Panel 1      │  │   Panel 2      │  │   Panel 3   ││  │
│  │  │                │  │                │  │             ││  │
│  │  │  ┌──────────┐  │  │  ┌──────────┐  │  │ ┌─────────┐││  │
│  │  │  │ Simple   │  │  │  │ Simple   │  │  │ │ Fdc3    │││  │
│  │  │  │Instrument│  │  │  │Instrument│  │  │ │ Event   │││  │
│  │  │  │ Source   │  │  │  │ Target   │  │  │ │ Log     │││  │
│  │  │  └────┬─────┘  │  │  └────┬─────┘  │  │ └────┬────┘││  │
│  │  │       │        │  │       │        │  │      │     ││  │
│  │  │       │useFdc3()│ │       │useFdc3()│ │      │useFdc3()
│  │  └───────┼────────┘  └───────┼────────┘  └──────┼─────┘│  │
│  │          │                    │                  │       │  │
│  │          └────────────────────┴──────────────────┘       │  │
│  │                              │                            │  │
│  │                      Fdc3ContextBus                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Subscription Flow

```
┌──────────────────┐
│ Component Mounts │
└────────┬─────────┘
         │
         ▼
┌────────────────────┐
│ useEffect() runs   │
└────────┬───────────┘
         │
         ▼
┌─────────────────────────┐
│ const fdc3 = useFdc3()  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ fdc3.subscribeContext(handler)  │
└────────┬────────────────────────┘
         │
         ├─► Add handler to subscribers[]
         │
         ├─► If lastContext exists
         │   └─► Call handler(lastContext) immediately
         │
         └─► Return unsubscribe function
                    │
                    ▼
         ┌──────────────────────┐
         │ Component Unmounts   │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ unsubscribe() called │
         └──────────┬───────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │ Remove from subscribers │
         └─────────────────────────┘
```

## Broadcasting Flow

```
┌──────────────────┐
│ User clicks AAPL │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ handleBroadcast("AAPL")      │
└────────┬─────────────────────┘
         │
         ▼
┌───────────────────────────────────────┐
│ fdc3.broadcastInstrument({            │
│   instrument: "AAPL",                 │
│   sourceAppId: "SimpleInstrumentSource"│
│   timestamp: Date.now()               │
│ })                                    │
└────────┬──────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Store as lastContext        │
└────────┬────────────────────┘
         │
         ├─► Create Fdc3Event
         │   { type: "CONTEXT_BROADCAST", context }
         │
         ▼
┌──────────────────────────────────┐
│ Notify all contextSubscribers    │
├──────────────────────────────────┤
│ subscriber1(context)             │
│ subscriber2(context)             │
│ subscriber3(context)             │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Notify all eventSubscribers      │
├──────────────────────────────────┤
│ eventSubscriber1(event)          │
│ eventSubscriber2(event)          │
└──────────────────────────────────┘
```

## Type Hierarchy

```
Fdc3Types.ts
├── InstrumentContext
│   ├── instrument: string
│   ├── sourceAppId?: string
│   └── timestamp?: number
│
└── Fdc3Event
    ├── type: "CONTEXT_BROADCAST"
    └── context: InstrumentContext

Fdc3ContextBus.ts
├── contextSubscribers: ((ctx: InstrumentContext) => void)[]
├── eventSubscribers: ((evt: Fdc3Event) => void)[]
└── lastContext: InstrumentContext | null

Methods:
├── subscribeContext(handler) → unsubscribe
├── subscribeEvents(handler) → unsubscribe
├── broadcastInstrument(context)
└── getLastContext() → InstrumentContext | null
```

## Integration Patterns

```
Pattern 1: Broadcaster Only
┌──────────────────────┐
│   <Fdc3Provider>     │
│   ┌────────────────┐ │
│   │ MyBroadcaster  │ │
│   │  useFdc3()     │ │
│   │  .broadcast()  │ │
│   └────────────────┘ │
└──────────────────────┘

Pattern 2: Listener Only
┌──────────────────────┐
│   <Fdc3Provider>     │
│   ┌────────────────┐ │
│   │ MyListener     │ │
│   │  useFdc3()     │ │
│   │  .subscribe()  │ │
│   └────────────────┘ │
└──────────────────────┘

Pattern 3: Both (Bidirectional)
┌──────────────────────┐
│   <Fdc3Provider>     │
│   ┌────────────────┐ │
│   │ MyComponent    │ │
│   │  useFdc3()     │ │
│   │  .broadcast()  │ │
│   │  .subscribe()  │ │
│   └────────────────┘ │
└──────────────────────┘

Pattern 4: Multiple Apps
┌─────────────────────────────┐
│      <Fdc3Provider>         │
│   ┌──────┐  ┌──────┐        │
│   │ App1 │  │ App2 │        │
│   └──┬───┘  └───┬──┘        │
│      │          │           │
│      └─────┬────┘           │
│            ▼                │
│      Shared FDC3 Bus        │
└─────────────────────────────┘
```

## File Dependency Graph

```
Apps depend on:
SimpleInstrumentSource.tsx ──┐
SimpleInstrumentTarget.tsx ──┼──► Fdc3ContextProvider.tsx
Fdc3EventLogPanel.tsx ────────┘       │
                                      │
                                      ▼
                              Fdc3ContextBus.ts
                                      │
                                      ▼
                                Fdc3Types.ts

DemoWorkspace.tsx depends on:
├── Fdc3ContextProvider.tsx
├── SimpleInstrumentSource.tsx
├── SimpleInstrumentTarget.tsx
└── Fdc3EventLogPanel.tsx

appRegistry.ts imports:
├── SimpleInstrumentSource
├── SimpleInstrumentTarget
└── Fdc3EventLogPanel

index.ts exports:
├── Fdc3Types (types)
├── Fdc3ContextBus (class)
└── Fdc3Provider, useFdc3 (React)
```

## State Management

```
┌────────────────────────────────────┐
│      Fdc3ContextBus (Singleton)     │
├────────────────────────────────────┤
│                                    │
│  State:                            │
│  ┌──────────────────────────────┐  │
│  │ lastContext: InstrumentContext│ │
│  │   or null                     │ │
│  └──────────────────────────────┘  │
│                                    │
│  Subscribers:                      │
│  ┌──────────────────────────────┐  │
│  │ contextSubscribers: []       │  │
│  │   - handler1                 │  │
│  │   - handler2                 │  │
│  │   - handler3                 │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ eventSubscribers: []         │  │
│  │   - logHandler               │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

This architecture provides:
- ✅ Simple pub/sub pattern
- ✅ Type-safe communication
- ✅ Automatic cleanup
- ✅ Context replay
- ✅ Debug logging
- ✅ React integration
