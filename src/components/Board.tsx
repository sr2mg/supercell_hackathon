'use client';
import { useGameStore, Player } from '@/store/gameStore';
import { Tile } from './Tile';
import { useShallow } from 'zustand/react/shallow';

export function Board() {
    const { board, players } = useGameStore(useShallow(state => ({
        board: state.board,
        players: state.players
    })));

    // Board Setup: 24 Tiles
    // Bottom: 6,5,4,3,2,1,0 (7 tiles) -> 0 is Bottom Right Corner
    // Left: 12,11,10,9,8,7 -> 7 tiles inc corners? 
    // Let's explicitly slice.
    // indices 0-6: Bottom Row (Right-to-Left)
    // indices 6-12: Left Row (Bottom-to-Top)
    // indices 12-18: Top Row (Left-to-Right)
    // indices 18-23 plus 0: Right Row (Top-to-Bottom)

    // We'll render a 7x7 grid.
    // Rows/Cols: 1..7

    // Mapping functions
    const getGridStyle = (index: number) => {
        // index is 0..23

        // Bottom Row: 0..6
        if (index >= 0 && index <= 6) {
            // 0 is (7, 7) (Bottom Right)
            // 6 is (7, 1) (Bottom Left)
            const col = 7 - index;
            return { gridArea: `7 / ${col} / 8 / ${col + 1}` };
        }

        // Left Row: 7..11 (excluding corners 6 and 12 logic handled above/below?)
        // Actually, corners are shared.
        // 6 is in Bottom Row per above logic? Yes.
        // Is 6 also start of Left Row?
        // Let's stick to unique assignments.

        // Left Column (excluding bottom-left corner which is index 6) -> indices 7..11
        if (index >= 7 && index <= 11) {
            // 6 is at row 7.
            // 7 is at row 6.
            // 11 is at row 2.
            const row = 7 - (index - 6);
            return { gridArea: `${row} / 1 / ${row + 1} / 2` };
        }

        // Top Row: 12..18
        // 12 is Top Left (1, 1)
        // 18 is Top Right (1, 7)
        if (index >= 12 && index <= 18) {
            const col = index - 11;
            return { gridArea: `1 / ${col} / 2 / ${col + 1}` };
        }

        // Right Column: 19..23
        // 19 is Row 2
        // 23 is Row 6
        if (index >= 19 && index <= 23) {
            const row = index - 18 + 1; // index 19 -> 2
            return { gridArea: `${row} / 7 / ${row + 1} / 8` };
        }

        return {};
    };

    const getPlayersOnTile = (tileId: number) => players.filter(p => p.position === tileId);

    return (
        <div className="w-full aspect-square bg-slate-200 p-1 md:p-2 rounded-xl shadow-2xl relative">
            <div className="grid grid-cols-7 grid-rows-7 gap-0.5 md:gap-1 w-full h-full text-[10px] sm:text-xs">
                {/* Center Logo / Play Area */}
                <div className="col-start-2 col-end-7 row-start-2 row-end-7 bg-white/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 md:p-8 text-center">
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
