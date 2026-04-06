export type ModelType = 'Normal' | 'Pro' | 'Pro 2';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  type?: 'text' | 'image' | 'video';
  mediaUrl?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  mode: ModelType;
  studyMode: boolean;
  userId: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
  userId: string;
}
