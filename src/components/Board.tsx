'use client';
import { useGameStore, Player } from '@/store/gameStore';
import { Tile } from './Tile';
import { useShallow } from 'zustand/react/shallow';

export function Board() {
    const { board, players } = useGameStore(useShallow(state => ({
        board: state.board,
        players: state.players
    })));

    // Board Setup: 16 Tiles (5x5 Grid)
    // Indices: 0-15

    const getGridStyle = (index: number) => {
        // Bottom Row: 0..4 (Right to Left)
        // 0 -> (5, 5)
        // 4 -> (5, 1)
        if (index >= 0 && index <= 4) {
            const col = 5 - index;
            return { gridArea: `5 / ${col} / 6 / ${col + 1}` };
        }

        // Left Row: 4..8 (Bottom to Top)
        // 4 -> (5, 1)
        // 8 -> (1, 1)
        if (index >= 5 && index <= 8) {
            const row = 5 - (index - 4);
            return { gridArea: `${row} / 1 / ${row + 1} / 2` };
        }

        // Top Row: 8..12 (Left to Right)
        // 8 -> (1, 1)
        // 12 -> (1, 5)
        if (index >= 9 && index <= 12) {
            const col = 1 + (index - 8);
            return { gridArea: `1 / ${col} / 2 / ${col + 1}` };
        }

        // Right Row: 12..15 (Top to Bottom)
        // 12 -> (1, 5)
        // 15 -> (4, 5)
        if (index >= 13 && index <= 15) {
            const row = 1 + (index - 12);
            return { gridArea: `${row} / 5 / ${row + 1} / 6` };
        }

        return {};
    };

    const getPlayersOnTile = (tileId: number) => players.filter(p => p.position === tileId);

    return (
        <div className="w-full aspect-square bg-slate-200 p-1 md:p-2 rounded-xl shadow-2xl relative">
            <div className="grid grid-cols-5 grid-rows-5 gap-0.5 md:gap-1 w-full h-full text-[10px] sm:text-xs">
                {/* Center Logo / Play Area */}
                <div className="col-start-2 col-end-5 row-start-2 row-end-5 bg-white/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 md:p-8 text-center">
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-800 tracking-tighter mb-2 md:mb-4">NEWSOPOLY</h1>
                    <div className="text-[10px] sm:text-sm text-slate-500 font-medium uppercase tracking-widest">Global Edition</div>
                </div>

                {board.map((tile) => (
                    <div key={tile.id} style={getGridStyle(tile.id)} className="w-full h-full overflow-hidden">
                        <Tile tile={tile} playersOnTile={getPlayersOnTile(tile.id)} />
                    </div>
                ))}
            </div>
        </div>
    );
}
