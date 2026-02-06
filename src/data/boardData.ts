export type TileType = 'PROPERTY' | 'CORNER' | 'CHANCE' | 'TAX' | 'SPECIAL';

export interface Tile {
  id: number;
  name: string;
  type: TileType;
  price?: number;
  rent?: number;
  // Visual grouping (optional now, but good for UI)
  group?: string;
  icon?: string;
  owner?: number | null;
  // New: specific game mechanic identifier
  effect?: 'START_BONUS' | 'AI_LICENSING' | 'CRYPTO_VOLATILITY' | 'SKIP_TURN' | 'INFLUENCER_TAX' | 'INTEREST_TRAP' | 'BAILOUT' | 'REMOTE_SLOW' | 'GIG_LABOR' | 'BANKRUPTCY' | 'ENERGY_COST' | 'CONTENT_FLIP';
  description?: string;
}

export const INITIAL_BOARD: Tile[] = [
  // Bottom Row (Right-to-Left): Indices 0 - 3
  // 0: Bottom Right
  { id: 0, name: 'START (Tax Haven)', type: 'CORNER', effect: 'START_BONUS', icon: 'Plane', description: '+$200. Beware of Tax Hikes.' },
  { id: 1, name: 'AI Agent License', type: 'PROPERTY', price: 150, rent: 20, group: 'tech', effect: 'AI_LICENSING', icon: 'Bot' },
  { id: 2, name: 'Crypto Wallet', type: 'SPECIAL', group: 'finance', effect: 'CRYPTO_VOLATILITY', icon: 'Bitcoin' },
  { id: 3, name: 'CHANCE', type: 'CHANCE', icon: 'Siren' },

  // Left Row (Bottom-to-Top): Indices 4 - 7
  // 4: Bottom Left
  { id: 4, name: 'Layoff Lounge', type: 'CORNER', effect: 'SKIP_TURN', icon: 'Coffee', description: 'Skip next turn. No salary.' },
  { id: 5, name: 'Influencer Tax', type: 'PROPERTY', price: 200, rent: 30, group: 'media', effect: 'INFLUENCER_TAX', icon: 'Instagram' },
  { id: 6, name: 'Interest Rate Trap', type: 'TAX', effect: 'INTEREST_TRAP', icon: 'TrendingUp', description: 'Pay 10% of total cash.' },
  { id: 7, name: 'CHANCE', type: 'CHANCE', icon: 'Siren' },

  // Top Row (Left-to-Right): Indices 8 - 11
  // 8: Top Left
  { id: 8, name: 'Gov Bailout', type: 'CORNER', effect: 'BAILOUT', icon: 'Landmark', description: 'Debt relief or free money.' },
  { id: 9, name: 'Remote Work Hub', type: 'PROPERTY', price: 250, rent: 35, group: 'tech', effect: 'REMOTE_SLOW', icon: 'Wifi' },
  { id: 10, name: 'Gig Platform', type: 'PROPERTY', price: 220, rent: 25, group: 'service', effect: 'GIG_LABOR', icon: 'Bike' },
  { id: 11, name: 'CHANCE', type: 'CHANCE', icon: 'Siren' },

  // Right Row (Top-to-Bottom): Indices 12 - 15
  // 12: Top Right
  { id: 12, name: 'Bankruptcy Ct.', type: 'CORNER', effect: 'BANKRUPTCY', icon: 'Gavel', description: 'Force sell highest asset.' },
  { id: 13, name: 'Data Center', type: 'PROPERTY', price: 350, rent: 60, group: 'infra', effect: 'ENERGY_COST', icon: 'Server' },
  { id: 14, name: 'Content IP', type: 'PROPERTY', price: 400, rent: 80, group: 'media', effect: 'CONTENT_FLIP', icon: 'Film' },
  { id: 15, name: 'CHANCE', type: 'CHANCE', icon: 'Siren' },
];
