
export interface WebhookEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface WebhookEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  footer?: { text: string; icon_url?: string };
  image?: { url: string };
  thumbnail?: { url: string };
  author?: { name: string; url?: string; icon_url?: string };
  fields: WebhookEmbedField[];
}

export interface WebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: WebhookEmbed[];
}

export interface WebhookTemplate {
  id: string;
  name: string;
  purpose: string;
  webhookUrl?: string;
  payload: WebhookPayload;
  createdAt: number;
}

export interface SavedWebhook {
  id: string;
  name: string;
  url: string;
}

export interface WebhookChatEntry {
  id: string;
  webhookId: string;
  webhookName: string;
  timestamp: number;
  payload: WebhookPayload;
}

// Fixed missing BotCommand type required by BotMaker.tsx
export interface BotCommand {
  id: string;
  name: string;
  description: string;
  response: string;
  type: string;
}

// Fixed missing BotStatus type required by BotConsole.tsx
export type BotStatus = 'online' | 'idle' | 'dnd' | 'invisible';

// Fixed missing BotActivity type required by BotConsole.tsx
export type BotActivity = 'PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING';

// Fixed missing BotPresence type required by BotConsole.tsx
export interface BotPresence {
  status: BotStatus;
  activityName: string;
  activityType: BotActivity;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WEBHOOK_MAKER = 'WEBHOOK_MAKER',
  WEBHOOK_CONSOLE = 'WEBHOOK_CONSOLE',
  UTILITIES = 'UTILITIES'
}
