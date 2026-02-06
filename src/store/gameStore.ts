import { create } from 'zustand';
import { INITIAL_BOARD, Tile } from '../data/boardData';

export interface Player {
    id: number;
    name: string;
    money: number;
    position: number;
    color: string;
    inJail: boolean;
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

    // Actions
    rollDice: () => void;
    movePlayer: (steps: number) => void;
    nextTurn: () => void;
    triggerNews: () => void;
    buyProperty: (tileId: number) => void;
}

const MOCK_NEWS: NewsEffect[] = [
    { title: "Central Bank Hikes Rates", description: "Rents increase by 50%!", type: 'RENT_HIKE', multiplier: 1.5 },
    { title: "Market Crash!", description: "Property prices drop by 50%.", type: 'PRICE_DROP', multiplier: 0.5 },
    { title: "Blackout!", description: "Utilities are offline. No rent for them.", type: 'UTILITY_FAIL', multiplier: 0 },
];

export const useGameStore = create<GameState>((set, get) => ({
    players: [
        { id: 0, name: 'Player 1', money: 1500, position: 0, color: 'bg-red-500', inJail: false },
        { id: 1, name: 'Player 2', money: 1500, position: 0, color: 'bg-blue-500', inJail: false },
    ],
    activePlayerIndex: 0,
    turnCount: 1,
    board: INITIAL_BOARD,
    dice: [1, 1],
    isRolling: false,
    currentNews: null,
    newsLog: [],

    rollDice: () => {
        set({ isRolling: true });
        // Mock simulation delay
        setTimeout(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            set({ dice: [d1, d2], isRolling: false });
            get().movePlayer(d1 + d2);
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
        } else {
            const updatedPlayers = [...players];
            updatedPlayers[activePlayerIndex] = { ...player, position: newPos };
            set({ players: updatedPlayers });
        }
    },

    nextTurn: () => {
        const { activePlayerIndex, players, turnCount, triggerNews } = get();
        // Check if news should trigger
        if ((turnCount + 1) % 3 === 0) {
            triggerNews();
        }

        set({
            activePlayerIndex: (activePlayerIndex + 1) % players.length,
            turnCount: turnCount + 1
        });
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
    }
}));
