import { generateGeminiContent } from './gemini';
import { NewsCard, Tag, NewsType, NewsDirection } from './types';

// System prompt for the News Analyst Agent
const SYSTEM_PROMPT = `
You are an AI News Analyst for a satirical stock market board game called "Newsopoly".
Your job is to read real-world news headlines and convert them into game events.

Game Context:
- The game has 6 industries (Tags): AI, CHIPS (Semiconductors), ENERGY (Oil & Green), GOV (Government/Central Banks), CRYPTO, MEDIA.
- "Market News" affects specific industries.
- "Noise News" is irrelevant pop culture or minor events (which becomes random chaos in-game for ALL industries).

Task:
1. Receive a list of news items (Title + Description).
2. For EACH item, classify it as "MARKET" or "NOISE".
3. If MARKET, assign ONE most relevant Tag from the 6 above.
4. If NOISE, Tag is null.
5. Generate a satirical/short reason (max 1 sentence) for the effect.
6. Determine sentiment direction (UP for positive news, DOWN for negative).
7. Return a JSON array of objects.

Output JSON Structure:
[
  {
    "sourceTitle": "Original Title",
    "type": "MARKET" | "NOISE",
    "tag": "AI" | "CHIPS" | "ENERGY" | "GOV" | "CRYPTO" | "MEDIA" | null,
    "titleJa": "Japanese Title (Short, Punchy)",
    "titleEn": "English Title (Short)",
    "reasonJa": "Why it affects the market (Japanese, 1 sentence)",
    "reasonEn": "Why it affects the market (English, 1 sentence)",
    "direction": "UP" | "DOWN"
  }
]

Constraints:
- STRICTLY return valid JSON. No markdown fencing.
- Classify roughly 40-50% as NOISE to keep the game chaotic.
- If a news item is about a specific tech company (Nvidia, OpenAI), map it to AI or CHIPS.
- If it's about Bitcoin/Ethereum, map to CRYPTO.
- If it's about Elections/Taxes/War, map to GOV.
- If it's about Movies/Music/Celebrities, map to MEDIA.
- If it's strictly local or boring, make it NOISE.
`;

export async function processNewsItems(rawNews: any[]): Promise<NewsCard[]> {
    // 1. Prepare the input for LLM (limit to top 15-20 to save tokens/time if list is huge)
    const newsInput = rawNews.map((item: any) => ({
        title: item.title,
        description: item.description?.substring(0, 200) || '', // Truncate long descriptions
    }));

    const prompt = `
    ${SYSTEM_PROMPT}

    Here is the news list to process:
    ${JSON.stringify(newsInput)}
    `;

    try {
        const responseText = await generateGeminiContent(prompt);

        // Clean up markdown code blocks if Gemini adds them
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const processedItems = JSON.parse(cleanedText);

        // Map to full NewsCard structure (add IDs)
        return processedItems.map((item: any, index: number) => ({
            id: `news-${Date.now()}-${index}`,
            sourceTitle: item.sourceTitle || rawNews[index]?.title || 'Unknown Source',
            type: asNewsType(item.type),
            tag: asTag(item.tag),
            titleJa: item.titleJa,
            titleEn: item.titleEn,
            reasonJa: item.reasonJa,
            reasonEn: item.reasonEn,
            direction: asDirection(item.direction)
        }));

    } catch (error) {
        console.error('News Processing Error:', error);
        // Fallback: return empty or basic processed items to prevent crash
        return [];
    }
}

// Helpers to ensure type safety from LLM output
function asNewsType(val: string): NewsType {
    if (val === 'MARKET') return 'MARKET';
    return 'NOISE';
}

function asTag(val: string | null): Tag | null {
    const validTags = ['AI', 'CHIPS', 'ENERGY', 'GOV', 'CRYPTO', 'MEDIA'];
    if (val && validTags.includes(val)) return val as Tag;
    return null;
}

function asDirection(val: string): NewsDirection | null {
    if (val === 'UP') return 'UP';
    if (val === 'DOWN') return 'DOWN';
    return null; // Or default to null
}
