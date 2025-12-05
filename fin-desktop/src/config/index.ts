// Main exports for the config system
export { ConfigProviderFactory } from './ConfigProviderFactory';
export { DemoConfigProvider } from './DemoConfigProvider';
export type { IConfigProvider } from './IConfigProvider';
export type { 
  AppDefinition, 
  WorkspaceLayout, 
  PlatformConfig 
} from './types';
export type { 
  ConfigProviderKind, 
  ConfigProviderFactoryOptions 
} from './ConfigProviderFactory';

// Channel configuration
export { 
  channelConfig, 
  getChannelConfig, 
  getChannelById,
  validateChannelConfig 
} from './channels.config';
export type { ChannelConfig } from '../core/channels/ChannelTypes';
