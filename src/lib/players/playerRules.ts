import type { Player } from '@/types/game';
import type { Asset } from '@/data/boardData';
import { SHARE_PRICE } from '@/lib/stock/stockConstants';

export function shouldComputerBuy(player: Player, asset: Asset): boolean {
    if (asset.isPayday || asset.isBankrupt) return false;
    if (asset.sharesRemaining <= 0) return false;
    if (player.money < SHARE_PRICE) return false;
    const reserve = 800;
    if ((player.money - SHARE_PRICE) < reserve) return false;
    if (asset.tag === 'CRYPTO' || asset.tag === 'MEDIA') {
        return Math.random() < 0.7;
    }
    return Math.random() < 0.5;
}
