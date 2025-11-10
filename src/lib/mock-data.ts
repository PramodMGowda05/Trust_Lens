import type { HistoryItem } from '@/lib/types';

// This data is now for reference and will not be used in the dashboard.
export const mockHistory: HistoryItem[] = [
  {
    id: '1',
    trustScore: 0.92,
    predictedLabel: 'genuine',
    explanation: 'The review exhibits a balanced tone, specific details about product usage, and a credible user history, indicating a high likelihood of being genuine.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    productOrService: 'AstroBook Pro',
    platform: 'Amazon',
    reviewText: "I've been using the AstroBook Pro for a month now and it's been a fantastic experience. The screen is gorgeous and the keyboard is a joy to type on. Battery life has been stellar, easily getting me through a full day of work.",
    userId: 'user-1'
  },
  {
    id: '2',
    trustScore: 0.15,
    predictedLabel: 'fake',
    explanation: 'This review contains overly generic positive language, lacks specific details, and the user account has no prior activity, which are common red flags for fake reviews.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    productOrService: 'GalaxyWatch 5',
    platform: 'BestBuy',
    reviewText: "Wow! This is the best watch ever made. I love it so much. Everyone should buy this watch right now. Absolutely amazing product. Five stars!",
    userId: 'user-2'
  },
  {
    id: '3',
    trustScore: 0.78,
    predictedLabel: 'genuine',
    explanation: 'The review provides constructive criticism alongside positive feedback, a sign of a thoughtful and authentic user experience.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    productOrService: 'PixelPhone 8',
    platform: 'Google Store',
    reviewText: "The camera is incredible, especially in low light. The only downside is that the battery life is just okay, not great. I often have to top it up in the evening.",
    userId: 'user-3'
  },
];

export type ModerationItem = {
  id: string;
  reviewer: string;
  credibility: number;
  review: string;
  product: string;
  flaggedReason: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}


export const mockModerationQueue: ModerationItem[] = [
  {
    id: 'rev-001',
    reviewer: 'user123@example.com',
    credibility: 85,
    review: 'This product is an absolute game-changer! I cannot recommend it enough. Changed my life!',
    product: 'Quantum-Flux Capacitor',
    flaggedReason: 'Overly positive',
    date: '2023-10-26',
    status: 'Pending',
  },
  {
    id: 'rev-002',
    reviewer: 'bot-killer99@example.com',
    credibility: 12,
    review: 'BUY NOW!!! BEST EVER!!! CLICK HERE www.scam.com',
    product: 'SonicScrewdriver 3000',
    flaggedReason: 'Spam-like',
    date: '2023-10-25',
    status: 'Pending',
  },
  {
    id: 'rev-003',
    reviewer: 'jane.doe@example.com',
    credibility: 92,
    review: 'While the build quality is excellent, I found the software to be a bit buggy. The main feature works as advertised, but the companion app often crashes.',
    product: 'Chrono-Shift Watch',
    flaggedReason: 'User report',
    date: '2023-10-24',
    status: 'Approved',
  },
  {
    id: 'rev-004',
    reviewer: 'competitor_spy@example.com',
    credibility: 25,
    review: 'This is the worst thing I have ever bought. It broke after one use. Do not buy, go for the other brand instead.',
    product: 'AstroBook Pro',
    flaggedReason: 'Malicious',
    date: '2023-10-23',
    status: 'Rejected',
  },
  {
    id: 'rev-005',
    reviewer: 'sally.s@example.com',
    credibility: 78,
    review: 'It\'s a good product for the price. Not the best, but it gets the job done. I would probably buy it again if it were on sale.',
    product: 'Desktop Lamp v2',
    flaggedReason: 'AI Flag: Unusual phrasing',
    date: '2023-10-22',
    status: 'Pending',
  },
    {
    id: 'rev-006',
    reviewer: 'mike.t@example.com',
    credibility: 45,
    review: 'Amazing, incredible, fantastic! You must buy this now. I have never seen anything like it. Five stars! Best purchase of my life!',
    product: 'Super Blender 5000',
    flaggedReason: 'Overly positive',
    date: '2023-10-21',
    status: 'Rejected',
  },
  {
    id: 'rev-007',
    reviewer: 'real-user-01@example.com',
    credibility: 88,
    review: 'The shipping was a bit slow, took almost a week to arrive. But the product itself is high quality. I\'ve been using it for a few days and I\'m impressed.',
    product: 'Ergonomic Chair',
    flaggedReason: 'AI Flag: Mention of shipping',
    date: '2023-10-20',
    status: 'Approved',
  },
];


export const mockClassificationData = [
  { month: 'Jan', genuine: 186, fake: 80 },
  { month: 'Feb', genuine: 305, fake: 200 },
  { month: 'Mar', genuine: 237, fake: 120 },
  { month: 'Apr', genuine: 73, fake: 190 },
  { month: 'May', genuine: 209, fake: 130 },
  { month: 'Jun', genuine: 214, fake: 140 },
];

export const mockUsageData = [
    { date: '2023-01-01', 'API Calls': 2000, 'Users': 2400 },
    { date: '2023-02-01', 'API Calls': 1800, 'Users': 2210 },
    { date: '2023-03-01', 'API Calls': 2200, 'Users': 2290 },
    { date: '2023-04-01', 'API Calls': 2500, 'Users': 2780 },
    { date: '2023-05-01', 'API Calls': 2100, 'Users': 2181 },
    { date: '2023-06-01', 'API Calls': 3200, 'Users': 2500 },
    { date: '2023-07-01', 'API Calls': 2800, 'Users': 2600 },
];

export const mockCredibilityData = [
  { bucket: 'High (80-100)', value: 45, fill: 'hsl(var(--chart-2))' },
  { bucket: 'Medium (50-79)', value: 30, fill: 'hsl(var(--chart-4))' },
  { bucket: 'Low (20-49)', value: 15, fill: 'hsl(var(--chart-1))' },
  { bucket: 'Very Low (0-19)', value: 10, fill: 'hsl(var(--destructive))' },
];
