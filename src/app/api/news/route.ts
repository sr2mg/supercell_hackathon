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

        // Pick a random recent news item (from top 10)
        const recentItems = items.slice(0, 10);
        const randomItem = recentItems[Math.floor(Math.random() * recentItems.length)];

        const title = randomItem.title;
        const description = randomItem.description || '';
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
        if (type === 'PRICE_DROP') multiplier = 0.5;  // 50% rent decrease / price drop (simplified)
        if (type === 'UTILITY_FAIL') multiplier = 0; // Utilities fail

        return NextResponse.json({
            title,
            description: randomItem.description,
            type,
            multiplier,
            source: 'BBC News'
        });

    } catch (error) {
        console.error('RSS Fetch Error:', error);
        // Fallback Mock
        return NextResponse.json({
            title: 'Connection Lost',
            description: 'Using local backup system.',
            type: 'NONE',
            multiplier: 1,
            source: 'System'
        });
    }
}
