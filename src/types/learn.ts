export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface CarbonFootprintResult {
  footprint: number;
  unit: string;
  breakdown: Array<{ category: string; amount: number }>;
  tips: string[];
}

export interface GreenEvent {
  title: string;
  description: string;
  date: string;
  location: string;
  impact: string;
  imageUrl?: string;
}