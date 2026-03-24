import "server-only";

import { getCanonContext } from "./creative-canon";
import OpenAI from "openai";
import { brandStyles, type BrandStyle } from "./brand-styles";

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) {
    _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return _openai;
}

type ArtDirectorInput = {
  concept: {
    headline: string;
    hook: string;
    angle: string;
    cta: string;
    imagePrompt: string;
    channel: string;
  };
  product: {
    name: string;
    description: string;
    price: number;
  };
  audience: {
    name: string;
    painPoints: string;
    desires: string;
    notes: string | null;
  };
  brandStyleKey: string | undefined;
  customDirection?: string | undefined;
};

const SYSTEM_PROMPT = `You are a world-class advertising art director at a top-tier creative agency (Wieden+Kennedy / Droga5 caliber) with deep knowledge of advertising history from the 1920s Golden Age through the Bernbach Creative Revolution, the Nike/Apple Image Era, the Digital/Social era, and today's AI-native creator economy. Your job is to take an ad concept and transform it into a hyper-specific photographic brief that will produce award-winning commercial imagery.

You think in terms of:
- CAMERA: Exact lens (e.g. "Canon 85mm f/1.2 at f/2"), angle (e.g. "low angle, 15 degrees up"), distance
- LIGHTING: Exact setup (e.g. "key light: 4ft octabox camera left at 45 degrees, fill: silver reflector camera right, hair light: strip box from behind at 60 degrees, practical: neon sign spilling magenta")
- TALENT: Exact descriptions of people — ethnicity, age, expression, wardrobe, pose, action, emotion
- LOCATION: Exact setting with specific details — textures, colors, objects, weather, time of day
- PRODUCT: Exact placement, angle, condition (condensation, grip, label visibility), how it interacts with the scene
- COMPOSITION: Rule of thirds placement, foreground/midground/background layers, depth of field, leading lines
- COLOR GRADE: Exact color science — shadows warm/cool, highlight treatment, saturation zones, film stock reference
- POST-PRODUCTION: Retouching notes, compositing layers, text overlay zones, crop marks

Your brief must be so specific that any photographer could execute it and get the same result. No ambiguity. No "make it look good" — every decision is made.

OUTPUT: Return ONLY the image generation prompt. No explanations, no preamble, no markdown. Just the prompt text, 200-500 words.`;

export async function artDirectPrompt(input: ArtDirectorInput): Promise<string> {
  const client = getClient();
  if (!client) {
    return input.concept.imagePrompt;
  }

  const style = input.brandStyleKey ? brandStyles[input.brandStyleKey] : null;

  const userPrompt = buildUserPrompt(input, style);

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const result = completion.choices[0]?.message?.content?.trim();
    if (!result || result.length < 50) {
      return input.concept.imagePrompt;
    }

    return result;
  } catch {
    return input.concept.imagePrompt;
  }
}

function buildUserPrompt(input: ArtDirectorInput, style: BrandStyle | null): string {
  const lines: string[] = [
    `BRIEF: Create the hero image for this ad campaign.`,
    ``,
    `AD CONCEPT:`,
    `  Headline: ${input.concept.headline}`,
    `  Hook: ${input.concept.hook}`,
    `  Angle: ${input.concept.angle}`,
    `  CTA: ${input.concept.cta}`,
    `  Channel: ${input.concept.channel}`,
    ``,
    `PRODUCT:`,
    `  ${input.product.name} — ${input.product.description}`,
    `  Price point: $${input.product.price}`,
    ``,
    `TARGET AUDIENCE:`,
    `  ${input.audience.name}`,
    `  Pain points: ${input.audience.painPoints}`,
    `  Desires: ${input.audience.desires}`,
  ];

  if (input.audience.notes) {
    lines.push(`  Cultural context: ${input.audience.notes}`);
  }

  if (style) {
    lines.push(
      ``,
      `BRAND STYLE GUIDE:`,
      `  Style: ${style.name}`,
      `  Color palette: ${style.visualIdentity.colorPalette}`,
      `  Photography: ${style.visualIdentity.photographyStyle}`,
      `  Lighting: ${style.visualIdentity.lighting}`,
      `  Composition: ${style.visualIdentity.compositionRules}`,
      `  Mood: ${style.visualIdentity.moodAndTone}`,
      ``,
      `  AVOID: ${style.negativePrompt}`,
    );

    const format = style.adFormats[input.concept.channel.toLowerCase() as keyof typeof style.adFormats];
    if (format) {
      lines.push(`  Format spec: ${format}`);
    }
  }

  const canonContext = getCanonContext(input.concept.channel);

  if (input.customDirection) {
    lines.push(``, `CUSTOM ART DIRECTION FROM CLIENT: ${input.customDirection}`);
    lines.push(`IMPORTANT: The custom direction above takes priority over all other style guidance. Follow it precisely.`);
  }

  lines.push(
    ``,
    canonContext,
    ``,
    `ORIGINAL CREATIVE DIRECTION: ${input.concept.imagePrompt}`,
    ``,
    `Apply the Creative Canon principles above. Reference specific techniques from advertising history where relevant. This must look like it came from a $500K campaign shoot, not AI.`,
  );

  return lines.join("\n");
}
