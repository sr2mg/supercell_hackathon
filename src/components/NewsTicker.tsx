'use client';
import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useState } from 'react';
import { NewsBlock } from './NewsBlock';

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
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [currentNews]);

    // If no news yet, show default market status
    const activeNews = currentNews || {
        id: 'default',
        sourceTitle: 'System',
        type: 'NOISE',
        tag: null,
        title: 'Market Waiting...',
        reason: 'Fetching news...',
        direction: null,
        url: undefined
    };

    const isMarket = activeNews.type === 'MARKET';

    return (
        <>
            {visible && (
                <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 md:pb-10">
                    <div className="absolute inset-0 bg-black/60 news-overlay" />
                    <div className="relative w-full px-4 news-cutin">
                        <NewsBlock
                            title={activeNews.title || activeNews.sourceTitle || 'News'}
                            subtitle={activeNews.titleEn || null}
                            reason={activeNews.reason || activeNews.description || null}
                            tagLabel={activeNews.tag || (isMarket ? 'MARKET' : 'NOISE')}
                            direction={activeNews.direction || null}
                            size="lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
