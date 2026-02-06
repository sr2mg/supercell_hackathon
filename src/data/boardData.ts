export type TileType = 'PROPERTY' | 'CORNER' | 'NEWS' | 'CHANCE' | 'TAX';

export interface Tile {
  id: number;
  name: string;
  type: TileType;
  price?: number;
  rent?: number;
  group?: string; // Color group: 'brown', 'blue', 'pink', 'orange', etc.
  icon?: string;
  owner?: number | null; // Player ID (0 or 1, etc)
}

export const INITIAL_BOARD: Tile[] = [
  // Bottom Row (Right to Left) -> 0 to 6
  { id: 0, name: 'GO', type: 'CORNER', icon: 'ArrowRight' },
  { id: 1, name: 'Crypto Kiosk', type: 'PROPERTY', price: 60, rent: 2, group: 'brown', icon: 'Bitcoin' },
  { id: 2, name: 'Community Blog', type: 'CHANCE', icon: 'MessageCircle' },
  { id: 3, name: 'Local Server', type: 'PROPERTY', price: 60, rent: 4, group: 'brown', icon: 'Server' },
  { id: 4, name: 'Income Tax', type: 'TAX', price: 200, icon: 'DollarSign' },
  { id: 5, name: 'Reading Rail', type: 'PROPERTY', price: 200, rent: 25, group: 'railroad', icon: 'Train' },
  
  // Left Row (Bottom to Top) -> 6 to 11
  { id: 6, name: 'JAIL', type: 'CORNER', icon: 'Lock' },
  { id: 7, name: 'Podcast Studio', type: 'PROPERTY', price: 100, rent: 6, group: 'pink', icon: 'Mic' },
  { id: 8, name: 'NEWS ALERT', type: 'NEWS', icon: 'Radio' },
  { id: 9, name: 'Streaming Hub', type: 'PROPERTY', price: 100, rent: 6, group: 'pink', icon: 'Video' },
  { id: 10, name: 'Vlog Spot', type: 'PROPERTY', price: 120, rent: 8, group: 'pink', icon: 'Camera' },
  { id: 11, name: 'Electric Co.', type: 'PROPERTY', price: 150, rent: 10, group: 'utility', icon: 'Zap' },

  // Top Row (Left to Right) -> 12 to 17
  { id: 12, name: 'NEWS ROOM', type: 'CORNER', icon: 'Globe' }, // "Free Parking" equivalent
  { id: 13, name: 'Daily Paper', type: 'PROPERTY', price: 140, rent: 10, group: 'orange', icon: 'Newspaper' },
  { id: 14, name: 'Print Press', type: 'PROPERTY', price: 140, rent: 10, group: 'orange', icon: 'Printer' },
  { id: 15, name: 'Editorial Desk', type: 'PROPERTY', price: 160, rent: 12, group: 'orange', icon: 'Edit' },
  { id: 16, name: 'Subway Station', type: 'PROPERTY', price: 200, rent: 25, group: 'railroad', icon: 'Train' },
  { id: 17, name: 'Investigative Unit', type: 'PROPERTY', price: 180, rent: 14, group: 'red', icon: 'Search' },

  // Right Row (Top to Bottom) -> 18 to 23
  { id: 18, name: 'GO TO JAIL', type: 'CORNER', icon: 'Siren' },
  { id: 19, name: 'Tech Campus', type: 'PROPERTY', price: 220, rent: 18, group: 'red', icon: 'Cpu' },
  { id: 20, name: 'Data Center', type: 'PROPERTY', price: 240, rent: 20, group: 'red', icon: 'Database' },
  { id: 21, name: 'NEWS ALERT', type: 'NEWS', icon: 'Radio' },
  { id: 22, name: 'Media Empire', type: 'PROPERTY', price: 350, rent: 35, group: 'blue', icon: 'Tv' },
  { id: 23, name: 'Global Network', type: 'PROPERTY', price: 400, rent: 50, group: 'blue', icon: 'Globe2' },
];
