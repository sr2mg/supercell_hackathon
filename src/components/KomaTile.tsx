import { clsx } from 'clsx';
import type { Tag } from '@/data/boardData';
import type { Player } from '@/types/game';
import { PlayerToken } from './PlayerToken';

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
        )}
            style={{ fontFamily: 'var(--font-lilita-one)' }}
        >
            <svg
                viewBox="0 0 300 300"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background & Border */}
                <rect x="2.5" y="2.5" width="295" height="295" fill={colorHex} />
                <rect x="2.5" y="2.5" width="295" height="295" stroke="black" strokeWidth="5" fill="none" />

                {/* Bottom White Box */}
                <rect x="5" y="179" width="290" height="116" fill="white" />

                {/* Name (wrapped) */}
                <foreignObject x="22" y="60" width="256" height="55">
                    <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                            fontFamily: 'var(--font-lilita-one)',
                            fontSize: '30px',
                            fontWeight: 400,
                            lineHeight: '1',
                            letterSpacing: '-0.02em',
                            textTransform: 'uppercase',
                            color: '#000',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word'
                        }}
                    >
                        {name}
                    </div>
                </foreignObject>

                {/* Tag Pill */}
                <rect x="22" y="127" width="115" height="31" rx="15.5" stroke="black" strokeWidth="4" fill="none" />

                {/* Tag Text */}
                <text
                    x="79.5" // 22 + 115/2
                    y="149" // 127 + 31/2 + adjustment
                    textAnchor="middle"
                    className="fill-black text-xl uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-lilita-one)', fontSize: '18px', fontWeight: 'bold' }}
                >
                    {tag}
                </text>

                {/* Price/Value */}
                {/* Dollar Sign */}
                <text
                    x="30"
                    y="270"
                    className="fill-black"
                    style={{ fontFamily: 'var(--font-lilita-one)', fontSize: '50px' }}
                >
                    $
                </text>
                {/* Value amount */}
                <text
                    x="65"
                    y="270"
                    className="fill-black"
                    style={{ fontFamily: 'var(--font-lilita-one)', fontSize: '70px', letterSpacing: '0.05em' }}
                >
                    {value}
                </text>

                {/* Slot Circles */}
                <circle cx="169.5" cy="142.5" r="15.5" fill="white" stroke="black" strokeWidth="4" />
                <circle cx="214.5" cy="142.5" r="15.5" fill="white" stroke="black" strokeWidth="4" />
                <circle cx="258.5" cy="142.5" r="15.5" fill="white" stroke="black" strokeWidth="4" />
            </svg>

            {/* Shareholders (Using the slot circles positions) */}
            {/* The SVG circles are at specific coords, we can place absolute divs over them or render SVG circles inside */}
            {/* Let's render shareholder markers inside the SVG if possible, or overlay divs. */}
            {/* Overlay Divs for Shareholders */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {/* Map slots to shareholders based on index (max 3 slots shown efficiently) */}
                {/* Slots: (169.5, 142.5), (214.5, 142.5), (258.5, 142.5) */}
                {/* Convert SVG coords to percentages for responsiveness: 300x300 basis */}
                {shareholders.slice(0, 3).map((h, i) => {
                    const cx = [169.5, 214.5, 258.5][i];
                    const cy = 142.5;
                    const left = (cx / 300) * 100;
                    const top = (cy / 300) * 100;
                    const color = playerColors[h.playerId] || '#9ca3af'; // default gray-400 equivalent

                    return (
                        <div
                            key={`sh-${i}`}
                            className={clsx(
                                "absolute w-[8%] h-[8%] rounded-full border-2 border-black transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center",
                                !color.startsWith('#') && color
                            )}
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                backgroundColor: color.startsWith('#') ? color : undefined
                            }}
                            title={`Shareholder: Player ${h.playerId} (${h.shares})`}
                        >
                            {/* Optional: Show share count if tiny text fits, or just color indicator */}
                            {/* <span className="text-[0.4em] font-bold text-black">{h.shares}</span> */}
                        </div>
                    );
                })}
            </div>

            {/* Players on Tile (Standing) */}
            {/* Position them at bottom right or spread out? SVG has space at bottom right in white box? */}
            {/* The white box is huge (y=179 to 295). Enough space for players. */}
            {/* Let's put players at bottom right area to avoid obscuring price too much. */}
            <div className="absolute bottom-[5%] right-[5%] flex flex-col-reverse gap-1 items-end z-20">
                {playersOnTile.map(p => (
                    <div
                        key={p.id}
                        className="relative z-20 transition-transform hover:scale-110"
                        title={p.name}
                    >
                        <PlayerToken
                            color={p.color}
                            className="w-10 h-10 drop-shadow-md"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
