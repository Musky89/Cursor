import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  competitors: z.array(z.string().min(2).max(100)).min(1).max(5),
  yourBrand: z.string().min(2).max(100),
  market: z.string().min(2).max(100),
  channel: z.enum(["META", "TIKTOK", "GOOGLE"]).optional(),
});

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) {
    _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return _openai;
}

async function scanAdLibrary(brand: string, country: string = "ZA"): Promise<string> {
  try {
    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${encodeURIComponent(brand)}&search_type=keyword_unordered`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    });
    if (!res.ok) return `Could not access Ad Library for ${brand}`;
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();
    return $("body").text().replace(/\s+/g, " ").trim().slice(0, 2000);
  } catch {
    return `Ad Library scan failed for ${brand}. Using general market knowledge.`;
  }
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide competitors array, yourBrand, and market.", 400);

  const { competitors, yourBrand, market, channel = "META" } = parsed.data;

  const scans: { competitor: string; adLibraryData: string }[] = [];
  for (const comp of competitors) {
    const data = await scanAdLibrary(comp);
    scans.push({ competitor: comp, adLibraryData: data });
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a competitive advertising intelligence system. Analyze multiple competitors' advertising activities and generate a strategic brief for the client. Think like a war room strategist.

Return JSON:
{
  "overallThreatLevel": "low|medium|high|critical",
  "competitorInsights": [{
    "name": "competitor name",
    "estimatedAdSpend": "estimated monthly ad spend range",
    "primaryMessaging": "their main messaging themes",
    "targetAudience": "who they're targeting",
    "creativeApproach": "visual/creative style",
    "weakSpots": ["exploitable weaknesses"],
    "recentMoves": ["recent strategic shifts or new campaigns"]
  }],
  "marketGaps": ["opportunities none of the competitors are addressing"],
  "urgentCounterMoves": [{
    "trigger": "what the competitor did",
    "response": "what you should do",
    "headline": "suggested ad headline",
    "channel": "which channel",
    "priority": "high|medium|low",
    "timeframe": "immediate|this week|this month"
  }],
  "weeklyBrief": "A 200-word strategic summary a CMO would read Monday morning — what happened, what to do, and why it matters",
  "generatedAt": "current timestamp"
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          yourBrand,
          market,
          channel,
          competitors: scans.map((s) => ({
            name: s.competitor,
            adLibrarySnapshot: s.adLibraryData.substring(0, 1000),
          })),
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Analysis failed.", 502);

  const radar = JSON.parse(content);
  radar.generatedAt = new Date().toISOString();

  return Response.json({ radar });
}
