import { create } from 'zustand';
import { INITIAL_BOARD, Asset, Tag } from '../data/boardData';
import type { Player } from '@/types/game';
import { NewsCard } from '@/lib/types';
import { applyBankruptcyAndIpo } from '@/lib/ipo/ipoRules';
import { SHARE_PRICE, SHARE_VALUE } from '@/lib/stock/stockConstants';
import {
    canBuyAsset,
    getPlayerAssets,
    removePlayerShares,
    sellSharesForCash
} from '@/lib/stock/stockRules';
import { shouldComputerBuy } from '@/lib/players/playerRules';
import { playSound } from '@/lib/sound';

export { canBuyAsset } from '@/lib/stock/stockRules';

interface GameState {
    players: Player[];
    activePlayerIndex: number;
    turnCount: number;
    board: Asset[];
    dice: [number, number];
    isRolling: boolean;
    currentNews: NewsCard | null; // Changed from NewsEffect
    newsQueue: NewsCard[];       // Changed from NewsEffect
    newsLog: NewsCard[];         // Changed from NewsEffect
    lastDownTag: Tag | null;
    ipoIndex: number;
    hasRolled: boolean;
    isNewsReady: boolean;
    winner: Player | null;
    winningReason: string | null;

    // Actions
    rollDice: () => void;
    movePlayer: (steps: number) => void;
    nextTurn: () => void;
    checkGameEnd: () => void;
    triggerNews: () => void;
    fetchNews: (options?: {
        mode?: 'initial' | 'fill';
        initialCount?: number;
        chunkSize?: number;
    }) => Promise<void>;
    buyShare: (assetId: number) => void;
    sellShare: (assetId: number, amount?: number) => void;
    resolveTileEffect: (tile: Asset, player: Player) => void;
}

const MOCK_NEWS: NewsCard[] = [
    {
        id: 'mock-1',
        sourceTitle: 'System',
        type: 'MARKET',
        tag: 'GOV',
        title: 'Central Bank Hikes Rates',
        reason: 'To curb inflation.',
        direction: 'UP'
    }
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
        { id: 0, name: 'Human', money: 10000, position: 0, color: '#F5D304', isComputer: false, isAlive: true },
        { id: 1, name: 'CPU 1', money: 10000, position: 0, color: '#FDA3F5', isComputer: true, isAlive: true },
        { id: 2, name: 'CPU 2', money: 10000, position: 0, color: '#00E16D', isComputer: true, isAlive: true },
        { id: 3, name: 'CPU 3', money: 10000, position: 0, color: '#07A5E2', isComputer: true, isAlive: true },
    ],
    activePlayerIndex: 0,
    turnCount: 1,
    board: INITIAL_BOARD,
    dice: [1, 1],
    isRolling: false,
    hasRolled: false,
    isNewsReady: false,
    currentNews: null,
    newsQueue: [],
    newsLog: [],
    lastDownTag: null,
    ipoIndex: 0,
    winner: null,
    winningReason: null,

    rollDice: () => {
        const { turnCount, activePlayerIndex, triggerNews } = get();

        // Trigger news at the start of turn 1 (first player's first roll)
        if (turnCount === 1 && activePlayerIndex === 0 && !get().hasRolled && get().currentNews === null) {
            triggerNews();
        }

        const d1 = Math.floor(Math.random() * 6) + 1;
        // Set target dice immediately so UI can animate towards it
        set({ isRolling: true, dice: [d1, 1] });

        setTimeout(() => {
            set({ isRolling: false, hasRolled: true });
            get().movePlayer(d1);

            const { activePlayerIndex, players } = get();
            if (players[activePlayerIndex].isComputer) {
                setTimeout(() => runComputerTurn(get, activePlayerIndex), 1000);
            }
        }, 2500);
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

        if (passedGo) {
            const paydayNews: NewsCard = {
                id: `payday-${Date.now()}-${activePlayerIndex}`,
                sourceTitle: 'System',
                type: 'MARKET',
                tag: 'GOV',
                title: 'Payday! Salary Paid',
                reason: 'Passed Start Tile (+200)',
                direction: 'UP'
            };
            const { newsLog } = get();
            set({ players: updatedPlayers, newsLog: [paydayNews, ...newsLog] });
        } else {
            set({ players: updatedPlayers });
        }
        get().resolveTileEffect(board[newPos], updatedPlayers[activePlayerIndex]);
    },

    nextTurn: () => {
        const { activePlayerIndex, players, turnCount, triggerNews } = get();

        get().checkGameEnd();
        if (get().winner) return;

        let nextIndex = (activePlayerIndex + 1) % players.length;
        let safety = 0;
        while (!players[nextIndex].isAlive && safety < players.length) {
            nextIndex = (nextIndex + 1) % players.length;
            safety += 1;
        }

        const nextTurnCount = nextIndex === 0 ? turnCount + 1 : turnCount;

        set({
            activePlayerIndex: nextIndex,
            turnCount: nextTurnCount,
            hasRolled: false
        });

        // Trigger news once per full round (when it returns to first player)
        if (nextIndex === 0) {
            triggerNews();
        }

        if (players[nextIndex].isComputer) {
            // Wait for news overlay to finish (3s) before rolling
            setTimeout(() => get().rollDice(), 3500);
        }
    },

    triggerNews: () => {
        let { newsQueue, turnCount } = get();

        // Refill if getting low (background fetch)
        if (newsQueue.length < 15) {
            get().fetchNews({ mode: 'fill' });
        }

        const fallbackNews = newsQueue.length > 0 ? newsQueue[0] : MOCK_NEWS[0];
        const nextNews = newsQueue.length > 0 ? newsQueue[0] : fallbackNews;
        const remainingQueue = newsQueue.length > 0 ? newsQueue.slice(1) : [];

        // Determine Major/Minor: Major every 3rd turn (±200), Minor otherwise (±100)
        const isMajor = turnCount % 3 === 0;
        const amount = isMajor ? 200 : 100;

        // Apply News Effect to Board
        let newBoard = [...get().board];
        let lastDownTag: Tag | null = null;
        let effectTag: Tag | null = null;

        if (nextNews.type === 'MARKET' && nextNews.tag) {
            // MARKET news: use the LLM-assigned tag
            effectTag = nextNews.tag;
        } else if (nextNews.type === 'NOISE') {
            // NOISE news: 三択（暴騰、暴落、何も起きない）
            // 1/3: 暴騰、1/3: 暴落、1/3: 何も起きない
            const noiseRand = Math.random();
            if (noiseRand < 0.33) {
                // 何も起きない
                effectTag = null;
            } else {
                // 暴騰 or 暴落 - ランダムなタグを選択
                const tagRand = Math.random();
                if (tagRand < 0.40) effectTag = 'CRYPTO';
                else if (tagRand < 0.70) effectTag = 'MEDIA';
                else if (tagRand < 0.80) effectTag = 'AI';
                else if (tagRand < 0.90) effectTag = 'CHIPS';
                else if (tagRand < 0.95) effectTag = 'ENERGY';
                else effectTag = 'GOV';

                // 暴騰か暴落かを決定（残りの2/3を半分ずつ）
                nextNews.direction = noiseRand < 0.66 ? 'UP' : 'DOWN';
            }
        }

        if (effectTag) {
            // Determine direction: use LLM direction if available, else 50/50
            const isUp = nextNews.direction === 'UP' ? true :
                nextNews.direction === 'DOWN' ? false :
                    Math.random() < 0.5;

            // NOISEの場合は暴騰/暴落なので大きな変動（+/-300）
            const noiseAmount = nextNews.type === 'NOISE' ? 300 : amount;

            if (!isUp) {
                lastDownTag = effectTag;
            }

            newBoard = newBoard.map(asset => {
                if (asset.tag === effectTag && !asset.isBankrupt && !asset.isPayday) {
                    const change = isUp ? noiseAmount : -noiseAmount;
                    const newDividend = Math.max(0, asset.dividend + change);

                    // Stock Price Logic: Change is 2x Dividend Change
                    // If Dividend becomes 0 (Bankrupt), Price becomes 0
                    let newPrice = 0;
                    if (newDividend > 0) {
                        const priceChange = change * 2;
                        newPrice = Math.max(0, asset.price + priceChange);
                    }

                    return {
                        ...asset,
                        previousDividend: asset.dividend,
                        dividend: newDividend,
                        previousPrice: asset.price,
                        price: newPrice
                    };
                }
                // effectTagに関係ないアセットもpreviousリセット
                return {
                    ...asset,
                    previousDividend: asset.dividend,
                    previousPrice: asset.price
                };
            });
        } else {
            // 効果なしの場合もpreviousリセット
            newBoard = newBoard.map(asset => ({
                ...asset,
                previousDividend: asset.dividend,
                previousPrice: asset.price
            }));
        }

        // Apply Bankruptcy & IPO Rules
        const applied = applyBankruptcyAndIpo(newBoard, get().ipoIndex);

        set(state => ({
            currentNews: nextNews,
            newsQueue: remainingQueue,
            newsLog: [nextNews, ...state.newsLog],
            board: applied.board,
            ipoIndex: applied.ipoIndex,
            lastDownTag: lastDownTag || state.lastDownTag
        }));
    },

    fetchNews: async (options) => {
        const mode = options?.mode ?? 'fill';
        const initialCount = options?.initialCount ?? 5;
        const chunkSize = options?.chunkSize ?? 5;

        const enqueueInChunks = (items: NewsCard[], size: number) => {
            if (items.length === 0) return;
            const chunk = items.slice(0, size);
            const rest = items.slice(size);
            set(state => ({ newsQueue: [...state.newsQueue, ...chunk] }));
            if (rest.length > 0) {
                setTimeout(() => enqueueInChunks(rest, size), 300);
            }
        };

        try {
            const res = await fetch(`/api/news?mode=${mode}`);
            const data = await res.json();

            // Validate it's an array
            const newItems = Array.isArray(data) ? data : [];

            if (mode === 'initial') {
                const initialItems = newItems.slice(0, initialCount);
                const remaining = newItems.slice(initialCount);
                set(state => ({
                    newsQueue: [...state.newsQueue, ...initialItems],
                    isNewsReady: true
                }));
                enqueueInChunks(remaining, chunkSize);
                return;
            }

            set(state => ({
                newsQueue: [...state.newsQueue, ...newItems],
                isNewsReady: true
            }));
        } catch (err) {
            console.error("Failed to fetch news", err);
            // Fallback
            console.warn("Using mock news as fallback");
            if (mode === 'initial') {
                const initialItems = MOCK_NEWS.slice(0, initialCount);
                const remaining = MOCK_NEWS.slice(initialCount);
                set(state => ({
                    newsQueue: [...state.newsQueue, ...initialItems],
                    isNewsReady: true
                }));
                enqueueInChunks(remaining, chunkSize);
                return;
            }

            set(state => ({
                newsQueue: [...state.newsQueue, ...MOCK_NEWS],
                isNewsReady: true
            }));
        }
    },

    buyShare: (assetId) => {
        const { players, activePlayerIndex, board } = get();
        const player = players[activePlayerIndex];
        const asset = board.find(t => t.id === assetId);

        if (!asset) return;
        if (!canBuyAsset(asset, player)) return;

        // Buy at current Market Price, not fixed share price
        // Check if player has enough money for current price
        if (player.money < asset.price) return;

        const updatedPlayers = [...players];
        updatedPlayers[activePlayerIndex] = { ...player, money: player.money - asset.price };

        const updatedBoard = board.map(t => {
            if (t.id !== assetId) return t;
            const existing = t.shareholders.find(h => h.playerId === player.id);
            const newShareholders = existing
                ? t.shareholders.map(h => {
                    if (h.playerId !== player.id) return h;
                    // 追加購入：平均購入配当を計算
                    const totalShares = h.shares + 1;
                    const avgPurchaseDividend = Math.round(
                        (h.purchaseDividend * h.shares + t.dividend) / totalShares
                    );
                    return { ...h, shares: totalShares, purchaseDividend: avgPurchaseDividend };
                })
                : [...t.shareholders, { playerId: player.id, shares: 1, purchaseDividend: t.dividend }];
            return {
                ...t,
                sharesRemaining: Math.max(0, t.sharesRemaining - 1),
                shareholders: newShareholders
            };
        });

        set({ players: updatedPlayers, board: updatedBoard });
    },

    sellShare: (assetId, amount = 1) => {
        const { players, activePlayerIndex, board, hasRolled } = get();

        // Only allow selling before rolling dice
        if (hasRolled) return;

        const player = players[activePlayerIndex];
        const asset = board.find(t => t.id === assetId);

        if (!asset) return;

        // Check if player owns enough shares
        const holding = asset.shareholders.find(h => h.playerId === player.id);
        if (!holding || holding.shares < amount) return;

        // Sell at current Market Price
        const totalValue = asset.price * amount;
        const updatedPlayers = [...players];
        updatedPlayers[activePlayerIndex] = { ...player, money: player.money + totalValue };

        const updatedBoard = board.map(t => {
            if (t.id !== assetId) return t;
            const newShareholders = t.shareholders
                .map(h => h.playerId === player.id ? { ...h, shares: h.shares - amount } : h)
                .filter(h => h.shares > 0);
            return {
                ...t,
                sharesRemaining: Math.min(t.sharesTotal, t.sharesRemaining + amount),
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
        playSound('share-pay', 0.5);
        playSound('share-gain', 0.5);
        set({ players: distributedPlayers, board: applied.board, ipoIndex: applied.ipoIndex });
    }
}));
