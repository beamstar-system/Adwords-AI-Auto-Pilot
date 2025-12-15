export interface BusinessInfo {
  name: string;
  website: string;
  description: string;
  audience: string;
  budget: string;
}

export interface CampaignStrategy {
  goal: string;
  biddingStrategy: string;
  networks: string[];
  locations: string[];
  rationale: string;
}

export interface Keyword {
  text: string;
  matchType: 'Broad' | 'Phrase' | 'Exact';
  intent: string;
}

export interface AdCreative {
  headlines: string[];
  descriptions: string[];
}

export interface CampaignData {
  businessInfo: BusinessInfo;
  strategy: CampaignStrategy | null;
  keywords: Keyword[];
  adCreative: AdCreative | null;
}

export enum Step {
  BusinessInfo = 0,
  Strategy = 1,
  Keywords = 2,
  AdCreative = 3,
  Review = 4,
}
