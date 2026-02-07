import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-api-key-here') {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    if (!client) {
        client = new GoogleGenAI({ apiKey });
    }
    return client;
}

const MODEL = 'gemini-2.5-flash';

export async function generateGeminiContent(prompt: string): Promise<string> {
    const ai = getClient();

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('No content in Gemini response');
    }
    return text;
}

export async function generateGeminiContentStream(
    prompt: string,
    onChunk: (text: string) => void,
): Promise<string> {
    const ai = getClient();

    const response = await ai.models.generateContentStream({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let full = '';
    for await (const chunk of response) {
        const text = chunk.text ?? '';
        full += text;
        onChunk(text);
    }
    return full;
}
