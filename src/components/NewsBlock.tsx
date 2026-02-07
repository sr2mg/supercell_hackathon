import { clsx } from 'clsx';

interface NewsBlockProps {
    title: string;
    subtitle?: string | null;
    reason?: string | null;
    impact?: string | null;
    reaction?: string | null;
    tagLabel?: string | null;
    direction?: 'UP' | 'DOWN' | null;
    size?: 'md' | 'lg';
}

export function NewsBlock({
    title,
    subtitle,
    reason,
    impact,
    reaction,
    tagLabel,
    direction,
    size = 'lg',
}: NewsBlockProps) {
    return (
        <div className={clsx(
            "relative w-full mx-auto",
            size === 'lg' ? "max-w-[1100px]" : "max-w-[700px]"
        )}>
            <img
                src="/news.svg"
                alt=""
                className="w-full h-auto"
                draggable={false}
            />
            {/* Top bar color (override SVG bar) */}
            <div
                className="absolute left-0 top-[13.5%] h-[28.5%] w-[56.57%]"
                style={{ backgroundColor: tagLabel === 'NOISE' ? '#1186E4' : '#EB562B' }}
            />
            <div className="absolute left-[4%] right-[6%] top-[46%]">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className={clsx(
                            "text-black font-black leading-tight truncate font-bebas",
                            size === 'lg' ? "text-xl md:text-4xl" : "text-base md:text-2xl"
                        )}>
                            {title}
                        </div>
                        {subtitle && (
                            <div className={clsx(
                                "text-slate-600 mt-1 truncate",
                                size === 'lg' ? "text-xs md:text-sm" : "text-[10px] md:text-sm"
                            )}>
                                {subtitle}
                            </div>
                        )}
                        {reason && (
                            <div className={clsx(
                                "text-slate-700 mt-1 line-clamp-2",
                                size === 'lg' ? "text-xs md:text-sm" : "text-[10px] md:text-sm"
                            )}>
                                {reason}
                            </div>
                        )}
                        {impact && (
                            <div className={clsx(
                                "text-black mt-2 font-black uppercase tracking-widest",
                                size === 'lg' ? "text-base md:text-2xl" : "text-sm md:text-lg"
                            )}>
                                {impact}
                            </div>
                        )}
                        {reaction && (
                            <div className={clsx(
                                "text-slate-700 mt-1 italic",
                                size === 'lg' ? "text-xs md:text-sm" : "text-[10px] md:text-xs"
                            )}>
                                {reaction}
                            </div>
                        )}
                    </div>
                    {direction && (
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={clsx(
                                "text-xs md:text-sm font-bold",
                                direction === 'UP' ? 'text-green-700' : 'text-red-700'
                            )}>
                                {direction === 'UP' ? '▲' : '▼'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Breaking label on red bar */}
            <div className="absolute left-[3%] top-[18%]">
                <span
                    className="text-white uppercase"
                    style={{
                        fontFamily: 'var(--font-lilita-one)',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '63.605px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                    }}
                >
                    BREAKING NEWS
                </span>
            </div>
        </div>
    );
}
