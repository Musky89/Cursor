import "server-only";

import * as cheerio from "cheerio";
import OpenAI from "openai";

export type AdLibraryResult = {
  competitor: string;
  activeAdCount: number;
  adPatterns: {
    commonThemes: string[];
    creativeTrends: string[];
    messagingPatterns: string[];
    callToActions: string[];
    weaknesses: string[];
  };
  counterStrategy: {
    angles: { headline: string; rationale: string }[];
    gaps: string[];
    opportunities: string[];
  };
};

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) {
    _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return _openai;
}

async function searchAdLibrary(brand: string): Promise<string> {
  try {
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ZA&q=${encodeURIComponent(brand)}&search_type=keyword_unordered`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    if (!res.ok) return `Unable to fetch Ad Library (HTTP ${res.status}). Using brand knowledge instead.`;

    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 3000);
    return text || "No ad content found. Using brand knowledge instead.";
  } catch {
    return "Ad Library not accessible. Using brand knowledge and public information instead.";
  }
}

export async function analyzeCompetitorAds(competitor: string, yourBrand: string, market: string): Promise<AdLibraryResult> {
  const client = getClient();
  if (!client) throw new Error("OPENAI_API_KEY required.");

  const adLibraryData = await searchAdLibrary(competitor);

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a competitive advertising intelligence analyst. Analyze a competitor's advertising strategy and generate counter-strategies. Use your knowledge of the brand's known advertising patterns, campaigns, and positioning.

Return JSON:
- competitor: string
- activeAdCount: number (estimated based on brand size and market activity)
- adPatterns: {commonThemes: string[], creativeTrends: string[], messagingPatterns: string[], callToActions: string[], weaknesses: string[]}
- counterStrategy: {angles: [{headline, rationale}], gaps: string[], opportunities: string[]}

Be specific about the ${market} market. These insights should be immediately actionable for ad creation.`,
      },
      {
        role: "user",
        content: `Analyze ${competitor}'s advertising strategy in ${market}. I'm building campaigns for ${yourBrand} to compete against them. Ad Library data: ${adLibraryData.slice(0, 2000)}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No analysis returned.");

  return JSON.parse(content) as AdLibraryResult;
}
