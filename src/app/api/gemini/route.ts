import { NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await generateGeminiContent('Say "Gemini connection OK" in exactly those words.');

        return NextResponse.json({
            status: 'ok',
            message: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { status: 'error', message },
            { status: 500 }
        );
    }
}
