import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export const dynamic = 'force-dynamic';

const BBC_RSS_URL = 'http://feeds.bbci.co.uk/news/world/rss.xml';

// Keywords to map news to game effects
const KEYWORDS = {
    RENT_HIKE: ['economy', 'inflation', 'growth', 'rise', 'boom', 'bank', 'rates', 'tax', 'profit'],
    PRICE_DROP: ['crash', 'crisis', 'down', 'conflict', 'war', 'disaster', 'protest', 'strike', 'loss', 'debt'],
    UTILITY_FAIL: ['climate', 'storm', 'outage', 'energy', 'water', 'power', 'hack', 'cyber', 'attack'],
};

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

        // Map all items to game effects
        const newsList = items.map((item: any) => {
            const title = item.title;
            const description = item.description || '';
            const text = `${title} ${description}`.toLowerCase();

            // Analyze text for keywords
            let type = 'NONE';
            let multiplier = 1;

            for (const [effect, words] of Object.entries(KEYWORDS)) {
                if (words.some(word => text.includes(word))) {
                    type = effect;
                    break; // Stop at first match for simplicity
                }
            }

            // Assign effects
            if (type === 'RENT_HIKE') multiplier = 1.25; // 25% rent increase
            if (type === 'PRICE_DROP') multiplier = 0.5;  // 50% rent decrease / price drop
            if (type === 'UTILITY_FAIL') multiplier = 0; // Utilities fail

            return {
                title,
                description: item.description,
                type,
                multiplier,
                source: 'BBC News'
            };
        });

        // Filter out items with no description or title if necessary, but for now we keep them.
        // We can shuffle them if we want random order, but chronological might be better or worse?
        // Let's shuffle to make it more "game-like" random news feed.
        const shuffled = newsList.sort(() => Math.random() - 0.5);

        return NextResponse.json(shuffled);

    } catch (error) {
        console.error('RSS Fetch Error:', error);
        // Fallback Mock List
        return NextResponse.json([
            {
                title: 'Connection Lost',
                description: 'Using local backup system.',
                type: 'NONE',
                multiplier: 1,
                source: 'System'
            },
            {
                title: 'Offline Mode',
                description: 'Cannot reach global news network.',
                type: 'NONE',
                multiplier: 1,
                source: 'System'
            }
        ]);
    }
}
