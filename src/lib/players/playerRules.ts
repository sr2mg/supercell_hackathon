import type { Player } from '@/types/game';
import type { Asset } from '@/data/boardData';
import { SHARE_PRICE } from '@/lib/stock/stockConstants';

export function shouldComputerBuy(player: Player, asset: Asset): boolean {
    if (asset.isPayday || asset.isBankrupt) return false;
    if (asset.sharesRemaining <= 0) return false;
    if (player.money < SHARE_PRICE) return false;

    // Reserve $800 to avoid bankruptcy
    const reserve = 800;
    if ((player.money - SHARE_PRICE) < reserve) return false;

    // Dividend threshold check
    const isCryptoOrMedia = asset.tag === 'CRYPTO' || asset.tag === 'MEDIA';

    if (isCryptoOrMedia) {
        // CRYPTO/MEDIA: buy if dividend >= 150 with 70% probability
        if (asset.dividend >= 150) {
            return Math.random() < 0.7;
        }
        return false;
    } else {
        // Other tags: buy only if dividend >= 200 with 50% probability
        if (asset.dividend >= 200) {
            return Math.random() < 0.5;
        }
        return false;
    }
}
