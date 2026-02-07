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
        const player = {
            id: 1,
            name: 'P2',
            money: -50,
            position: 0,
            color: 'bg-blue-500',
            isComputer: false,
            isAlive: true,
        } as Player;

        const board: Asset[] = [
            mkAsset(1, 'AI', 200, []),
        ];

        const result = sellSharesForCash(player, board, 0, null);
        expect(result.ok).toBe(false);
    });
});

import { canBuyAsset } from './stockRules';

describe('canBuyAsset', () => {
    const basePlayer: Player = {
        id: 0,
        name: 'Test Player',
        money: 1000,
        position: 0,
        color: 'blue',
        isComputer: false,
        isAlive: true,
    };

    it('allows buying when affordable and shares available', () => {
        // Asset price 500, player has 1000, shares remaining 3
        const asset = mkAsset(1, 'AI', 200, []);
        expect(asset.sharesRemaining).toBe(3);
        expect(canBuyAsset(asset, basePlayer)).toBe(true);
    });

    it('fails when insufficient funds', () => {
        const poorPlayer = { ...basePlayer, money: 499 };
        const asset = mkAsset(1, 'AI', 200, []);
        // price is 500
        expect(canBuyAsset(asset, poorPlayer)).toBe(false);
    });

    it('fails when no shares remaining', () => {
        // 3 people own 1 share each = 0 remaining
        const asset = mkAsset(1, 'AI', 200, [
            { playerId: 1, shares: 1 },
            { playerId: 2, shares: 1 },
            { playerId: 3, shares: 1 }
        ]);
        expect(asset.sharesRemaining).toBe(0);
        expect(canBuyAsset(asset, basePlayer)).toBe(false);
    });

    it('allows buying when partially owned (The reported bug case)', () => {
        // CPU owns 1 share, 2 remaining
        const asset = mkAsset(1, 'AI', 200, [{ playerId: 1, shares: 1 }]);
        expect(asset.sharesRemaining).toBe(2);

        // Should be buyable
        expect(canBuyAsset(asset, basePlayer)).toBe(true);
    });

    it('fails if asset is bankrupt', () => {
        const asset = mkAsset(1, 'AI', 200, []);
        asset.isBankrupt = true;
        expect(canBuyAsset(asset, basePlayer)).toBe(false);
    });

    it('fails if asset is payday tile', () => {
        const asset = mkAsset(0, 'GOV', 0, []);
        asset.isPayday = true;
        expect(canBuyAsset(asset, basePlayer)).toBe(false);
    });

    // --- Boundary & Edge Cases ---

    it('allows buying when money is EXACTLY equal to price', () => {
        const asset = mkAsset(1, 'AI', 200, []);
        // price is 500
        const player = { ...basePlayer, money: 500 };
        expect(canBuyAsset(asset, player)).toBe(true);
    });

    it('fails buying when money is 1 less than price', () => {
        const asset = mkAsset(1, 'AI', 200, []);
        // price is 500
        const player = { ...basePlayer, money: 499 };
        expect(canBuyAsset(asset, player)).toBe(false);
    });

    it('allows buying when exactly 1 share remains', () => {
        const asset = mkAsset(1, 'AI', 200, [
            { playerId: 1, shares: 1 },
            { playerId: 2, shares: 1 }
        ]);
        expect(asset.sharesRemaining).toBe(1);
        expect(canBuyAsset(asset, basePlayer)).toBe(true);
    });

    it('fails gracefully if player money is negative', () => {
        const asset = mkAsset(1, 'AI', 200, []);
        const player = { ...basePlayer, money: -500 };
        expect(canBuyAsset(asset, player)).toBe(false);
    });

    it('handles undefined asset gracefully', () => {
        expect(canBuyAsset(undefined, basePlayer)).toBe(false);
    });
});

import { getPlayerAssets, removePlayerShares } from './stockRules';

describe('Other Stock Rules', () => {
    const p1 = { id: 1, money: 1000 } as Player;
    const p2 = { id: 2, money: 1000 } as Player;

    describe('getPlayerAssets (Net Worth Calculation)', () => {
        it('calculates value correctly with mixed assets', () => {
            const board = [
                mkAsset(1, 'AI', 200, [{ playerId: 1, shares: 2 }]), // 2 * 500 = 1000
                mkAsset(2, 'GOV', 200, [{ playerId: 1, shares: 1 }]), // 1 * 500 = 500
                mkAsset(3, 'CHIPS', 200, [{ playerId: 2, shares: 3 }]) // Not owned by p1
            ];
            // Total Stock Value = 1500. Money = 1000. Total = 2500.
            expect(getPlayerAssets(p1, board)).toBe(2500);
        });

        it('returns only money if no assets owned', () => {
            const board = [mkAsset(1, 'AI', 200, [{ playerId: 2, shares: 3 }])];
            expect(getPlayerAssets(p1, board)).toBe(1000);
        });
    });

    describe('removePlayerShares (Bankruptcy/Clearing)', () => {
        it('removes all shares for a specific player and returns them to pool', () => {
            const initialBoard = [
                mkAsset(1, 'AI', 200, [
                    { playerId: 1, shares: 2 },
                    { playerId: 2, shares: 1 } // p2 keeps theirs
                ])
            ];
            // Initial state check
            expect(initialBoard[0].sharesRemaining).toBe(0); // 2+1=3 total

            const newBoard = removePlayerShares(initialBoard, 1);

            const asset = newBoard[0];
            // p1 should be gone
            expect(asset.shareholders.find(h => h.playerId === 1)).toBeUndefined();
            // p2 should remain
            const p2Share = asset.shareholders.find(h => h.playerId === 2);
            expect(p2Share?.shares).toBe(1);

            // Shares remaining should increase by 2 (the amount p1 held)
            expect(asset.sharesRemaining).toBe(2);
        });

        it('does nothing if player owns no shares', () => {
            const initialBoard = [mkAsset(1, 'AI', 200, [{ playerId: 2, shares: 3 }])];
            const newBoard = removePlayerShares(initialBoard, 1);
            expect(newBoard).toEqual(initialBoard);
        });
    });
});
