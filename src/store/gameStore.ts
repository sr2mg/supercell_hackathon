import { create } from 'zustand';
import { INITIAL_BOARD, Tile } from '../data/boardData';

export interface Player {
    id: number;
    name: string;
    money: number;
    position: number;
    color: string;
    inJail: boolean;
    isComputer: boolean;
    bankruptcy: boolean;
}

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
    board: Tile[];
    dice: [number, number];
    isRolling: boolean;
    currentNews: NewsEffect | null;
    newsQueue: NewsEffect[];
    newsLog: NewsEffect[];
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
    buyProperty: (tileId: number) => void;
    resolveTileEffect: (tile: Tile, player: Player) => void;
}

const MOCK_NEWS: NewsEffect[] = [
    { title: "Central Bank Hikes Rates", description: "Rents increase by 50%!", type: 'RENT_HIKE', multiplier: 1.5 },
    { title: "Market Crash!", description: "Property prices drop by 50%.", type: 'PRICE_DROP', multiplier: 0.5 },
    { title: "Blackout!", description: "Utilities are offline. No rent for them.", type: 'UTILITY_FAIL', multiplier: 0 },
];

function getPlayerAssets(player: Player, board: Tile[]): number {
    const propValue = board
        .filter(t => t.owner === player.id)
        .reduce((acc, t) => acc + (t.price || 0), 0);
    return player.money + propValue;
}

export function canBuyTile(tile: Tile | undefined, player: Player): boolean {
    if (!tile) return false;
    return tile.type === 'PROPERTY' &&
        tile.owner == null &&
        !!tile.price &&
        player.money >= tile.price;
}

function runComputerTurn(get: () => GameState, activePlayerIndex: number) {
    const { board, buyProperty, nextTurn, players, currentNews } = get();
    const p = players[activePlayerIndex];
    const tile = board[p.position];

    console.log(`[AI] ${p.name} landed on ${tile.name} (${tile.type})`);

    if (canBuyTile(tile, p)) {
        const shouldBuy = shouldComputerBuy(p, tile, currentNews, board);
        if (shouldBuy) {
            console.log(`[AI] Decided to buy ${tile.name}`);
            buyProperty(tile.id);
        } else {
            console.log(`[AI] Decided NOT to buy ${tile.name}`);
        }
    }

    setTimeout(() => nextTurn(), 1500);
}

function shouldComputerBuy(player: Player, tile: Tile, currentNews: NewsEffect | null, board: Tile[]): boolean {
    if (!tile.price || tile.owner != null) return false;
    if (player.money < tile.price) return false;

    let reserve = 300;

    if (currentNews) {
        switch (currentNews.type) {
            case 'RENT_HIKE':
                reserve = 100;
                break;
            case 'PRICE_DROP':
                reserve = 0;
                break;
            case 'UTILITY_FAIL':
                reserve = 500;
                break;
        }
    }

    if (tile.group) {
        const ownedInGroup = board.filter(t => t.group === tile.group && t.owner === player.id);
        if (ownedInGroup.length > 0) {
            return true;
        }
    }

    if (tile.price <= 200) {
        return true;
    }

    return (player.money - tile.price) >= reserve;
}

export const useGameStore = create<GameState>((set, get) => ({
    players: [
        { id: 0, name: 'Player 1', money: 1500, position: 0, color: 'bg-red-500', inJail: false, isComputer: false, bankruptcy: false },
        { id: 1, name: 'Computer', money: 1500, position: 0, color: 'bg-blue-500', inJail: false, isComputer: true, bankruptcy: false },
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
    winner: null,
    winningReason: null,

    rollDice: () => {
        set({ isRolling: true });
        setTimeout(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            set({ dice: [d1, d2], isRolling: false, hasRolled: true });
            get().movePlayer(d1 + d2);

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

        const nextIndex = (activePlayerIndex + 1) % players.length;

        set({
            activePlayerIndex: nextIndex,
            turnCount: turnCount + 1,
            hasRolled: false
        });

        if (players[nextIndex].inJail) {
            const newerPlayers = [...get().players];
            newerPlayers[nextIndex] = { ...newerPlayers[nextIndex], inJail: false };
            set({ players: newerPlayers });
            console.log(`Player ${players[nextIndex].name} is in Layoff/Jail. Skipping.`);
            setTimeout(() => get().nextTurn(), 1500);
            return;
        }

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
            set(state => ({
                currentNews: nextNews,
                newsQueue: remainingQueue,
                newsLog: [nextNews, ...state.newsLog]
            }));
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

    buyProperty: (tileId) => {
        const { players, activePlayerIndex, board } = get();
        const player = players[activePlayerIndex];
        const tile = board.find(t => t.id === tileId);

        if (tile && tile.price && tile.owner == null && player.money >= tile.price) {
            const newPlayers = [...players];
            newPlayers[activePlayerIndex] = { ...player, money: player.money - tile.price };

            const newBoard = board.map(t => t.id === tileId ? { ...t, owner: player.id } : t);
            set({ players: newPlayers, board: newBoard });
        }
    },

    checkGameEnd: () => {
        const { players, turnCount, board } = get();

        // 1. Bankruptcy Check
        const activePlayers = players.filter(p => p.money > 0 || !p.bankruptcy);
        if (activePlayers.length === 1) {
            set({ winner: activePlayers[0], winningReason: "Last Entrepeneur Standing!" });
            return;
        }

        // 2. Turn Limit (20 turns)
        if (turnCount >= 20) {
            const sorted = [...players].sort((a, b) => getPlayerAssets(b, board) - getPlayerAssets(a, board));
            set({ winner: sorted[0], winningReason: "Market Leader (20 Turns)" });
            return;
        }

        // 3. Wealth Goal ($5000)
        const wealthy = players.find(p => getPlayerAssets(p, board) >= 5000);
        if (wealthy) {
            set({ winner: wealthy, winningReason: "Unicorn Status Achieved ($5k Assets)" });
        }
    },

    resolveTileEffect: (tile, player) => {
        const { board } = get();
        const updatePlayer = (p: Player, updates: Partial<Player>) => {
            const currentPlayers = get().players;
            const newPlayers = currentPlayers.map(pl => pl.id === p.id ? { ...pl, ...updates } : pl);
            set({ players: newPlayers });
        };

        console.log(`Resolving effect ${tile.effect || tile.type} for ${player.name}`);

        switch (tile.effect) {
            case 'SKIP_TURN':
                updatePlayer(player, { inJail: true });
                break;
            case 'INTEREST_TRAP': {
                const interest = Math.floor(player.money * 0.1);
                updatePlayer(player, { money: player.money - interest });
                break;
            }
            case 'BAILOUT':
                if (player.money < 0) {
                    updatePlayer(player, { money: 0 });
                } else {
                    updatePlayer(player, { money: player.money + 100 });
                }
                break;
            case 'BANKRUPTCY': {
                const owned = board.filter(t => t.owner === player.id);
                if (owned.length > 0) {
                    const mostExpensive = owned.sort((a, b) => (b.price || 0) - (a.price || 0))[0];
                    const sellPrice = Math.floor((mostExpensive.price || 0) * 0.5);

                    const newBoard = board.map(t => t.id === mostExpensive.id ? { ...t, owner: null } : t);
                    const currentPlayers = get().players;
                    const newPlayers = currentPlayers.map(pl => pl.id === player.id ? { ...pl, money: pl.money + sellPrice } : pl);

                    set({ board: newBoard, players: newPlayers });
                    console.log(`Bankruptcy Court: Sold ${mostExpensive.name} for ${sellPrice}`);
                }
                break;
            }
            case 'CRYPTO_VOLATILITY': {
                const change = Math.floor(Math.random() * 200) - 100;
                updatePlayer(player, { money: player.money + change });
                break;
            }
        }
    }
}));
