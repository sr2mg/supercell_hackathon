export type Tag = 'AI' | 'CHIPS' | 'ENERGY' | 'GOV' | 'CRYPTO' | 'MEDIA';

export type NewsType = 'MARKET' | 'NOISE';

export type NewsDirection = 'UP' | 'DOWN';

export interface NewsCard {
    id: string; // UUID or hash
    sourceTitle: string;
    type: NewsType;
    tag: Tag | null; // Null if NOISE (or random effect later)
    titleJa: string;
    titleEn: string;
    reasonJa: string;
    reasonEn: string;
    direction: NewsDirection | null;
}
