import type { Player } from '@/types/game';
import type { Asset } from '@/data/boardData';
import { SHARE_PRICE } from '@/lib/stock/stockConstants';

export function shouldComputerBuy(player: Player, asset: Asset): boolean {
    if (asset.isPayday || asset.isBankrupt) return false;
    if (asset.sharesRemaining <= 0) return false;
    if (player.money < SHARE_PRICE) return false;

    // Reserve $300 to avoid bankruptcy (aggressive)
    const reserve = 300;
    if ((player.money - SHARE_PRICE) < reserve) return false;

    // Dividend threshold check (aggressive)
    const isCryptoOrMedia = asset.tag === 'CRYPTO' || asset.tag === 'MEDIA';

    if (isCryptoOrMedia) {
        // CRYPTO/MEDIA: buy if dividend >= 50 with 90% probability
        if (asset.dividend >= 50) {
            return Math.random() < 0.9;
        }
        return false;
    } else {
        // Other tags: buy if dividend >= 100 with 80% probability
        if (asset.dividend >= 100) {
            return Math.random() < 0.8;
        }
        return false;
    }
}
