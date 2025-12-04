export interface AppDefinition {
  id: string;               // unique id e.g. "order-ticket"
  title: string;            // display name for launcher
  iconUrl?: string;         // optional URL / path to icon
  category?: string;        // e.g. "Trading", "Research"
  tags?: string[];          // search keywords
  launchUrl?: string;       // URL or route used when launching
  windowOptions?: {
    width?: number;
    height?: number;
    resizable?: boolean;
    [key: string]: unknown;
  };
  // you can add more fields later (FDC3 intents, permissions, etc.)
}

export interface WorkspaceLayout {
  id: string;
  name: string;
  // keep it generic for now, client can define their own schema:
  data: unknown;
}

export interface PlatformConfig {
  apps: AppDefinition[];
  layouts?: WorkspaceLayout[];
}
