import { Asset as TileType, Tag } from '@/data/boardData';
import { KomaTile } from './KomaTile';
import { PlayerToken } from './PlayerToken';
import { twMerge } from 'tailwind-merge';

interface TileProps {
    tile: TileType;
    playersOnTile: import('@/types/game').Player[];
    orientation?: 'bottom' | 'left' | 'top' | 'right';
}

export function Tile({ tile, playersOnTile, orientation = 'bottom' }: TileProps) {
    const colorMap: Record<Tag, string> = {
        AI: '#07A5E2',
        CHIPS: '#F5D304',
        ENERGY: '#F99408',
        GOV: '#B586DF',
        CRYPTO: '#00E16D',
        MEDIA: '#FDA3F5',
    };

    const playerColors: Record<number, string> = {
        0: '#F5D304',
        1: '#FDA3F5',
        2: '#00E16D',
        3: '#07A5E2',
    };

    if (tile.isPayday) {
        return (
            <div className={twMerge(
                "relative flex flex-col items-center justify-between select-none bg-white",
                "aspect-square w-full h-full"
            )}>
                <img
                    src="/payday.svg" // Make sure this path is correct based on your project structure
                    alt="Payday"
                    className="w-full h-full object-cover"
                />

                {/* Players on Tile (similar to KomaTile) */}
                <div className="absolute bottom-[5%] right-[5%] flex flex-col-reverse gap-1 items-end z-20">
                    {playersOnTile.map(p => (
                        <div
                            key={p.id}
                            className="relative z-20 transition-transform hover:scale-110"
                            title={p.name}
                        >
                            <PlayerToken
                                color={playerColors[p.id] || p.color}
                                className="w-10 h-10 drop-shadow-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <KomaTile
            name={tile.name}
            tag={tile.tag}
            value={tile.dividend}
            price={tile.price}
            colorHex={colorMap[tile.tag] || '#E5E7EB'}
            shareholders={tile.shareholders}
            playersOnTile={playersOnTile}
            playerColors={playerColors}
            previousPrice={tile.previousPrice}
            highlight={tile.previousDividend !== undefined && tile.previousDividend !== tile.dividend}
        />
    );
}
