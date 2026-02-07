export type Tag = 'AI' | 'CHIPS' | 'ENERGY' | 'GOV' | 'CRYPTO' | 'MEDIA';

export type NewsType = 'MARKET' | 'NOISE';

export type NewsDirection = 'UP' | 'DOWN';

export interface NewsCard {
    id: string; // UUID or hash
    sourceTitle: string;
    type: NewsType;
    tag: Tag | null; // Null if NOISE (or random effect later)
    title: string;
    reason: string;
    description?: string; // Original article description from RSS
    direction: NewsDirection | null;
    url?: string; // BBC article URL
    impactText?: string; // English impact sentence shown in UI
}
