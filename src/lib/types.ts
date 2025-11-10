import type { Timestamp } from 'firebase/firestore';

export type AnalysisResult = {
  trustScore: number;
  predictedLabel: 'genuine' | 'fake';
  explanation: string;
};

export type HistoryItem = AnalysisResult & {
  id: string; 
  userId: string;
  timestamp: Timestamp | Date; // Allow Date for local display before Firestore sync
  productOrService: string;
  platform: string;
  reviewText: string;
};
