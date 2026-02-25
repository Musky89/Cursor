export type BrandStyle = {
  name: string;
  description: string;
  visualIdentity: {
    colorPalette: string;
    typography: string;
    photographyStyle: string;
    compositionRules: string;
    moodAndTone: string;
    lighting: string;
  };
  adFormats: {
    meta: string;
    tiktok: string;
    google: string;
  };
  negativePrompt: string;
};

export const brandStyles: Record<string, BrandStyle> = {
  "pepsi-inspired": {
    name: "Pepsi-Inspired (Electric Youth)",
    description: "High-energy, youthful, pop-culture-forward. Think Pepsi's Super Bowl aesthetic — celebrities, neon lights, stadium energy, street-level cool.",
    visualIdentity: {
      colorPalette: "Electric blue (#0059AB), pure white, cherry red accents. Neon cyan and magenta highlights. Deep black backgrounds for contrast. Gradient blue-to-purple for hero shots.",
      typography: "Bold sans-serif, uppercase headlines, condensed tracking. Glowing/neon text effects. Numbers and stats in oversized display type.",
      photographyStyle: "Cinematic wide-angle hero shots. Models in motion — jumping, dancing, celebrating. Shallow depth of field with bokeh city lights. Product shot with condensation droplets, ice splash, and dynamic liquid pour. Celebrity endorsement-style framing. Hyper-real commercial photography, 8K resolution.",
      compositionRules: "Product always center or golden-ratio positioned. Human subjects at eye level or slightly below (empowering angle). Diagonal energy lines. Generous negative space for text overlay. Rule of thirds with the can/bottle at intersection point.",
      moodAndTone: "Electrifying, celebratory, aspirational but accessible. 'This is your moment' energy. Stadium concert vibes meets street culture authenticity.",
      lighting: "Dramatic rim lighting with neon spill. Three-point cinematic setup with strong key light. Blue-hour outdoor shots. LED and neon practical lights in frame. High contrast, crushed blacks, lifted highlights.",
    },
    adFormats: {
      meta: "16:9 hero banner or 1:1 square feed post. Product hero left, lifestyle scene right. Bold headline overlay with knockout text. CTA button mock-up in brand blue.",
      tiktok: "9:16 vertical. Full-bleed lifestyle shot. Product reveal in lower third. Text-safe zone respected. Feels like a paused moment from a music video.",
      google: "Clean 1200x628 landscape. Product on white/gradient. Minimal text, maximum impact. Price/offer badge in corner.",
    },
    negativePrompt: "No clip art, no cartoons, no flat design, no stock photo watermarks, no amateur photography, no harsh flash, no cluttered compositions, no small product shots, no boring static poses",
  },

  "coke-inspired": {
    name: "Coke-Inspired (Authentic Moments)",
    description: "Warm, real, emotionally resonant. Think Coca-Cola's 'Share a Coke' and 'Open Happiness' — genuine human connection, golden-hour warmth, everyday magic.",
    visualIdentity: {
      colorPalette: "Iconic red (#F40009), warm white, caramel gold accents. Sunset oranges and warm ambers in lifestyle shots. Minimal red used surgically for maximum impact — on the product, on the CTA, nowhere else.",
      typography: "Classic Spencerian script for brand name, clean humanist sans-serif for body copy. Warm, friendly, never aggressive. Handwritten textures welcome.",
      photographyStyle: "Photojournalistic candid moments. Real people (not models) sharing genuine emotions — laughing, hugging, toasting with the product. Shot on 35mm film aesthetic with grain and warmth. Macro product shots with beaded condensation on glass bottle. Environmental portraits in real locations. Annie Leibovitz meets street photography.",
      compositionRules: "Product integrated naturally into the scene — held in hand, on a table, being poured. Never isolated floating in space. Human faces always visible and emotionally expressive. Environmental context tells a story. Leading lines draw eye to the product organically.",
      moodAndTone: "Warm nostalgia, genuine happiness, community and togetherness. 'Life tastes good' energy. Sunday afternoon braai with friends. The kind of warmth that makes you smile involuntarily.",
      lighting: "Golden hour everything. Warm natural light spilling through windows. Soft fill, no harsh shadows. Practical warm lights — string lights, candles, fire pits. Film-grade color temperature leaning warm (5000-6000K). Subtle lens flare welcome.",
    },
    adFormats: {
      meta: "1:1 or 4:5 portrait feed post. Candid lifestyle moment with product naturally visible. Minimal text overlay — let the image do the talking. Warm gradient overlay if text is needed.",
      tiktok: "9:16 vertical. Feels like a friend's story, not an ad. Real location, real moment. Product appears naturally. Authentic, not posed.",
      google: "1200x628 landscape. Split layout — emotional moment on left, product beauty shot on right. Clean, warm, inviting.",
    },
    negativePrompt: "No neon, no harsh contrast, no studio-sterile backgrounds, no aggressive poses, no stock photo smiles, no corporate feeling, no isolated products on white, no digital-looking renders, no cold color temperatures",
  },
};

export function buildCreativeBrief(
  basePrompt: string,
  brandStyleKey: string,
  channel: string,
  product: { name: string; description: string },
  audience: { name: string; notes: string | null },
): string {
  const style = brandStyles[brandStyleKey];
  if (!style) return basePrompt;

  const vi = style.visualIdentity;
  const format = style.adFormats[channel.toLowerCase() as keyof typeof style.adFormats] ?? style.adFormats.meta;

  return [
    `CREATE A PREMIUM ADVERTISING PHOTOGRAPH for ${product.name}.`,
    ``,
    `BRAND VISUAL IDENTITY:`,
    `Color palette: ${vi.colorPalette}`,
    `Photography style: ${vi.photographyStyle}`,
    `Lighting: ${vi.lighting}`,
    `Composition: ${vi.compositionRules}`,
    `Mood: ${vi.moodAndTone}`,
    ``,
    `AD FORMAT: ${format}`,
    ``,
    `CREATIVE DIRECTION: ${basePrompt}`,
    ``,
    `PRODUCT: ${product.name} — ${product.description}`,
    `TARGET AUDIENCE: ${audience.name}${audience.notes ? ` — ${audience.notes}` : ""}`,
    ``,
    `TECHNICAL: Professional commercial photography, 8K resolution, shot on Hasselblad H6D-100c or RED V-RAPTOR,`,
    `post-processed in Capture One with brand-grade color science. Print-ready quality.`,
    ``,
    `AVOID: ${style.negativePrompt}`,
  ].join("\n");
}
