import { Asset as TileType, Tag } from '@/data/boardData';
import { KomaTile } from './KomaTile';
import { twMerge } from 'tailwind-merge';

interface TileProps {
    tile: TileType;
    playersOnTile: import('@/types/game').Player[];
    orientation?: 'bottom' | 'left' | 'top' | 'right';
}

export function Tile({ tile, playersOnTile, orientation = 'bottom' }: TileProps) {
    const colorMap: Record<Tag, string> = {
        AI: '#19C7D8',
        CHIPS: '#F2C94C',
        ENERGY: '#F2994A',
        GOV: '#9B51E0',
        CRYPTO: '#27AE60',
        MEDIA: '#EB4CB7',
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
                    src="/payday.svg"
                    alt="Payday"
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <KomaTile
            name={tile.name}
            tag={tile.tag}
            value={tile.dividend}
            colorHex={colorMap[tile.tag] || '#E5E7EB'}
            shareholders={tile.shareholders}
            playersOnTile={playersOnTile}
            playerColors={playerColors}
        />
    );
}
