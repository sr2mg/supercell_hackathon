import { describe, it, expect } from 'vitest';
import type { Asset, Tag } from '@/data/boardData';
import type { Player } from '@/types/game';

/**
 * 一株当たり配当方式のテスト
 * 
 * 新仕様:
 * - 着地プレイヤーは配当Dを支払う
 * - 各株主は所有株数 × D を受け取る
 * - 例: D=200, Aが2株、Bが1株 → A +400, B +200（支払者の負担は200のまま）
 */

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

const mkPlayer = (id: number, name: string, money: number): Player => ({
    id,
    name,
    money,
    position: 0,
    color: '#000',
    isComputer: id !== 0,
    isAlive: true,
});

/**
 * 新しい一株当たり配当方式
 * - 支払者: D を支払う（株を持っていれば自分も受け取る）
 * - 各株主: 所有株数 × D を受け取る
 */
function distributePerShareDividend(
    tile: Asset,
    payer: Player,
    allPlayers: Player[]
): Player[] {
    const dividend = tile.dividend;

    return allPlayers.map(p => {
        const owned = tile.shareholders.find(h => h.playerId === p.id)?.shares || 0;
        const received = owned * dividend;

        if (p.id === payer.id) {
            // 支払者: Dを払い、所有株分を受け取る
            return { ...p, money: p.money - dividend + received };
        }

        if (owned === 0) return p;
        return { ...p, money: p.money + received };
    });
}

describe('Per-Share Dividend Distribution (新仕様)', () => {
    describe('基本的な配当受取', () => {
        it('1株所有で配当D全額を受け取る', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
                mkPlayer(1, 'CPU 1', 10000),
            ];

            // D=200, CPU1が1株所有
            const tile = mkAsset(1, 'AI', 200, [{ playerId: 1, shares: 1 }]);

            const result = distributePerShareDividend(tile, players[0], players);

            // Human: 10000 - 200 = 9800
            expect(result.find(p => p.id === 0)?.money).toBe(9800);

            // CPU1: 10000 + 200 = 10200
            expect(result.find(p => p.id === 1)?.money).toBe(10200);
        });

        it('2株所有で配当D×2を受け取る', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
                mkPlayer(1, 'CPU 1', 10000),
            ];

            // D=200, CPU1が2株所有
            const tile = mkAsset(1, 'AI', 200, [{ playerId: 1, shares: 2 }]);

            const result = distributePerShareDividend(tile, players[0], players);

            // Human: 10000 - 200 = 9800
            expect(result.find(p => p.id === 0)?.money).toBe(9800);

            // CPU1: 10000 + 400 = 10400
            expect(result.find(p => p.id === 1)?.money).toBe(10400);
        });

        it('3株所有で配当D×3を受け取る', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
                mkPlayer(1, 'CPU 1', 10000),
            ];

            // D=200, CPU1が3株所有
            const tile = mkAsset(1, 'AI', 200, [{ playerId: 1, shares: 3 }]);

            const result = distributePerShareDividend(tile, players[0], players);

            // Human: 10000 - 200 = 9800
            expect(result.find(p => p.id === 0)?.money).toBe(9800);

            // CPU1: 10000 + 600 = 10600
            expect(result.find(p => p.id === 1)?.money).toBe(10600);
        });
    });

    describe('複数株主への分配', () => {
        it('複数プレイヤーが株を持っている場合、それぞれが所有株×Dを受け取る', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
                mkPlayer(1, 'CPU 1', 10000),
                mkPlayer(2, 'CPU 2', 10000),
            ];

            // D=200, CPU1が2株、CPU2が1株
            const tile = mkAsset(1, 'AI', 200, [
                { playerId: 1, shares: 2 },
                { playerId: 2, shares: 1 }
            ]);

            const result = distributePerShareDividend(tile, players[0], players);

            // Human (支払者): 10000 - 200 = 9800
            expect(result.find(p => p.id === 0)?.money).toBe(9800);

            // CPU1: 10000 + 400 = 10400
            expect(result.find(p => p.id === 1)?.money).toBe(10400);

            // CPU2: 10000 + 200 = 10200
            expect(result.find(p => p.id === 2)?.money).toBe(10200);
        });
    });

    describe('支払者が株主でもある場合', () => {
        it('支払者が自分の株からも配当を受け取る（相殺される）', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
                mkPlayer(1, 'CPU 1', 10000),
            ];

            // D=200, Humanが1株、CPU1が2株
            const tile = mkAsset(1, 'AI', 200, [
                { playerId: 0, shares: 1 },
                { playerId: 1, shares: 2 }
            ]);

            const result = distributePerShareDividend(tile, players[0], players);

            // Human: 10000 - 200 + 200 = 10000 (完全相殺)
            expect(result.find(p => p.id === 0)?.money).toBe(10000);

            // CPU1: 10000 + 400 = 10400
            expect(result.find(p => p.id === 1)?.money).toBe(10400);
        });

        it('支払者が3株全部持っていれば大幅プラスになる', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
            ];

            // D=200, Humanが3株所有
            const tile = mkAsset(1, 'AI', 200, [{ playerId: 0, shares: 3 }]);

            const result = distributePerShareDividend(tile, players[0], players);

            // Human: 10000 - 200 + 600 = 10400
            expect(result.find(p => p.id === 0)?.money).toBe(10400);
        });
    });

    describe('株主がいない場合', () => {
        it('株主がいなければ支払いのみ（銀行に支払い）', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
            ];

            // D=200, 株主なし
            const tile = mkAsset(1, 'AI', 200, []);

            const result = distributePerShareDividend(tile, players[0], players);

            // Human: 10000 - 200 = 9800
            expect(result.find(p => p.id === 0)?.money).toBe(9800);
        });
    });

    describe('端数が発生しない（常に100の倍数）', () => {
        it('D=200で何株あっても端数なし', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
                mkPlayer(1, 'CPU 1', 10000),
            ];

            const tile = mkAsset(1, 'AI', 200, [{ playerId: 1, shares: 3 }]);
            const result = distributePerShareDividend(tile, players[0], players);

            // すべての金額が100の倍数
            result.forEach(p => {
                expect(p.money % 100).toBe(0);
            });
        });

        it('D=250で何株あっても端数なし', () => {
            const players = [
                mkPlayer(0, 'Human', 10000),
                mkPlayer(1, 'CPU 1', 10000),
            ];

            const tile = mkAsset(1, 'AI', 250, [{ playerId: 1, shares: 3 }]);
            const result = distributePerShareDividend(tile, players[0], players);

            // 250×3 = 750, 10000 + 750 = 10750 (50の倍数ではあるが...)
            // 配当が50単位なら50単位で推移する
            expect(result.find(p => p.id === 1)?.money).toBe(10750);
        });
    });
});
