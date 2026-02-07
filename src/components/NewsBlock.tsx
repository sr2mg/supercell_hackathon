import { clsx } from 'clsx';

interface NewsBlockProps {
    title: string;
    subtitle?: string | null;
    reason?: string | null;
    tagLabel?: string | null;
    direction?: 'UP' | 'DOWN' | null;
    size?: 'md' | 'lg';
}

export function NewsBlock({
    title,
    subtitle,
    reason,
    tagLabel,
    direction,
    size = 'lg',
}: NewsBlockProps) {
    return (
        <div className={clsx(
            "relative w-full mx-auto",
            size === 'lg' ? "max-w-[920px]" : "max-w-[700px]"
        )}>
            <img
                src="/news.svg"
                alt=""
                className="w-full h-auto"
                draggable={false}
            />
            <div className="absolute left-[4%] right-[6%] top-[46%]">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-black font-black text-base md:text-2xl leading-tight truncate">
                            {title}
                        </div>
                        {subtitle && (
                            <div className="text-[10px] md:text-sm text-slate-600 mt-1 truncate">
                                {subtitle}
                            </div>
                        )}
                        {reason && (
                            <div className="text-[10px] md:text-sm text-slate-700 mt-1 line-clamp-2">
                                {reason}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {tagLabel && (
                            <span className="text-[10px] md:text-xs font-bold px-2 py-1 border-2 border-black rounded-full">
                                {tagLabel}
                            </span>
                        )}
                        {direction && (
                            <span className={clsx(
                                "text-xs md:text-sm font-bold",
                                direction === 'UP' ? 'text-green-700' : 'text-red-700'
                            )}>
                                {direction === 'UP' ? '▲' : '▼'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
