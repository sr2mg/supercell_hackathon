import type { Player } from '@/types/game';
import type { Asset, Tag } from '@/data/boardData';
import { SHARE_PRICE, SHARE_VALUE } from './stockConstants';

export function canBuyAsset(asset: Asset | undefined, player: Player): boolean {
    if (!asset) {
        console.log(`[canBuyAsset] Fail: No asset.`);
        return false;
    }
    if (asset.isPayday) {
        // console.log(`[canBuyAsset] Fail: Payday tile.`);
        return false;
    }
    if (asset.isBankrupt) {
        console.log(`[canBuyAsset] Fail: Asset is bankrupt.`);
        return false;
    }

    // Check remaining shares
    if (asset.sharesRemaining <= 0) {
        console.log(`[canBuyAsset] Fail: No shares remaining for ${asset.name}. (Total: ${asset.sharesTotal}, Remaining: ${asset.sharesRemaining})`);
        return false;
    }

    // Check money
    if (player.money < asset.price) {
        console.log(`[canBuyAsset] Fail: Insufficient funds. (Player: ${player.money}, Price: ${asset.price})`);
        return false;
    }

    return true;
}

export function getPlayerAssets(player: Player, board: Asset[]): number {
    const shareValue = board.reduce((acc, asset) => {
        const ownedShares = asset.shareholders.find(h => h.playerId === player.id)?.shares || 0;
        return acc + (ownedShares * asset.price);
    }, 0);
    return player.money + shareValue;
}

export function removePlayerShares(board: Asset[], playerId: number): Asset[] {
    return board.map(asset => {
        const owned = asset.shareholders.find(h => h.playerId === playerId)?.shares || 0;
        if (owned === 0) return asset;
        return {
            ...asset,
            sharesRemaining: Math.min(asset.sharesTotal, asset.sharesRemaining + owned),
            shareholders: asset.shareholders.filter(h => h.playerId !== playerId)
        };
    });
}

export function sellSharesForCash(player: Player, board: Asset[], amountNeeded: number, lastDownTag: Tag | null) {
    let cash = player.money;
    const ownedAssets = board
        .map(asset => {
            const owned = asset.shareholders.find(h => h.playerId === player.id)?.shares || 0;
            return { asset, owned };
        })
        .filter(x => x.owned > 0);

    if (ownedAssets.length === 0) {
        return { ok: cash >= amountNeeded, cash, board };
    }

    const prioritized = ownedAssets.sort((a, b) => {
        const aTag = a.asset.tag === lastDownTag ? -1 : 0;
        const bTag = b.asset.tag === lastDownTag ? -1 : 0;
        if (aTag !== bTag) return aTag - bTag;
        if (a.asset.dividend !== b.asset.dividend) return a.asset.dividend - b.asset.dividend;
        return Math.random() - 0.5;
    });

    let updatedBoard = [...board];
    for (const { asset, owned } of prioritized) {
        if (cash >= amountNeeded) break;

        const price = asset.price;
        if (price <= 0) continue; // Cannot sell worthless stock

        const sharesToSell = Math.min(owned, Math.ceil((amountNeeded - cash) / price));
        if (sharesToSell <= 0) continue;

        cash += sharesToSell * price;
        updatedBoard = updatedBoard.map(t => {
            if (t.id !== asset.id) return t;
            const newShareholders = t.shareholders
                .map(h => h.playerId === player.id ? { ...h, shares: h.shares - sharesToSell } : h)
                .filter(h => h.shares > 0);
            return {
                ...t,
                sharesRemaining: Math.min(t.sharesTotal, t.sharesRemaining + sharesToSell),
                shareholders: newShareholders
            };
        });
    }

    return { ok: cash >= amountNeeded, cash, board: updatedBoard };
}
