export const ANALYTICS = {
  DAILY_PAGE_VIEWS: 1350,
  MONTHLY_ACTIVE_USERS: 21000,
  DAILY_UNIQUE_READERS: 750,
  AVG_ENGAGEMENT_SEC: 18,
  DATA_PERIOD: "Feb 17 – Mar 16, 2026",
};

export type AdUnit = {
  id: string;
  category: 'display' | 'video' | 'premium';
  name: string;
  dimensions: string;
  baseDay: number;
  cpm: number;
  desc: string;
};

export const AD_INVENTORY: AdUnit[] = [
  // Display
  { id: 'med-rect', category: 'display', name: 'Medium Rectangle', dimensions: '300×250', baseDay: 10.80, cpm: 8, desc: 'Standard sidebar placement.' },
  { id: 'leaderboard', category: 'display', name: 'Leaderboard', dimensions: '728×90', baseDay: 13.50, cpm: 10, desc: 'Top of page prominence.' },
  { id: 'mobile', category: 'display', name: 'Mobile Banner', dimensions: '320×50', baseDay: 7.20, cpm: 5.30, desc: 'Mobile-optimized sticky footer.' },
  { id: 'half-page', category: 'display', name: 'Half Page', dimensions: '300×600', baseDay: 16.20, cpm: 12, desc: 'High-impact vertical canvas.' },
  { id: 'billboard', category: 'display', name: 'Billboard', dimensions: '970×250', baseDay: 18.00, cpm: 13.30, desc: 'Massive desktop header.' },
  { id: 'skyscraper', category: 'display', name: 'Wide Skyscraper', dimensions: '160×600', baseDay: 9.00, cpm: 6.70, desc: 'Tall persistent sidebar.' },
  // Video
  { id: 'instream', category: 'video', name: 'In-Stream Video', dimensions: 'Various', baseDay: 27.00, cpm: 20, desc: 'Pre/mid-roll video content.' },
  { id: 'outstream', category: 'video', name: 'Out-Stream Video', dimensions: 'Various', baseDay: 22.50, cpm: 16.70, desc: 'Autoplaying article video.' },
  // Premium
  { id: 'full-takeover', category: 'premium', name: 'Full Site Takeover', dimensions: 'Multiple', baseDay: 54.00, cpm: 40, desc: 'Own every ad slot on the site.' },
  { id: 'home-takeover', category: 'premium', name: 'Homepage Takeover', dimensions: 'Multiple', baseDay: 40.50, cpm: 30, desc: 'Dominate the homepage experience.' },
];

export const DISCOUNTS = {
  smb: 0,
  corp: 0.05,
  nonprofit: 0.20,
};

export type ClientType = keyof typeof DISCOUNTS;

export type Tier = {
  id: string;
  name: string;
  price: number;
  adIds: string[];
  days: number;
  printBundle: boolean;
  clientType: ClientType;
  features: string[];
};

export const TIERS: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 500,
    adIds: ['med-rect'],
    days: 30,
    printBundle: false,
    clientType: 'smb',
    features: ['Medium Rectangle ad', '30 days duration', 'Standard support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 1500,
    adIds: ['leaderboard', 'med-rect'],
    days: 30,
    printBundle: true,
    clientType: 'corp',
    features: ['Leaderboard + Rectangle', 'Print bundle included', 'Net 30 billing (Corp)'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 3500,
    adIds: ['home-takeover', 'instream'],
    days: 30,
    printBundle: true,
    clientType: 'corp',
    features: ['Homepage Takeover', 'In-Stream Video', 'Print bundle included'],
  }
];

export const PRINT_ADDON_MONTHLY = 400;
