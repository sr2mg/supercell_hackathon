import { Asset as TileType, Tag } from '@/data/boardData';
import { Building2, Siren, ArrowRight, Plane, Bot, Bitcoin, Instagram, TrendingUp, Landmark, Wifi, Bike, Gavel, Server, Film } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TileProps {
    tile: TileType;
    playersOnTile: import('@/store/gameStore').Player[];
    orientation?: 'bottom' | 'left' | 'top' | 'right';
}

export function Tile({ tile, playersOnTile, orientation = 'bottom' }: TileProps) {
    // Determine color bar color
    // Determine color bar color
    const colorMap: Record<Tag, string> = {
        AI: 'bg-cyan-500',
        CHIPS: 'bg-indigo-500',
        ENERGY: 'bg-amber-500',
        GOV: 'bg-slate-500',
        CRYPTO: 'bg-yellow-500',
        MEDIA: 'bg-pink-500',
    };

    const bgColor = tile.isPayday ? 'bg-slate-100' : 'bg-white';
    const playerColors: Record<number, string> = {
        0: 'bg-red-500',
        1: 'bg-blue-500',
        2: 'bg-green-500',
        3: 'bg-yellow-500',
    };

    return (
        <div className={twMerge(
            "relative border border-slate-300 flex flex-col items-center justify-between text-xs p-1 select-none transition-colors hover:bg-slate-50",
            bgColor,
            // Dimension changes based on row? Usually board tiles are rectangular except corners.
            "aspect-square w-full h-full"
        )}>
            {/* Property Color Bar */}
            {!tile.isPayday && (
                <div className={clsx("w-full h-1/4 absolute top-0 left-0", colorMap[tile.tag] || 'bg-gray-200')} />
            )}

            {/* Content */}
            <div className={clsx("flex flex-col items-center justify-center w-full h-full z-10 px-0.5", !tile.isPayday ? "pt-3 md:pt-4" : "")}>
                {getLocationIcon(tile)}
                <span className="text-center font-bold mt-0.5 md:mt-1 leading-none text-[8px] md:text-[10px] lg:text-xs text-slate-800 break-words w-full overflow-hidden text-ellipsis line-clamp-2 md:line-clamp-none">{tile.name}</span>
                {!tile.isPayday && <span className="text-slate-500 font-mono text-[8px] md:text-[10px]">D {tile.dividend}</span>}
            </div>

            {/* Players */}
            <div className="absolute bottom-1 flex gap-1 z-20">
                {playersOnTile.map(p => (
                    <div key={p.id} className={clsx("w-3 h-3 rounded-full shadow-sm ring-1 ring-white", p.color)} title={p.name} />
                ))}
            </div>

            {/* Shareholders */}
            {tile.shareholders.length > 0 && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                    {tile.shareholders.flatMap(h => (
                        Array.from({ length: h.shares }).map((_, i) => (
                            <div
                                key={`${h.playerId}-${i}`}
                                className={clsx("w-2 h-2 rounded-full", playerColors[h.playerId] || 'bg-slate-400')}
                                title={`Player ${h.playerId}`}
                            />
                        ))
                    ))}
                </div>
            )}
        </div>
    );
}

function getLocationIcon(tile: TileType) {
    // Special Icons via tile.icon string
    switch (tile.icon) {
        case 'Plane': return <Plane className="w-6 h-6 text-sky-600" />;
        case 'Bot': return <Bot className="w-6 h-6 text-cyan-600" />;
        case 'Bitcoin': return <Bitcoin className="w-6 h-6 text-yellow-500" />;
        case 'Coffee': return <Coffee className="w-6 h-6 text-amber-800" />;
        case 'Instagram': return <Instagram className="w-6 h-6 text-pink-600" />;
        case 'TrendingUp': return <TrendingUp className="w-6 h-6 text-red-600" />;
        case 'Landmark': return <Landmark className="w-6 h-6 text-slate-700" />;
        case 'Wifi': return <Wifi className="w-6 h-6 text-blue-500" />;
        case 'Bike': return <Bike className="w-6 h-6 text-green-600" />;
        case 'Gavel': return <Gavel className="w-6 h-6 text-stone-700" />;
        case 'Server': return <Server className="w-6 h-6 text-indigo-600" />;
        case 'Film': return <Film className="w-6 h-6 text-purple-600" />;
        case 'Siren': return <Siren className="w-6 h-6 text-red-600 animate-pulse" />;
        case 'ArrowRight': return <ArrowRight className="w-6 h-6 text-green-600" />;
        case 'Lock': return <Lock className="w-6 h-6 text-orange-600" />;
    }

    if (tile.isPayday) return <ArrowRight className="w-6 h-6 text-green-600" />;

    return <Building2 className="w-4 h-4 text-slate-400" />;
}
