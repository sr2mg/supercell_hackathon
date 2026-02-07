import { create } from 'zustand';
import { INITIAL_BOARD, Asset, Tag } from '../data/boardData';
import type { Player } from '@/types/game';
import { applyBankruptcyAndIpo } from '@/lib/ipo/ipoRules';
import { SHARE_PRICE } from '@/lib/stock/stockConstants';
import {
    canBuyAsset,
    getPlayerAssets,
    removePlayerShares,
    sellSharesForCash
} from '@/lib/stock/stockRules';
import { shouldComputerBuy } from '@/lib/players/playerRules';

export { canBuyAsset } from '@/lib/stock/stockRules';

export interface NewsEffect {
    title: string;
    description: string;
    type: 'RENT_HIKE' | 'PRICE_DROP' | 'UTILITY_FAIL' | 'NONE';
    multiplier?: number;
}

interface GameState {
    players: Player[];
    activePlayerIndex: number;
    turnCount: number;
    board: Asset[];
    dice: [number, number];
    isRolling: boolean;
    currentNews: NewsEffect | null;
    newsQueue: NewsEffect[];
    newsLog: NewsEffect[];
    lastDownTag: Tag | null;
    ipoIndex: number;
    hasRolled: boolean;
    winner: Player | null;
    winningReason: string | null;

    // Actions
    rollDice: () => void;
    movePlayer: (steps: number) => void;
    nextTurn: () => void;
    checkGameEnd: () => void;
    triggerNews: () => void;
    fetchNews: () => Promise<void>;
    buyShare: (assetId: number) => void;
    resolveTileEffect: (tile: Asset, player: Player) => void;
}

const MOCK_NEWS: NewsEffect[] = [
    { title: "Central Bank Hikes Rates", description: "Rents increase by 50%!", type: 'RENT_HIKE', multiplier: 1.5 },
    { title: "Market Crash!", description: "Property prices drop by 50%.", type: 'PRICE_DROP', multiplier: 0.5 },
    { title: "Blackout!", description: "Utilities are offline. No rent for them.", type: 'UTILITY_FAIL', multiplier: 0 },
];


function runComputerTurn(get: () => GameState, activePlayerIndex: number) {
    const { board, buyShare, nextTurn, players } = get();
    const p = players[activePlayerIndex];
    const asset = board[p.position];

    console.log(`[AI] ${p.name} landed on ${asset.name}`);

    if (canBuyAsset(asset, p)) {
        const shouldBuy = shouldComputerBuy(p, asset);
        if (shouldBuy) {
            console.log(`[AI] Decided to buy a share of ${asset.name}`);
            buyShare(asset.id);
        } else {
            console.log(`[AI] Decided NOT to buy a share of ${asset.name}`);
        }
    }

    setTimeout(() => nextTurn(), 1500);
}


export const useGameStore = create<GameState>((set, get) => ({
    players: [
        { id: 0, name: 'Human', money: 10000, position: 0, color: 'bg-red-500', isComputer: false, isAlive: true },
        { id: 1, name: 'CPU 1', money: 10000, position: 0, color: 'bg-blue-500', isComputer: true, isAlive: true },
        { id: 2, name: 'CPU 2', money: 10000, position: 0, color: 'bg-green-500', isComputer: true, isAlive: true },
        { id: 3, name: 'CPU 3', money: 10000, position: 0, color: 'bg-yellow-500', isComputer: true, isAlive: true },
    ],
    activePlayerIndex: 0,
    turnCount: 1,
    board: INITIAL_BOARD,
    dice: [1, 1],
    isRolling: false,
    hasRolled: false,
    currentNews: null,
    newsQueue: [],
    newsLog: [],
    lastDownTag: null,
    ipoIndex: 0,
    winner: null,
    winningReason: null,

    rollDice: () => {
        set({ isRolling: true });
        setTimeout(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            set({ dice: [d1, 1], isRolling: false, hasRolled: true });
            get().movePlayer(d1);

            const { activePlayerIndex, players } = get();
            if (players[activePlayerIndex].isComputer) {
                setTimeout(() => runComputerTurn(get, activePlayerIndex), 1000);
            }
        }, 600);
    },

    movePlayer: (steps) => {
        const { players, activePlayerIndex, board } = get();
        const player = players[activePlayerIndex];

        let newPos = player.position + steps;
        const passedGo = newPos >= board.length;
        newPos = newPos % board.length;

        const updatedPlayers = [...players];
        updatedPlayers[activePlayerIndex] = {
            ...player,
            position: newPos,
            money: player.money + (passedGo ? 200 : 0),
        };
        set({ players: updatedPlayers });
        get().resolveTileEffect(board[newPos], updatedPlayers[activePlayerIndex]);
    },

    nextTurn: () => {
        const { activePlayerIndex, players, turnCount, triggerNews } = get();
        triggerNews();

        get().checkGameEnd();
        if (get().winner) return;

        let nextIndex = (activePlayerIndex + 1) % players.length;
        let safety = 0;
        while (!players[nextIndex].isAlive && safety < players.length) {
            nextIndex = (nextIndex + 1) % players.length;
            safety += 1;
        }

        set({
            activePlayerIndex: nextIndex,
            turnCount: turnCount + 1,
            hasRolled: false
        });

        if (players[nextIndex].isComputer) {
            setTimeout(() => get().rollDice(), 1000);
        }
    },

    triggerNews: () => {
        let { newsQueue } = get();

        // Refill if getting low (background fetch)
        if (newsQueue.length < 5) {
            get().fetchNews();
        }

        // If completely empty, try to fetch/wait? 
        // For simplicity, if empty, we might skip update or use fallback immediately if fetch feels too slow.
        // But since we trigger fetch on init, it should be fine.

        if (newsQueue.length > 0) {
            const [nextNews, ...remainingQueue] = newsQueue;
            set(state => {
                const applied = applyBankruptcyAndIpo(state.board, state.ipoIndex);
                return {
                    currentNews: nextNews,
                    newsQueue: remainingQueue,
                    newsLog: [nextNews, ...state.newsLog],
                    board: applied.board,
                    ipoIndex: applied.ipoIndex
                };
            });
        } else {
            // If truly empty, maybe fetch synchronously-ish or await?
            // But valid flow is: background fetch should have caught up.
            // If not, we just don't update news this micro-turn.
            get().fetchNews();
        }
    },

    fetchNews: async () => {
        try {
            const res = await fetch('/api/news');
            const data = await res.json();

            // Validate it's an array
            const newItems = Array.isArray(data) ? data : [];

            set(state => ({
                newsQueue: [...state.newsQueue, ...newItems]
            }));
        } catch (err) {
            console.error("Failed to fetch news", err);
            // Fallback
            set(state => ({
                newsQueue: [...state.newsQueue, ...MOCK_NEWS]
            }));
        }
    },

    buyShare: (assetId) => {
        const { players, activePlayerIndex, board } = get();
        const player = players[activePlayerIndex];
        const asset = board.find(t => t.id === assetId);

        if (!asset) return;
        if (!canBuyAsset(asset, player)) return;

        const updatedPlayers = [...players];
        updatedPlayers[activePlayerIndex] = { ...player, money: player.money - SHARE_PRICE };

        const updatedBoard = board.map(t => {
            if (t.id !== assetId) return t;
            const existing = t.shareholders.find(h => h.playerId === player.id);
            const newShareholders = existing
                ? t.shareholders.map(h => h.playerId === player.id ? { ...h, shares: h.shares + 1 } : h)
                : [...t.shareholders, { playerId: player.id, shares: 1 }];
            return {
                ...t,
                sharesRemaining: Math.max(0, t.sharesRemaining - 1),
                shareholders: newShareholders
            };
        });

        set({ players: updatedPlayers, board: updatedBoard });
    },

    checkGameEnd: () => {
        const { players, turnCount, board } = get();

        const activePlayers = players.filter(p => p.isAlive);
        if (activePlayers.length === 1) {
            set({ winner: activePlayers[0], winningReason: "Last Survivor" });
            return;
        }

        if (turnCount >= 15) {
            const sorted = [...players].sort((a, b) => getPlayerAssets(b, board) - getPlayerAssets(a, board));
            set({ winner: sorted[0], winningReason: "Net Worth Leader (15 Turns)" });
            return;
        }
    },

    resolveTileEffect: (tile, player) => {
        if (!player.isAlive) return;
        if (tile.isPayday) return;
        if (tile.isBankrupt) return;
        const dividend = tile.dividend;
        if (dividend <= 0) return;

        const { players, board, lastDownTag } = get();

        const payer = players.find(p => p.id === player.id);
        if (!payer) return;

        // Auto-sell before paying if needed
        const sale = payer.money < dividend
            ? sellSharesForCash(payer, board, dividend, lastDownTag)
            : { ok: true, cash: payer.money, board };

        if (!sale.ok) {
            // Bankrupt: remove player and liquidate remaining shares
            const clearedBoard = removePlayerShares(sale.board, payer.id);
            const updatedPlayers = players.map(p => p.id === payer.id ? { ...p, isAlive: false, money: 0 } : p);
            set({ players: updatedPlayers, board: clearedBoard });
            return;
        }

        const totalShares = tile.shareholders.reduce((acc, h) => acc + h.shares, 0);

        const updatedPlayers = players.map(p => {
            if (p.id === payer.id) {
                return { ...p, money: sale.cash - dividend };
            }
            return p;
        });

        if (totalShares === 0) {
            set({ players: updatedPlayers, board: sale.board });
            return;
        }

        const perShare = Math.floor(dividend / totalShares);
        const distributedPlayers = updatedPlayers.map(p => {
            const owned = tile.shareholders.find(h => h.playerId === p.id)?.shares || 0;
            if (owned === 0) return p;
            return { ...p, money: p.money + (owned * perShare) };
        });

        const applied = applyBankruptcyAndIpo(sale.board, get().ipoIndex);
        set({ players: distributedPlayers, board: applied.board, ipoIndex: applied.ipoIndex });
    }
}));
