import { clsx } from 'clsx';
import type { Tag } from '@/data/boardData';
import type { Player } from '@/types/game';
import { PlayerToken } from './PlayerToken';

interface KomaTileProps {
    name: string;
    tag: Tag;
    value: number;
    price: number;
    colorHex: string;
    highlight?: boolean;
    shareholders?: Array<{ playerId: number; shares: number }>;
    playersOnTile?: Player[];
    playerColors?: Record<number, string>;
    previousPrice?: number;
}

const defaultPlayerColors: Record<number, string> = {
    0: '#F5D304',
    1: '#FDA3F5',
    2: '#00E16D',
    3: '#07A5E2',
};

export function KomaTile({
    name,
    tag,
    value,
    price,
    colorHex,
    highlight = false,
    shareholders = [],
    playersOnTile = [],
    playerColors = defaultPlayerColors,
    previousPrice,
}: KomaTileProps) {
    const filledSlots = shareholders
        .flatMap(h => Array.from({ length: h.shares }).map(() => h.playerId))
        .slice(0, 3);
    const slotFills = [0, 1, 2].map((i) => {
        const playerId = filledSlots[i];
        return playerId !== undefined ? (playerColors[playerId] || '#FFFFFF') : '#FFFFFF';
    });

    const priceDiff = previousPrice !== undefined ? price - previousPrice : 0;
    const isPositive = priceDiff > 0;
    const isNegative = priceDiff < 0;

    return (
        <div className={clsx(
            "relative select-none",
            "aspect-square w-full h-full"
        )}
            style={{ fontFamily: 'var(--font-lilita-one)' }}
        >
            <svg
                viewBox="0 0 300 300"
                className={clsx(
                    "absolute inset-0 w-full h-full",
                    highlight && "koma-impact-svg"
                )}
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
            >
                {highlight && (
                    <rect
                        x="6"
                        y="6"
                        width="288"
                        height="288"
                        rx="6"
                        className="koma-impact-ring"
                    />
                )}
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

                {/* Dividend / Price */}
                <text
                    x="150"
                    y="270"
                    textAnchor="middle"
                    className="fill-black"
                    style={{ fontFamily: 'var(--font-lilita-one)', fontSize: '46px', letterSpacing: '0.02em' }}
                >
                    D{value} / ${price}
                </text>

                {/* Price Fluctuation (if any) */}
                {priceDiff !== 0 && (
                    <text
                        x="150"
                        y="230"
                        textAnchor="middle"
                        className={isPositive ? "fill-green-600" : "fill-red-600"}
                        style={{
                            fontFamily: 'var(--font-lilita-one)',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            filter: 'drop-shadow(0px 1px 0px white)'
                        }}
                    >
                        {isPositive ? '+' : ''}{priceDiff}
                    </text>
                )}

                {/* Slot Circles */}
                <circle cx="169.5" cy="142.5" r="15.5" fill={slotFills[0]} stroke="black" strokeWidth="4" />
                <circle cx="214.5" cy="142.5" r="15.5" fill={slotFills[1]} stroke="black" strokeWidth="4" />
                <circle cx="258.5" cy="142.5" r="15.5" fill={slotFills[2]} stroke="black" strokeWidth="4" />
            </svg>

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
