export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  model?: string;
  citations?: string[];
}

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  model: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  plan: 'free' | 'plus' | 'pro' | 'team';
  questions_used?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
