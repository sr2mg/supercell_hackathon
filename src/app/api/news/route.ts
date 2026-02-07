import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { processNewsItems } from '@/lib/newsProcessor';
import { NewsCard } from '@/lib/types';

export const dynamic = 'force-dynamic';

const BBC_RSS_URL = 'http://feeds.bbci.co.uk/news/world/rss.xml';

export async function GET() {
    try {
        const response = await fetch(BBC_RSS_URL);
        const xmlData = await response.text();

        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        const items = jsonObj?.rss?.channel?.item;

        if (!items || !Array.isArray(items)) {
            throw new Error('Invalid RSS structure');
        }

        // Take top 10 items for processing
        const topStories = items.slice(0, 10);

        // Process with LLM
        const processedNews: NewsCard[] = await processNewsItems(topStories);

        return NextResponse.json(processedNews);

    } catch (error) {
        console.error('RSS Fetch/Process Error:', error);

        // Fallback Mock List (updated to match new structure)
        const fallbackNews: NewsCard[] = [
            {
                id: 'fallback-1',
                sourceTitle: 'System',
                type: 'NOISE',
                tag: null,
                titleJa: '通信エラー',
                titleEn: 'Connection Lost',
                reasonJa: 'ニュース取得に失敗しました。ローカルバックアップを使用します。',
                reasonEn: 'Failed to fetch news. Using local backup.',
                direction: null
            },
            {
                id: 'fallback-2',
                sourceTitle: 'System',
                type: 'MARKET',
                tag: 'GOV',
                titleJa: '不況モード',
                titleEn: 'Recession Mode',
                reasonJa: '詳細データがありません。',
                reasonEn: 'No detailed data available.',
                direction: 'DOWN'
            }
        ];

        return NextResponse.json(fallbackNews);
    }
}
