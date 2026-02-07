import { describe, it, expect } from 'vitest';
import { sellSharesForCash } from './stockRules';
import type { Asset, Tag } from '@/data/boardData';
import type { Player } from '@/types/game';

const mkAsset = (id: number, tag: Tag, dividend: number, shares: Array<{ playerId: number; shares: number }>): Asset => ({
    id,
    name: `Asset ${id}`,
    tag,
    dividend,
    previousDividend: dividend,
    price: 500,
    previousPrice: 500,
    sharesTotal: 3,
    sharesRemaining: 3 - shares.reduce((acc, h) => acc + h.shares, 0),
    isBankrupt: false,
    shareholders: shares.map(h => ({ ...h, purchaseDividend: dividend })),
});

describe('sellSharesForCash', () => {
    it('sells shares when cash is negative to cover amount needed', () => {
        const player: Player = {
            id: 0,
            name: 'P1',
            money: -100,
            position: 0,
            color: 'bg-red-500',
            isComputer: false,
            isAlive: true,
        };

        const board: Asset[] = [
            mkAsset(1, 'AI', 200, [{ playerId: 0, shares: 2 }]),
            mkAsset(2, 'GOV', 200, []),
        ];

        const result = sellSharesForCash(player, board, 200, null);

        expect(result.ok).toBe(true);
        expect(result.cash).toBeGreaterThanOrEqual(0);
        const ownedAfter = result.board[0].shareholders.find(h => h.playerId === 0)?.shares ?? 0;
        expect(ownedAfter).toBeLessThan(2);
    });

    it('fails when no shares and cash is insufficient', () => {
        const player: Player = {
            id: 1,
            name: 'P2',
            money: -50,
            position: 0,
            color: 'bg-blue-500',
            isComputer: false,
            isAlive: true,
        };

        const board: Asset[] = [
            mkAsset(1, 'AI', 200, []),
        ];

        const result = sellSharesForCash(player, board, 0, null);
        expect(result.ok).toBe(false);
    });
});
