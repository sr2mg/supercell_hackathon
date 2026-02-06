'use client';
import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export function NewsTicker() {
    const { currentNews, newsLog } = useGameStore(useShallow(state => ({
        currentNews: state.currentNews,
        newsLog: state.newsLog
    })));

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (currentNews) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000); // Highlight effect duration
            return () => clearTimeout(timer);
        }
    }, [currentNews]);

    // If no news yet, show default market status
    const activeNews = currentNews || { title: "Market Stable", description: "No active effects.", type: 'NONE' };

    return (
        <div className="w-full bg-slate-900 text-white shadow-lg overflow-hidden flex flex-col">
            {/* Top Bar: Active Effect */}
            <div className={clsx(
                "p-4 flex items-center justify-between transition-colors duration-500",
                activeNews.type === 'RENT_HIKE' ? 'bg-green-900/50' :
                    activeNews.type === 'PRICE_DROP' ? 'bg-red-900/50' :
                        activeNews.type === 'UTILITY_FAIL' ? 'bg-amber-900/50' : 'bg-slate-800'
            )}>
                <div className="flex items-center gap-4">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE</span>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            {activeNews.title}
                            {activeNews.type === 'RENT_HIKE' && <TrendingUp className="text-green-400" />}
                            {activeNews.type === 'PRICE_DROP' && <TrendingDown className="text-red-400" />}
                            {activeNews.type === 'UTILITY_FAIL' && <AlertTriangle className="text-amber-400" />}
                        </h2>
                        <p className="text-slate-300 text-sm">{activeNews.description}</p>
                    </div>
                </div>
            </div>

            {/* Marquee / Ticker History */}
            <div className="bg-slate-950 py-1 px-4 flex gap-8 overflow-x-hidden whitespace-nowrap text-xs text-slate-400 border-t border-slate-800">
                <div className="animate-marquee flex gap-12">
                    {newsLog.length > 0 ? newsLog.map((news, i) => (
                        <span key={i} className="flex items-center gap-2">
                            <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                            <strong className="text-slate-200">{news.title}</strong>
                            <span>{news.type === 'RENT_HIKE' ? '+20%' : news.type === 'PRICE_DROP' ? '-50%' : ''}</span>
                        </span>
                    )) : <span>Waiting for market open...</span>}
                </div>
            </div>
        </div>
    );
}
