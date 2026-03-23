/**
 * THE CREATIVE CANON
 *
 * A structured knowledge base encoding the principles, techniques, and patterns
 * from 100 years of the world's best advertising creative. This is the AI's
 * "art school education" — the accumulated wisdom of the greatest campaigns
 * distilled into actionable generation rules.
 *
 * Sources: Cannes Lions Grand Prix winners, D&AD Black Pencils, One Show Gold,
 * Clio Awards, Communication Arts, The Art Directors Club, and the definitive
 * advertising campaigns of the 20th and 21st centuries.
 */

export type CreativeEra = {
  period: string;
  name: string;
  keyPrinciples: string[];
  visualTechniques: string[];
  copywritingRules: string[];
  iconicReferences: string[];
};

export type CreativeArchetype = {
  name: string;
  description: string;
  visualFormula: string;
  copyFormula: string;
  whenToUse: string[];
  iconicExamples: string[];
  photographyNotes: string;
};

export type DesignPrinciple = {
  name: string;
  rule: string;
  application: string;
  commonMistake: string;
};

export const CREATIVE_ERAS: CreativeEra[] = [
  {
    period: "1920s-1950s",
    name: "Golden Age of Illustration",
    keyPrinciples: [
      "Single dominant visual tells the entire story",
      "Aspirational lifestyle positioning — show the life the product enables",
      "Emotional benefit over functional feature",
      "Consistent brand characters create familiarity (Jolly Green Giant, Betty Crocker, Michelin Man)",
    ],
    visualTechniques: [
      "Hand-illustrated hero imagery with photographic detail",
      "Strong silhouettes that read from across a room",
      "Warm, saturated color palettes that feel inviting",
      "Product integrated naturally into lifestyle scenes",
    ],
    copywritingRules: [
      "Headline does the heavy lifting — 80% of people read only the headline",
      "Promise a specific transformation, not a feature",
      "Use 'you' — speak directly to one person, not an audience",
    ],
    iconicReferences: [
      "Volkswagen 'Think Small' (1959) — broke every rule: tiny product, massive whitespace, honest copy",
      "Coca-Cola Santa Claus campaigns — invented modern Christmas imagery",
      "Lucky Strike 'It's Toasted' — first lifestyle positioning in tobacco",
    ],
  },
  {
    period: "1960s-1970s",
    name: "Creative Revolution (Bernbach Era)",
    keyPrinciples: [
      "Art and copy are inseparable — they must work as one idea",
      "Simplicity is sophistication — one message per ad",
      "Humor and self-deprecation build trust",
      "Respect the audience's intelligence — never talk down",
      "The best idea wins, not the biggest budget",
    ],
    visualTechniques: [
      "Massive whitespace — let the idea breathe",
      "Black and white photography for gravitas and authenticity",
      "Visual metaphors that deliver the message without words",
      "Deliberately 'ugly' or unexpected compositions that demand attention",
    ],
    copywritingRules: [
      "Short, punchy headlines that reframe the conversation",
      "Body copy that reads like a conversation, not a press release",
      "The first line must earn the right to the second line",
      "End with a twist that makes the reader smile or think",
    ],
    iconicReferences: [
      "VW 'Lemon' (1960) — called their own product a lemon, then explained why that's good",
      "Avis 'We Try Harder' — turned being #2 into an advantage",
      "Levy's Rye Bread 'You don't have to be Jewish' — diversity before it was a strategy",
    ],
  },
  {
    period: "1980s-1990s",
    name: "Image Era (Big Idea + Big Production)",
    keyPrinciples: [
      "Brand as lifestyle — you're not buying a product, you're joining a tribe",
      "Provocative imagery that generates cultural conversation",
      "Celebrity as brand amplifier — but the idea must work without them",
      "Emotional storytelling over rational persuasion",
    ],
    visualTechniques: [
      "Cinematic production values — ads that look like movie posters",
      "High-contrast, dramatic lighting (Annie Leibovitz, Herb Ritts influence)",
      "Stark, confrontational portraits that challenge the viewer",
      "Color as emotion — Tiffany blue, Coca-Cola red become cultural signals",
    ],
    copywritingRules: [
      "Taglines that become part of language ('Just Do It', 'Think Different', 'Got Milk?')",
      "Less copy, more impact — some of the best ads had 3 words or fewer",
      "Questions that the reader answers with the brand",
    ],
    iconicReferences: [
      "Nike 'Just Do It' (1988) — three words that built a $30B brand",
      "Apple '1984' Super Bowl — advertising as cultural event",
      "Absolut Vodka bottle campaigns — product AS the creative device",
      "Benetton 'United Colors' — controversy as brand strategy",
    ],
  },
  {
    period: "2000s-2010s",
    name: "Digital + Social + Purpose Era",
    keyPrinciples: [
      "Shareability is the new media buy — content must earn its reach",
      "Authenticity beats polish — UGC outperforms studio work",
      "Purpose-driven brands outperform — stand for something",
      "Real-time relevance — cultural moment marketing",
      "Mobile-first composition — thumb-stopping power",
    ],
    visualTechniques: [
      "Vertical video as a native format, not an afterthought",
      "Documentary/photojournalistic style over studio perfection",
      "User-generated aesthetic — intentionally imperfect",
      "Data visualization as creative expression",
      "Minimal text overlay with bold sans-serif type",
    ],
    copywritingRules: [
      "First 3 seconds decide everything — front-load the hook",
      "Write for scanning, not reading — short paragraphs, line breaks",
      "Emoji as punctuation and emotional shorthand",
      "Call-to-action is a conversation starter, not a command",
    ],
    iconicReferences: [
      "Dove 'Real Beauty' — redefined beauty standards in advertising",
      "Old Spice 'The Man Your Man Could Smell Like' — internet-native virality",
      "Oreo 'Dunk in the Dark' — real-time Super Bowl tweet that defined cultural marketing",
      "Always '#LikeAGirl' — purpose-driven that drove real cultural change",
    ],
  },
  {
    period: "2020s",
    name: "AI-Native + Creator Economy Era",
    keyPrinciples: [
      "Personalization at scale — every viewer sees a version tailored to them",
      "Creator credibility > brand authority — people trust people",
      "Lo-fi authenticity outperforms high-production content on social",
      "Interactive and participatory — audiences co-create the campaign",
      "Speed to market is a competitive advantage — first to the trend wins",
    ],
    visualTechniques: [
      "Phone-native aesthetic — shot on iPhone is a style choice, not a limitation",
      "Split-screen before/after comparisons",
      "Text-heavy short-form video (subtitle-forward content)",
      "ASMR and sensory-focused close-ups for food/product",
      "Green screen and AR effects as native creative tools",
    ],
    copywritingRules: [
      "Hook in 1 second — 'Wait for it' is dead, lead with the payoff",
      "Write like you talk — conversational, not copywritten",
      "Use the platform's native language (TikTok sounds, IG music, meme formats)",
      "Controversy and hot takes drive engagement",
    ],
    iconicReferences: [
      "Apple 'Shot on iPhone' — user-generated content as premium campaign",
      "Spotify Wrapped — data personalization as shareable content",
      "Liquid Death — turning water into a punk rock brand with zero product innovation",
      "Duolingo TikTok — brand as unhinged character, not corporate voice",
    ],
  },
];

export const CREATIVE_ARCHETYPES: CreativeArchetype[] = [
  {
    name: "The Provocateur",
    description: "Deliberately controversial or unexpected creative that forces a double-take. Breaks category conventions to generate talk value.",
    visualFormula: "Unexpected juxtaposition OR confrontational subject matter OR visual that contradicts the headline. High contrast, bold composition. The viewer should feel slightly uncomfortable or amused.",
    copyFormula: "Lead with a statement that seems wrong, then reveal why it's right. Use tension between what's expected and what's shown.",
    whenToUse: ["Challenger brands trying to disrupt a category", "Brands with nothing to lose", "Markets where all competitors look the same"],
    iconicExamples: ["Benetton shock campaigns", "Diesel 'Be Stupid'", "Liquid Death everything"],
    photographyNotes: "Harsh lighting, unconventional angles, sometimes intentionally 'ugly' or raw. The image should feel like it shouldn't be an ad.",
  },
  {
    name: "The Storyteller",
    description: "Emotional narrative that builds connection through human truth. The product is part of the story, not the subject of it.",
    visualFormula: "Cinematic framing, warm lighting, candid human moments. The product appears naturally in the scene, never forced. Shallow depth of field on emotional faces.",
    copyFormula: "Open with a universal human moment. Build emotional tension. Resolve with the brand as the enabler of that moment. End on warmth.",
    whenToUse: ["Heritage brands", "Family/community products", "Emotional purchase categories"],
    iconicExamples: ["John Lewis Christmas ads", "P&G 'Thank You Mom'", "Google 'Year in Search'"],
    photographyNotes: "Golden hour, film grain, warm tones. Feels like a memory, not an ad. People should be mid-action, not posing.",
  },
  {
    name: "The Minimalist",
    description: "Radical simplicity. One image, one thought, zero clutter. The negative space IS the design.",
    visualFormula: "Massive whitespace (or black space). Single product or visual element. No more than 5 elements total in the frame. Typography is architecture.",
    copyFormula: "3-7 word headline maximum. Sometimes just the logo. If you need a paragraph, the idea isn't good enough.",
    whenToUse: ["Premium/luxury brands", "Products with iconic design", "Established brands with high recognition"],
    iconicExamples: ["Apple product launches", "VW 'Think Small'", "MUJI everything"],
    photographyNotes: "Clean, precise, deliberate. Every pixel earns its place. Product photography should be flawless — no room to hide.",
  },
  {
    name: "The Demonstrator",
    description: "Shows the product benefit so clearly that no explanation is needed. The visual IS the proof.",
    visualFormula: "Before/after, cause/effect, or problem/solution in a single frame. The transformation should be instantly readable. Visual metaphors that make the benefit tangible.",
    copyFormula: "Often no copy needed — the image does all the work. If copy exists, it amplifies the visual, never explains it.",
    whenToUse: ["Products with clear functional benefits", "Cleaning, health, performance categories", "When competitors are all making claims"],
    iconicExamples: ["FedEx 'Neighbors' (continents shaped like adjacent parcels)", "Lego 'Imagine' (shadow play)", "Wonderbra 'Hello Boys'"],
    photographyNotes: "Crystal clear, no ambiguity. The demonstration must read in under 2 seconds. Often uses clever camera angles or props to create the illusion.",
  },
  {
    name: "The Cultural Insider",
    description: "Speaks the audience's language so fluently that it feels like it was made BY them, not FOR them. References their music, slang, memes, inside jokes.",
    visualFormula: "Looks like native content from the platform, not advertising. UGC aesthetic. Real locations, real style, real energy. The brand is a participant in culture, not an observer.",
    copyFormula: "Written in the audience's actual voice — their slang, their humor, their references. If a brand manager would flag it as 'off-brand,' it's probably perfect.",
    whenToUse: ["Youth-targeted brands", "Streetwear, music, food, nightlife", "Any brand trying to earn cultural credibility"],
    iconicExamples: ["Nike's neighborhood-specific campaigns", "Nando's topical commentary", "Duolingo's unhinged TikTok"],
    photographyNotes: "Shot in real locations the audience recognizes. Natural light, phone-quality acceptable. The people should look like the audience, not models.",
  },
  {
    name: "The Data Artist",
    description: "Transforms data, statistics, or information into visually stunning creative. Makes the invisible visible.",
    visualFormula: "Infographic-as-art. Data visualization that's beautiful enough to hang on a wall. Numbers become visual metaphors. Scale comparisons that shock.",
    copyFormula: "Lead with the most surprising statistic. Let the number do the persuading. Context is everything — '5 million' means nothing, '5 million per hour' means everything.",
    whenToUse: ["B2B and tech brands", "Social causes and awareness campaigns", "When you have a stat that would blow minds"],
    iconicExamples: ["Spotify Wrapped", "The Economist poster campaigns", "IBM 'Smarter Planet'"],
    photographyNotes: "Clean, graphic, precise. Often mixed-media — photography + illustration + typography. The design should feel intelligent.",
  },
];

export const TIMELESS_DESIGN_PRINCIPLES: DesignPrinciple[] = [
  {
    name: "Visual Hierarchy",
    rule: "The eye should move through the ad in a deliberate sequence: attention-grabber → key message → supporting info → CTA. Never let elements compete for attention.",
    application: "Size, contrast, color, and position control what the viewer sees first. The most important element should be 3-5x larger than secondary elements.",
    commonMistake: "Making everything the same size/weight because the client says everything is 'equally important.' Nothing is equally important.",
  },
  {
    name: "The 3-Second Rule",
    rule: "If the core message isn't communicated in 3 seconds, the ad fails. In social media, you have 1.5 seconds.",
    application: "Test by showing the ad to someone for 3 seconds, then taking it away. If they can't tell you the message and the brand, redesign.",
    commonMistake: "Burying the product or brand name in small type at the bottom. If they scroll past, you paid for nothing.",
  },
  {
    name: "Tension Creates Interest",
    rule: "The best ads contain a moment of tension — a contradiction, surprise, or question that the brain wants to resolve. Comfortable ads are forgettable ads.",
    application: "Create tension between headline and image, between expectation and reality, or between the problem and the unexpectedly simple solution.",
    commonMistake: "Resolving the tension too quickly. Let the viewer sit with the discomfort for a beat before the payoff.",
  },
  {
    name: "Color as Communication",
    rule: "Color is not decoration — it's information. Every color choice should have a strategic reason. If you can't explain why it's that color, it's wrong.",
    application: "Warm colors (red, orange, yellow) drive urgency and appetite. Cool colors (blue, green) build trust and calm. Use brand colors surgically — don't paint everything red just because your logo is red.",
    commonMistake: "Using too many colors. The best ads use 2-3 colors max. Additional colors dilute impact.",
  },
  {
    name: "Typography is Voice",
    rule: "The typeface IS the brand's tone of voice made visible. Serif = authority/heritage. Sans-serif = modern/clean. Script = personal/warm. Display = bold/expressive.",
    application: "Choose ONE headline font and ONE body font. Never more than two. The headline font should match the brand personality. Body should be invisible — easy to read, hard to notice.",
    commonMistake: "Using 'creative' fonts that sacrifice readability. If someone has to work to read your headline, they won't.",
  },
  {
    name: "Negative Space is Active",
    rule: "Empty space is not wasted space — it's the most powerful design element. It creates focus, breathing room, and perceived premium quality.",
    application: "When in doubt, remove elements rather than adding them. The fewer things in the frame, the more important each remaining element becomes. Luxury brands use 60-80% negative space.",
    commonMistake: "Filling every inch of the canvas because you're 'paying for the space.' You're paying for attention, not pixels.",
  },
  {
    name: "Authenticity Over Perfection",
    rule: "In the social media era, imperfect = authentic = trustworthy. Over-polished content signals 'ad' and triggers scroll-past behavior.",
    application: "For social platforms, shoot in real environments with natural light. Allow slight imperfections — a hair out of place, a real kitchen instead of a studio. The content should feel discovered, not produced.",
    commonMistake: "Applying this rule to ALL channels. Billboards and print still demand perfection. The rule is platform-specific.",
  },
  {
    name: "The Product is the Hero",
    rule: "In the final output, the product must be unmistakably the star. Every other element exists to make the product look better, feel more desirable, or seem more necessary.",
    application: "The product should be in the visual 'hot zone' (upper-left for reading cultures, center for social). If you cover the product with your hand and the ad still works, the product isn't important enough.",
    commonMistake: "Making the lifestyle or model the hero instead of the product. People should remember the product, not the background.",
  },
];

export function getCanonContext(channel: string, archetype?: string): string {
  const era = CREATIVE_ERAS[CREATIVE_ERAS.length - 1];
  const selectedArchetype = archetype
    ? CREATIVE_ARCHETYPES.find((a) => a.name.toLowerCase().includes(archetype.toLowerCase()))
    : null;

  const relevantPrinciples = TIMELESS_DESIGN_PRINCIPLES.slice(0, 4);

  let context = `CREATIVE CANON CONTEXT (${era.name}):\n`;
  context += `Key principles: ${era.keyPrinciples.join(". ")}.\n`;
  context += `Visual techniques: ${era.visualTechniques.join(". ")}.\n`;
  context += `Copy rules: ${era.copywritingRules.join(". ")}.\n\n`;

  if (selectedArchetype) {
    context += `ARCHETYPE: ${selectedArchetype.name}\n`;
    context += `Visual formula: ${selectedArchetype.visualFormula}\n`;
    context += `Photography: ${selectedArchetype.photographyNotes}\n\n`;
  }

  context += `DESIGN PRINCIPLES:\n`;
  for (const p of relevantPrinciples) {
    context += `- ${p.name}: ${p.rule}\n`;
  }

  return context;
}
