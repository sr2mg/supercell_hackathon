'use client';
import { useGameStore } from '@/store/gameStore';
import { Tile } from './Tile';
import { useShallow } from 'zustand/react/shallow';
import { getGridSize, getTileGridArea } from '@/lib/boardUtils';

export function Board() {
    const { board, players } = useGameStore(useShallow(state => ({
        board: state.board,
        players: state.players
    })));

    // Calculate grid dimensions
    const totalTiles = board.length;
    const sideLength = getGridSize(totalTiles);

    // Dynamic Grid Style
    const containerStyle = {
        gridTemplateColumns: `repeat(${sideLength}, 1fr)`,
        gridTemplateRows: `repeat(${sideLength}, 1fr)`
    };

    const getPlayersOnTile = (tileId: number) => players.filter(p => p.position === tileId);

    return (
        <div className="w-full aspect-square bg-slate-200 p-1 md:p-2 rounded-xl shadow-2xl relative">
            <div
                className="grid gap-0.5 md:gap-1 w-full h-full text-[10px] sm:text-xs"
                style={containerStyle}
            >
                {/* Center Logo / Play Area */}
                <div
                    className="bg-white/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 md:p-8 text-center"
                    style={{
                        gridColumnStart: 2,
                        gridColumnEnd: sideLength,
                        gridRowStart: 2,
                        gridRowEnd: sideLength
                    }}
                >
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-bebas font-black text-slate-800 tracking-tighter mb-2 md:mb-4">NEWSOPOLY</h1>
                    <div className="text-[10px] sm:text-sm text-slate-500 font-medium uppercase tracking-widest">Global Edition</div>
                </div>

                {board.map((tile, index) => {
                    const coords = getTileGridArea(index, totalTiles);
                    const style = {
                        gridRowStart: coords.rowStart,
                        gridRowEnd: coords.rowEnd,
                        gridColumnStart: coords.colStart,
                        gridColumnEnd: coords.colEnd
                    };

                    return (
                        <div key={tile.id} style={style} className="w-full h-full overflow-hidden">
                            <Tile tile={tile} playersOnTile={getPlayersOnTile(tile.id)} />
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
