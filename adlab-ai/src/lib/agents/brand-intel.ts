import "server-only";

import * as cheerio from "cheerio";
import OpenAI from "openai";

export type BrandProfile = {
  name: string;
  tagline: string;
  description: string;
  products: { name: string; description: string; price: string }[];
  brandVoice: {
    tone: string;
    vocabulary: string[];
    personality: string;
    avoidWords: string[];
  };
  visualIdentity: {
    primaryColors: string[];
    style: string;
    photography: string;
    mood: string;
  };
  targetAudience: string;
  competitivePosition: string;
  socialProof: string[];
  rawExcerpts: string[];
};

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) {
    _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return _openai;
}

async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AdLabBot/1.0; +https://adlab.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractSiteContent(html: string, url: string) {
  const $ = cheerio.load(html);

  $("script, style, noscript, iframe, svg").remove();

  const title = $("title").text().trim();
  const metaDescription = $('meta[name="description"]').attr("content") || "";
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDescription = $('meta[property="og:description"]').attr("content") || "";

  const headings = $("h1, h2, h3")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 2 && t.length < 200)
    .slice(0, 20);

  const paragraphs = $("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 20 && t.length < 500)
    .slice(0, 15);

  const links = $("a")
    .map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr("href") || "" }))
    .get()
    .filter((l) => l.text.length > 1 && l.text.length < 100)
    .slice(0, 30);

  const images = $("img")
    .map((_, el) => ({ src: $(el).attr("src") || "", alt: $(el).attr("alt") || "" }))
    .get()
    .filter((img) => img.alt.length > 2)
    .slice(0, 10);

  const prices = $("body")
    .text()
    .match(/[R$€£]\s?\d[\d,.\s]*\d/g)
    ?.slice(0, 10) ?? [];

  const colors: string[] = [];
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const matches = style.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)/g);
    if (matches) colors.push(...matches);
  });
  $('meta[name="theme-color"]').each((_, el) => {
    const c = $(el).attr("content");
    if (c) colors.push(c);
  });

  return {
    url,
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    headings,
    paragraphs,
    links: links.map((l) => `${l.text} (${l.href})`),
    images: images.map((i) => i.alt),
    prices,
    colors: [...new Set(colors)].slice(0, 10),
  };
}

function resolveUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("@")) return `https://www.instagram.com/${trimmed.slice(1)}/`;
  if (trimmed.match(/^[a-zA-Z0-9._]+$/) && !trimmed.includes(".")) return `https://www.instagram.com/${trimmed}/`;
  if (!trimmed.startsWith("http")) return `https://${trimmed}`;
  return trimmed;
}

function extractInstagramHandle(url: string): string | null {
  const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}

export async function analyzeBrand(rawInput: string): Promise<BrandProfile> {
  const client = getClient();
  if (!client) throw new Error("OPENAI_API_KEY required for brand analysis.");

  const url = resolveUrl(rawInput);
  const instaHandle = extractInstagramHandle(url);

  let html: string;
  let actualUrl = url;

  if (instaHandle) {
    const websiteGuesses = [
      `https://www.${instaHandle.replace(/[_.]sa$|[_.]za$/i, "")}.co.za`,
      `https://${instaHandle.replace(/[_.]sa$|[_.]za$/i, "")}.co.za`,
      `https://www.${instaHandle}.com`,
    ];

    let found = false;
    for (const guess of websiteGuesses) {
      try {
        const testHtml = await fetchPage(guess);
        if (testHtml.length > 1000 && !testHtml.includes("404") && !testHtml.includes("not found")) {
          html = testHtml;
          actualUrl = guess;
          found = true;
          break;
        }
      } catch { /* try next */ }
    }

    if (!found) {
      html = await fetchPage(url);
    } else {
      html = html!;
    }
  } else {
    html = await fetchPage(url);
  }
  const siteData = extractSiteContent(html, actualUrl);

  const subPages: string[] = [];
  const baseUrl = new URL(actualUrl);
  const $ = cheerio.load(html);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname === baseUrl.hostname && resolved.pathname !== baseUrl.pathname && !resolved.pathname.includes("#")) {
        subPages.push(resolved.href);
      }
    } catch { /* skip */ }
  });

  const uniqueSubPages = [...new Set(subPages)].slice(0, 4);
  const subPageData = [];
  for (const sp of uniqueSubPages) {
    try {
      const spHtml = await fetchPage(sp);
      subPageData.push(extractSiteContent(spHtml, sp));
    } catch { /* skip */ }
  }

  const allData = [siteData, ...subPageData];

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a brand strategist and market researcher. Analyze scraped website data and build a comprehensive brand profile. Return JSON with exactly these keys:
- name: string (brand name)
- tagline: string (their main tagline/slogan)
- description: string (what the brand does, 2-3 sentences)
- products: array of {name, description, price} (their main products/services)
- brandVoice: {tone: string, vocabulary: string[] (10 words they use frequently), personality: string (1 sentence), avoidWords: string[] (words that don't fit their brand)}
- visualIdentity: {primaryColors: string[] (hex codes if found, or color names), style: string, photography: string (describe their visual style), mood: string}
- targetAudience: string (who they're targeting based on their messaging)
- competitivePosition: string (how they position against competitors)
- socialProof: string[] (any claims, stats, testimonials found)
- rawExcerpts: string[] (5 most brand-defining sentences from the site)

Be specific and evidence-based. Don't guess — only report what the data shows.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          instruction: "Analyze this brand from their website content",
          pages: allData.map((d) => ({
            url: d.url,
            title: d.title,
            meta: d.metaDescription,
            headings: d.headings,
            paragraphs: d.paragraphs,
            prices: d.prices,
            colors: d.colors,
            imageAlts: d.images,
          })),
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No analysis returned.");

  return JSON.parse(content) as BrandProfile;
}
