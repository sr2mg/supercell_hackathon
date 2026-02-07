export type Tag = 'AI' | 'CHIPS' | 'ENERGY' | 'GOV' | 'CRYPTO' | 'MEDIA';

export interface Shareholder {
  playerId: number;
  shares: number;
  purchaseDividend: number; // 購入時の配当（損益計算用）
}

export interface Asset {
  id: number;
  name: string;
  tag: Tag;
  dividend: number;
  previousDividend: number; // 前回の配当（変動表示用）
  sharesTotal: number;
  sharesRemaining: number;
  isBankrupt: boolean;
  shareholders: Shareholder[];
  isPayday?: boolean;
  icon?: string;
}

const SHARES_TOTAL = 3;

export const INITIAL_BOARD: Asset[] = [
  { id: 0, name: 'Payday / 給料日', tag: 'GOV', dividend: 0, previousDividend: 0, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [], isPayday: true, icon: 'Plane' },
  { id: 1, name: 'AI Agent Startup', tag: 'AI', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [], icon: 'Bot' },
  { id: 2, name: 'Big Tech Cloud', tag: 'AI', dividend: 250, previousDividend: 250, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 3, name: 'GPU Maker', tag: 'CHIPS', dividend: 250, previousDividend: 250, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 4, name: 'Chip Factory', tag: 'CHIPS', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 5, name: 'Power Company', tag: 'ENERGY', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 6, name: 'Oil & Gas Giant', tag: 'ENERGY', dividend: 250, previousDividend: 250, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 7, name: 'Central Bank', tag: 'GOV', dividend: 250, previousDividend: 250, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 8, name: 'Government Bonds', tag: 'GOV', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 9, name: 'Crypto Exchange', tag: 'CRYPTO', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [], icon: 'Bitcoin' },
  { id: 10, name: 'Meme Coin', tag: 'CRYPTO', dividend: 150, previousDividend: 150, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 11, name: 'FinTech App', tag: 'CRYPTO', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 12, name: 'Social Media Platform', tag: 'MEDIA', dividend: 250, previousDividend: 250, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [], icon: 'Instagram' },
  { id: 13, name: 'Influencer Agency', tag: 'MEDIA', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [] },
  { id: 14, name: 'Streaming Studio', tag: 'MEDIA', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [], icon: 'Film' },
  { id: 15, name: 'Big Law & Compliance', tag: 'GOV', dividend: 200, previousDividend: 200, sharesTotal: SHARES_TOTAL, sharesRemaining: SHARES_TOTAL, isBankrupt: false, shareholders: [], icon: 'Landmark' },
];
