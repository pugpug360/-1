export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent: string;
  };
}

export interface SearchResponse {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  groundingMetadata?: GroundingMetadata;
  timestamp: number;
}

export enum Category {
  HYPERTROPHY = '肌肥大',
  STRENGTH = '最大肌力',
  POWER = '爆發力',
  ENDURANCE = '能量系統',
  RECOVERY = '恢復與監控',
  INJURY_PREVENTION = '傷害預防',
  NUTRITION = '運動營養',
  TECHNOLOGY = '運動科技',
}

export interface Report {
  id: string;
  topic: string;
  category: Category;
  summary: string;
  groundingMetadata?: GroundingMetadata;
  date: string;
}