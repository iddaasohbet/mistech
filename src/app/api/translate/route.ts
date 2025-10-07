export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import * as deepl from 'deepl-node';

// Translation cache (in production, use Redis or database)
const translationCache = new Map<string, string>();

export async function POST(request: Request) {
  try {
    const { text, targetLang, sourceLang = 'tr' } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "Text and targetLang are required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${sourceLang}:${targetLang}:${text}`;
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({
        translatedText: translationCache.get(cacheKey),
        cached: true
      });
    }

    // Check if API key is configured
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey || apiKey === 'your_deepl_api_key_here') {
      // Fallback: Return original text if no API key
      console.warn('DeepL API key not configured, returning original text');
      return NextResponse.json({
        translatedText: text,
        cached: false,
        note: "API key not configured"
      });
    }

    // Translate using DeepL
    const translator = new deepl.Translator(apiKey);
    
    const result = await translator.translateText(
      text,
      sourceLang as deepl.SourceLanguageCode,
      targetLang as deepl.TargetLanguageCode
    );

    const first = Array.isArray(result) ? result[0] : result;
    const translatedText = first.text;

    // Cache the translation
    translationCache.set(cacheKey, translatedText);

    return NextResponse.json({
      translatedText,
      cached: false,
      detectedSourceLang: (first as any).detectedSourceLang
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    
    // If DeepL fails, return original text
    try {
      const { text } = await request.json();
      return NextResponse.json({
        translatedText: text,
        error: error.message,
        fallback: true
      });
    } catch {
      return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
    }
  }
}

