import { clsx } from 'clsx';
import type { Tag } from '@/data/boardData';
import type { Player } from '@/types/game';

interface KomaTileProps {
    name: string;
    tag: Tag;
    value: number;
    colorHex: string;
    shareholders?: Array<{ playerId: number; shares: number }>;
    playersOnTile?: Player[];
    playerColors?: Record<number, string>;
}

const defaultPlayerColors: Record<number, string> = {
    0: 'bg-red-500',
    1: 'bg-blue-500',
    2: 'bg-green-500',
    3: 'bg-yellow-500',
};

export function KomaTile({
    name,
    tag,
    value,
    colorHex,
    shareholders = [],
    playersOnTile = [],
    playerColors = defaultPlayerColors,
}: KomaTileProps) {
    return (
        <div className={clsx(
            "relative select-none",
            "aspect-square w-full h-full"
        )}>
            <svg
                viewBox="0 0 300 300"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Color background (same size as koma.svg) */}
                <rect x="2.5" y="2.5" width="295" height="295" fill={colorHex} />

                {/* Base frame/pill/circles */}
                <image href="/koma.svg" x="0" y="0" width="300" height="300" />

                {/* Title */}
                <text x="22" y="110" fontFamily="Lilita One, sans-serif" fontSize="20" fill="black">
                    {name}
                </text>

                {/* Tag text (inside pill) */}
                <text x="40" y="148" fontFamily="Lilita One, sans-serif" fontSize="12" fill="black">
                    {tag}
                </text>

                {/* Price */}
                <text x="68" y="260" fontFamily="Lilita One, sans-serif" fontSize="32" fill="black">$</text>
                <text
                    x="98"
                    y="265"
                    fontFamily="Lilita One, sans-serif"
                    fontSize="50"
                    fill="black"
                    letterSpacing="10%"
                >
                    {value}
                </text>
            </svg>

            {/* Players */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-center z-20">
                {playersOnTile.map(p => (
                    <div key={p.id} className={clsx("w-3 h-3 rounded-full shadow-sm ring-1 ring-white", p.color)} title={p.name} />
                ))}
            </div>

            {/* Shareholders */}
            {shareholders.length > 0 && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                    {shareholders.flatMap(h => (
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
