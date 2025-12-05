/**
 * Channels Module
 * 
 * Finsemble-style inter-app communication channels for FinDesktop.
 * 
 * ## Quick Start
 * 
 * ```tsx
 * import { ChannelProvider, useChannels, ChannelPicker } from './core/channels';
 * 
 * // 1. Wrap your app
 * function App() {
 *   return (
 *     <ChannelProvider windowId="my-window-1">
 *       <MyApp />
 *     </ChannelProvider>
 *   );
 * }
 * 
 * // 2. Use in components
 * function MyApp() {
 *   const { activeChannelId, broadcast } = useChannels();
 *   
 *   return (
 *     <div>
 *       <ChannelPicker />
 *       <button onClick={() => broadcast(activeChannelId, { ... })}>
 *         Send Data
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * ## Configuration
 * 
 * Edit `src/config/channels.config.ts` to define your channels.
 */

// Core types
export type { 
  ChannelConfig, 
  Channel, 
  ChannelBroadcastEvent,
  ChannelJoinedEvent,
  ChannelLeftEvent,
} from './ChannelTypes';

// Service
export { 
  ChannelService, 
  getChannelService, 
  resetChannelService,
  CHANNEL_EVENTS,
} from './ChannelService';

// React integration
export {
  ChannelProvider,
  useChannels,
  useChannelBroadcasts,
  useActiveChannel,
  useChannelMembers,
} from './ChannelContext';

export type { 
  ChannelContextValue,
  ChannelProviderProps,
} from './ChannelContext';
