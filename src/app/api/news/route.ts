import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { processNewsItems } from '@/lib/newsProcessor';
import { NewsCard } from '@/lib/types';

export const dynamic = 'force-dynamic';

const BBC_RSS_URL = 'http://feeds.bbci.co.uk/news/world/rss.xml';

// In-memory caches (per server instance)
let cachedProcessed: NewsCard[] = [];
let cachedRaw: any[] = [];
let backgroundTask: Promise<void> | null = null;

async function processInBackground(items: any[]) {
    if (backgroundTask) return;
    backgroundTask = (async () => {
        try {
            const processed = await processNewsItems(items);
            cachedProcessed = processed;
        } catch (err) {
            console.error('Background LLM processing failed:', err);
        } finally {
            backgroundTask = null;
        }
    })();
}

export async function GET(request: Request) {
    try {
        console.time('[news] rss');
        const response = await fetch(BBC_RSS_URL);
        const xmlData = await response.text();
        console.timeEnd('[news] rss');

        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        const items = jsonObj?.rss?.channel?.item;

        if (!items || !Array.isArray(items)) {
            throw new Error('Invalid RSS structure');
        }

        // Take top 10 items for processing
        const topStories = items.slice(0, 10);
        cachedRaw = topStories;

        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'fill';

        if (mode === 'initial') {
            const first = topStories.slice(0, 1);
            const rest = topStories.slice(1);

            console.time('[news] llm_total');
            const processedFirst: NewsCard[] = await processNewsItems(first);
            console.timeEnd('[news] llm_total');

            // Kick off background processing for the rest
            if (rest.length > 0) {
                void processInBackground(rest);
            }

            return NextResponse.json(processedFirst);
        }

        if (cachedProcessed.length > 0) {
            return NextResponse.json(cachedProcessed);
        }
        if (backgroundTask) {
            return NextResponse.json([]);
        }

        // Process with LLM (full)
        console.time('[news] llm_total');
        const processedNews: NewsCard[] = await processNewsItems(topStories);
        console.timeEnd('[news] llm_total');

        cachedProcessed = processedNews;
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
                title: 'Connection Lost',
                reason: 'Failed to fetch news. Using local backup.',
                direction: null
            },
            {
                id: 'fallback-2',
                sourceTitle: 'System',
                type: 'MARKET',
                tag: 'GOV',
                title: 'Recession Mode',
                reason: 'No detailed data available.',
                direction: 'DOWN'
            }
        ];

        return NextResponse.json(fallbackNews);
    }
}
