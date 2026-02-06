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
    buyProperty: (tileId: number) => void;
    resolveTileEffect: (tile: Tile, player: Player) => void;
}

const MOCK_NEWS: NewsEffect[] = [
    { title: "Central Bank Hikes Rates", description: "Rents increase by 50%!", type: 'RENT_HIKE', multiplier: 1.5 },
    { title: "Market Crash!", description: "Property prices drop by 50%.", type: 'PRICE_DROP', multiplier: 0.5 },
    { title: "Blackout!", description: "Utilities are offline. No rent for them.", type: 'UTILITY_FAIL', multiplier: 0 },
];

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
    newsLog: [],
    winner: null,
    winningReason: null,

    rollDice: () => {
        set({ isRolling: true });
        // Mock simulation delay
        setTimeout(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            set({ dice: [d1, d2], isRolling: false, hasRolled: true });
            get().movePlayer(d1 + d2);

            // Computer AI Logic
            const { activePlayerIndex, players } = get();
            const currentPlayer = players[activePlayerIndex];

            if (currentPlayer.isComputer) {
                setTimeout(() => {
                    const { board, buyProperty, nextTurn, players: updatedPlayers, currentNews } = get();
                    const p = updatedPlayers[activePlayerIndex];
                    const tile = board[p.position];

                    console.log(`[AI] ${p.name} landed on ${tile.name} (${tile.type})`);

                    // Intelligent AI Buying decision
                    if (tile.type === 'PROPERTY' && tile.id !== undefined) {
                        const shouldBuy = shouldComputerBuy(p, tile, currentNews, board);
                        if (shouldBuy) {
                            console.log(`[AI] Decided to buy ${tile.name}`);
                            buyProperty(tile.id);
                        } else {
                            console.log(`[AI] Decided NOT to buy ${tile.name}`);
                        }
                    }

                    // End turn
                    setTimeout(() => {
                        nextTurn();
                    }, 1500);
                }, 1000);
            }
        }, 600);
    },

    movePlayer: (steps) => {
        const { players, activePlayerIndex, board } = get();
        const player = players[activePlayerIndex];

        // Calculate new position
        let newPos = player.position + steps;
        // Pass GO logic
        if (newPos >= board.length) {
            newPos = newPos % board.length;
            // Add money for passing GO (mock)
            const updatedPlayers = [...players];
            updatedPlayers[activePlayerIndex] = {
                ...player,
                money: player.money + 200,
                position: newPos
            };
            set({ players: updatedPlayers });
            // New Position Tile handled below
            get().resolveTileEffect(board[newPos], updatedPlayers[activePlayerIndex]);
        } else {
            const updatedPlayers = [...players];
            updatedPlayers[activePlayerIndex] = { ...player, position: newPos };
            set({ players: updatedPlayers });
            get().resolveTileEffect(board[newPos], updatedPlayers[activePlayerIndex]);
        }
    },

    nextTurn: () => {
        const { activePlayerIndex, players, turnCount, triggerNews } = get();
        // Check if news should trigger
        // Debug mode: Trigger every turn
        triggerNews();

        get().checkGameEnd();
        if (get().winner) return; // Stop if game over

        const nextIndex = (activePlayerIndex + 1) % players.length;

        set({
            activePlayerIndex: nextIndex,
            turnCount: turnCount + 1,
            hasRolled: false
        });

        if (players[nextIndex].inJail) {
            const newerPlayers = [...get().players]; // Fetch fresh state just in case
            newerPlayers[nextIndex].inJail = false; // Served time
            set({ players: newerPlayers });
            console.log(`Player ${players[nextIndex].name} is in Layoff/Jail. Skipping.`);
            setTimeout(() => {
                get().nextTurn();
            }, 1500);
            return;
        }

        // Trigger Computer Turn
        if (players[nextIndex].isComputer) {
            setTimeout(() => {
                get().rollDice();
            }, 1000);
        }
    },

    triggerNews: async () => {
        try {
            const res = await fetch('/api/news');
            const news = await res.json();

            // Adapt API response to NewsEffect interface
            const newEffect: NewsEffect = {
                title: news.title,
                description: news.description,
                type: news.type as any, // Cast for safety or validate
                multiplier: news.multiplier
            };

            set(state => ({
                currentNews: newEffect,
                newsLog: [newEffect, ...state.newsLog]
            }));
        } catch (err) {
            console.error("Failed to fetch news", err);
            // Fallback to local mock if API fails completely
            const randomNews = MOCK_NEWS[Math.floor(Math.random() * MOCK_NEWS.length)];
            set(state => ({
                currentNews: randomNews,
                newsLog: [randomNews, ...state.newsLog]
            }));
        }
    },

    buyProperty: (tileId) => {
        const { players, activePlayerIndex, board } = get();
        const player = players[activePlayerIndex];
        const tile = board.find(t => t.id === tileId);

        if (tile && tile.price && !tile.owner && player.money >= tile.price) {
            const newPlayers = [...players];
            newPlayers[activePlayerIndex].money -= tile.price;

            const newBoard = board.map(t => t.id === tileId ? { ...t, owner: player.id } : t);
            set({ players: newPlayers, board: newBoard });
        }
    },

    checkGameEnd: () => {
        const { players, turnCount, board } = get();

        // 1. Bankruptcy Check
        const activePlayers = players.filter(p => p.money > 0 || !p.bankruptcy); // Simplified
        if (activePlayers.length === 1) {
            set({ winner: activePlayers[0], winningReason: "Last Entrepeneur Standing!" });
            return;
        }

        // 2. Turn Limit (20 turns)
        if (turnCount >= 20) {
            // Calc assets
            const getAssets = (p: Player) => {
                const props = board.filter(t => t.owner === p.id);
                const propValue = props.reduce((acc, t) => acc + (t.price || 0), 0);
                return p.money + propValue;
            };

            const sorted = [...players].sort((a, b) => getAssets(b) - getAssets(a));
            set({ winner: sorted[0], winningReason: "Market Leader (20 Turns)" });
            return;
        }

        // 3. Wealth Goal ($5000)
        const wealthy = players.find(p => {
            const props = board.filter(t => t.owner === p.id);
            const assets = p.money + props.reduce((acc, t) => acc + (t.price || 0), 0);
            return assets >= 5000;
        });

        if (wealthy) {
            set({ winner: wealthy, winningReason: "Unicorn Status Achieved ($5k Assets)" });
        }
    },

    resolveTileEffect: (tile, player) => {
        const { players, board } = get(); // Use updated state
        // Helper to update player
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
            case 'INTEREST_TRAP':
                const interest = Math.floor(player.money * 0.1);
                updatePlayer(player, { money: player.money - interest });
                break;
            case 'BAILOUT':
                // Debt relief or small grant
                if (player.money < 0) {
                    updatePlayer(player, { money: 0 });
                } else {
                    updatePlayer(player, { money: player.money + 100 });
                }
                break;
            case 'BANKRUPTCY':
                // Sell highest asset
                const owned = board.filter(t => t.owner === player.id);
                if (owned.length > 0) {
                    const mostExpensive = owned.sort((a, b) => (b.price || 0) - (a.price || 0))[0];
                    const sellPrice = Math.floor((mostExpensive.price || 0) * 0.5); // Fire sale

                    const newBoard = board.map(t => t.id === mostExpensive.id ? { ...t, owner: null, ownerName: undefined } : t);

                    // Update player money
                    const currentPlayers = get().players;
                    const newPlayers = currentPlayers.map(pl => pl.id === player.id ? { ...pl, money: pl.money + sellPrice } : pl);

                    set({ board: newBoard, players: newPlayers });
                    console.log(`Bankruptcy Court: Sold ${mostExpensive.name} for ${sellPrice}`);
                }
                break;
            case 'CRYPTO_VOLATILITY':
                // Random +/-
                const change = Math.floor(Math.random() * 200) - 100;
                updatePlayer(player, { money: player.money + change });
                break;
            // Other cases (START_BONUS handled by movePlayer, etc)
        }
    }
}));

// Helper function for AI logic
function shouldComputerBuy(player: Player, tile: Tile, currentNews: NewsEffect | null, board: Tile[]): boolean {
    if (!tile.price || tile.owner !== undefined) return false;
    if (player.money < tile.price) return false;

    // Default strategy parameters
    let reserve = 300; // Keep some cash on hand

    // 1. News Response
    if (currentNews) {
        switch (currentNews.type) {
            case 'RENT_HIKE':
                reserve = 100; // Aggressive: rents are high, get land now!
                break;
            case 'PRICE_DROP':
                reserve = 0; // Aggressive: buy the dip!
                break;
            case 'UTILITY_FAIL':
                // No utilities anymore, just generic caution
                reserve = 500;
                break;
        }
    }

    // 2. Set Monopoly Strategy
    // Check if we own other properties of the same group
    if (tile.group) {
        const groupProperties = board.filter(t => t.group === tile.group);
        const ownedInGroup = groupProperties.filter(t => t.owner === player.id);

        // If we already own something in this group, prioritize completing the set
        // (ignoring reserve if we can afford it)
        if (ownedInGroup.length > 0) {
            return true;
        }
    }

    // 3. Low Cost Strategy
    // Always buy cheap properties if affordable
    if (tile.price <= 200) {
        return true;
    }

    // 4. Standard Decision based on Reserve
    return (player.money - tile.price) >= reserve;
}
