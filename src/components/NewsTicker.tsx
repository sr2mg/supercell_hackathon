'use client';
import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { TrendingUp, TrendingDown, Megaphone, Radio } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export function NewsTicker() {
    const { currentNews, newsLog, fetchNews, newsQueue } = useGameStore(useShallow(state => ({
        currentNews: state.currentNews,
        newsLog: state.newsLog,
        fetchNews: state.fetchNews,
        newsQueue: state.newsQueue
    })));

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Initial fetch if queue is empty
        if (newsQueue.length === 0) {
            fetchNews();
        }
    }, [fetchNews, newsQueue.length]);

    useEffect(() => {
        if (currentNews) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 8000); // Longer format needs more time
            return () => clearTimeout(timer);
        }
    }, [currentNews]);

    // If no news yet, show default market status
    const activeNews = currentNews || {
        id: 'default',
        sourceTitle: 'System',
        type: 'NOISE',
        tag: null,
        titleJa: '市場は待機中...',
        titleEn: 'Market Waiting...',
        reasonJa: 'ニュースを取得しています。',
        reasonEn: 'Fetching news...',
        direction: null
    };

    const isMarket = activeNews.type === 'MARKET';
    const isUp = activeNews.direction === 'UP';
    const isDown = activeNews.direction === 'DOWN';

    return (
        <div className="w-full bg-slate-900 text-white shadow-lg overflow-hidden flex flex-col border-b-4 border-slate-700">
            {/* Top Bar: Active Effect */}
            <div className={clsx(
                "p-4 flex items-center justify-between transition-colors duration-500",
                isMarket && isUp && 'bg-green-900/80 border-l-8 border-green-500',
                isMarket && isDown && 'bg-red-900/80 border-l-8 border-red-500',
                !isMarket && 'bg-slate-800 border-l-8 border-slate-600'
            )}>
                <div className="flex items-center gap-4 w-full">
                    <div className={clsx(
                        "text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-md",
                        isMarket ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                    )}>
                        {isMarket ? "BREAKING NEWS" : "NOISE"}
                    </div>

                    <div className="flex flex-col flex-1">
                        <h2 className="text-lg md:text-2xl font-black tracking-tighter flex items-center gap-3">
                            {activeNews.titleEn}
                            {isMarket && isUp && <TrendingUp className="text-green-400 w-6 h-6" />}
                            {isMarket && isDown && <TrendingDown className="text-red-400 w-6 h-6" />}
                            {!isMarket && <Radio className="text-slate-400 w-5 h-5" />}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            {activeNews.tag && (
                                <span className="bg-slate-700 text-slate-200 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                    {activeNews.tag}
                                </span>
                            )}
                            <p className="text-slate-300 text-xs md:text-sm font-medium">
                                {activeNews.reasonEn}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marquee / Ticker History */}
            <div className="bg-slate-950 py-2 px-4 flex gap-8 overflow-hidden relative border-t border-slate-800">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

                <div className="flex gap-12 animate-marquee whitespace-nowrap items-center">
                    {newsLog.length > 0 ? newsLog.map((news, i) => (
                        <span key={i} className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 transition-opacity">
                            <span className="text-slate-500 font-mono">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={clsx(
                                "font-bold",
                                news.type === 'MARKET' ? "text-yellow-400" : "text-slate-400"
                            )}>
                                [{news.tag || 'GENERAL'}]
                            </span>
                            <strong className="text-slate-200">{news.titleEn}</strong>
                            {news.direction === 'UP' && <span className="text-green-500 font-bold">▲UP</span>}
                            {news.direction === 'DOWN' && <span className="text-red-500 font-bold">▼DOWN</span>}
                        </span>
                    )) : <span className="text-slate-500 italic">Waiting for market open...</span>}
                </div>
            </div>
        </div>
    );
}
