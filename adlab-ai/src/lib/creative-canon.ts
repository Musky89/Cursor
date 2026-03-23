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

// ─── ICONIC CAMPAIGNS DATABASE ──────────────────────────────────
// Why each campaign worked, what technique it used, and how to reference it

export type IconicCampaign = {
  brand: string;
  campaign: string;
  year: string;
  agency: string;
  category: string;
  whyItWorked: string;
  visualTechnique: string;
  copyTechnique: string;
  lessonForAI: string;
};

export const ICONIC_CAMPAIGNS: IconicCampaign[] = [
  // ── FOOD & BEVERAGE ──
  { brand: "Coca-Cola", campaign: "Share a Coke", year: "2011", agency: "Ogilvy Sydney", category: "beverage",
    whyItWorked: "Personalization at mass scale. Replaced the logo with first names. Made a global brand feel intimate.",
    visualTechnique: "Product AS the creative — the can/bottle label was the ad. Clean product shots on bright backgrounds.",
    copyTechnique: "The name IS the headline. No slogan needed. The personalization does the emotional work.",
    lessonForAI: "When generating beverage ads, consider making the packaging the hero creative element. Personal connection beats corporate messaging." },
  { brand: "McDonald's", campaign: "I'm Lovin' It", year: "2003", agency: "Heye & Partner", category: "food",
    whyItWorked: "Global consistency with local execution. The jingle is universally recognizable. Associates fast food with joy, not just hunger.",
    visualTechnique: "Close-up food shots with visible steam/melt. Golden arches as visual shorthand. Bright, warm, appetite-inducing lighting.",
    copyTechnique: "Five syllables that capture an emotion. Translated into 20+ languages while keeping the feeling.",
    lessonForAI: "Food ads work best when they trigger physical craving — steam, melt, drip, sizzle. Show the food at the exact moment of maximum appetite appeal." },
  { brand: "Guinness", campaign: "Surfer / noitulovE", year: "1999", agency: "AMV BBDO", category: "beverage",
    whyItWorked: "Made waiting (the pour) into a virtue. 'Good things come to those who wait' turned a product weakness into brand philosophy.",
    visualTechnique: "Cinematic slow-motion, dramatic black and white imagery, waves crashing. Epic scale for a pint of beer.",
    copyTechnique: "Patience as a luxury. Elevated a commodity product to an experience worth anticipating.",
    lessonForAI: "Turn product weaknesses into strengths. If a product takes time, make the wait part of the story." },
  { brand: "KFC", campaign: "FCK Bucket", year: "2018", agency: "Mother London", category: "food",
    whyItWorked: "Turned a PR crisis (chicken shortage) into the most awarded print ad of the year. Radical honesty and humor.",
    visualTechnique: "Single image: empty KFC bucket with letters rearranged to 'FCK'. Massive whitespace. Nothing else needed.",
    copyTechnique: "Self-deprecating apology that felt human, not corporate. The rearranged letters were the entire joke.",
    lessonForAI: "In crisis or humor contexts, less is exponentially more. One bold visual + one clever word can outperform any amount of production." },
  { brand: "Burger King", campaign: "Moldy Whopper", year: "2020", agency: "Ingo/David", category: "food",
    whyItWorked: "Showed a Whopper decomposing over 34 days to prove no artificial preservatives. Deliberately ugly = radically honest.",
    visualTechnique: "Time-lapse of food rotting. Deliberately repulsive imagery in a category that only shows perfection.",
    copyTechnique: "'The beauty of no artificial preservatives.' Reframed ugly as beautiful.",
    lessonForAI: "Breaking category visual conventions creates massive attention. In food, showing imperfection can signal authenticity." },
  { brand: "Absolut Vodka", campaign: "Absolut Bottle", year: "1981-2005", agency: "TBWA", category: "beverage",
    whyItWorked: "25 years, 1500+ executions, all based on the bottle silhouette. Proved that consistency + creativity = icon status.",
    visualTechnique: "The bottle shape as creative canvas. Every ad found the bottle shape in unexpected places — cities, art, fashion, nature.",
    copyTechnique: "Two-word formula: 'Absolut [Something].' Absolut Perfection. Absolut Brooklyn. Absolut Warhol.",
    lessonForAI: "Product shape can be the creative device. Look for the brand's most distinctive physical feature and build the entire visual around it." },
  { brand: "Heineken", campaign: "Worlds Apart", year: "2017", agency: "Publicis London", category: "beverage",
    whyItWorked: "People with opposing political views built furniture together, then discovered their differences over a beer. Real human connection.",
    visualTechnique: "Documentary-style footage, natural lighting, real people (not actors). The rawness was the production value.",
    copyTechnique: "Let the story tell itself. Minimal branding until the end. The beer was the bridge, not the subject.",
    lessonForAI: "For brands wanting to show social purpose, documentary realism beats studio production." },
  { brand: "Pepsi", campaign: "Pepsi Generation / Choice of a New Generation", year: "1984", agency: "BBDO", category: "beverage",
    whyItWorked: "Positioned Pepsi as youth vs. Coke as establishment. Celebrity endorsements (Michael Jackson, Britney Spears) as cultural moments.",
    visualTechnique: "High-energy performance footage, concert lighting, stadium-scale production. Music video aesthetic.",
    copyTechnique: "Generational identity as brand strategy. You don't choose Pepsi for taste, you choose it for identity.",
    lessonForAI: "When competing against a dominant brand, don't compare the product — compare the identity. Make choosing your brand a statement about who you are." },

  // ── FASHION & LUXURY ──
  { brand: "Nike", campaign: "Just Do It", year: "1988", agency: "Wieden+Kennedy", category: "fashion",
    whyItWorked: "Three words that transcended sport and became a life philosophy. Applied to everyone from elite athletes to beginners.",
    visualTechnique: "Black and white athlete portraits, dramatic lighting, sweat and intensity visible. The body as landscape.",
    copyTechnique: "Imperative mood. Not asking, telling. The shortest distance between doubt and action.",
    lessonForAI: "The best taglines are commands, not descriptions. They should work on a billboard, a shoe, and a gravestone." },
  { brand: "Nike", campaign: "Dream Crazy (Kaepernick)", year: "2018", agency: "Wieden+Kennedy", category: "fashion",
    whyItWorked: "Took a political stand that alienated some customers but deepened loyalty with their core audience. Brand values > brand safety.",
    visualTechnique: "Tight portrait of Kaepernick's face, stark black and white. The simplicity forced you to confront the message.",
    copyTechnique: "'Believe in something. Even if it means sacrificing everything.' Personal stakes, not corporate slogans.",
    lessonForAI: "Brands that take a clear stance create stronger loyalty than brands that try to please everyone." },
  { brand: "Calvin Klein", campaign: "CK One", year: "1994", agency: "In-house", category: "fashion",
    whyItWorked: "Gender-neutral fragrance positioned through androgynous, diverse casting. Ahead of its time culturally.",
    visualTechnique: "Steven Meisel's raw, documentary-style photography. Black and white. Models looked like real people, not fantasies.",
    copyTechnique: "Minimal. The casting was the message. Diversity wasn't a strategy, it was the aesthetic.",
    lessonForAI: "Casting and representation ARE creative decisions. Who appears in the ad communicates as much as any headline." },
  { brand: "Chanel", campaign: "No. 5 (Marilyn Monroe)", year: "1954/ongoing", agency: "Various", category: "luxury",
    whyItWorked: "A quote ('What do I wear to bed? Chanel No. 5') became the most effective endorsement in history. Scarcity and mystique.",
    visualTechnique: "The bottle as sculptural object. Minimal styling, dramatic lighting on glass surfaces. Black backgrounds.",
    copyTechnique: "Let the product's heritage speak. No selling, no features. The name IS the ad.",
    lessonForAI: "For luxury brands, understatement is power. The less you explain, the more desirable the product feels." },
  { brand: "Patagonia", campaign: "Don't Buy This Jacket", year: "2011", agency: "In-house", category: "fashion",
    whyItWorked: "Told customers NOT to buy the product on Black Friday. Radical anti-consumerism that increased sales by 30%.",
    visualTechnique: "Simple product shot with bold headline directly contradicting the image. The contradiction IS the creative.",
    copyTechnique: "Reverse psychology backed by genuine values. The copy explained environmental impact with real numbers.",
    lessonForAI: "Counter-intuitive messaging creates massive engagement when backed by authentic values." },

  // ── TECH & INNOVATION ──
  { brand: "Apple", campaign: "1984 Super Bowl", year: "1984", agency: "Chiat/Day", category: "tech",
    whyItWorked: "Positioned IBM as Big Brother and Apple as the liberator. Advertising as cultural event — aired once and became the most discussed ad ever.",
    visualTechnique: "Ridley Scott directing. Cinematic dystopia, single color accent (the runner's red shorts), dramatic scale.",
    copyTechnique: "Almost no product copy. Just the announcement: 'You'll see why 1984 won't be like 1984.' Teasing, not selling.",
    lessonForAI: "Launch campaigns should create anticipation, not explanation. The less you show, the more people want." },
  { brand: "Apple", campaign: "Think Different", year: "1997", agency: "TBWA/Chiat/Day", category: "tech",
    whyItWorked: "Celebrated rule-breakers (Einstein, Gandhi, Lennon, MLK) without showing a single product. Brand as philosophy.",
    visualTechnique: "Black and white portraits of visionaries. Simple Apple logo + 'Think Different.' The people were the product.",
    copyTechnique: "'Here's to the crazy ones...' Poem-manifesto that made buying a computer feel like joining a movement.",
    lessonForAI: "Brand manifestos work when they celebrate the CUSTOMER's identity, not the company's features." },
  { brand: "Apple", campaign: "Shot on iPhone", year: "2015-present", agency: "TBWA/MAL", category: "tech",
    whyItWorked: "User-generated content as premium campaign. Proved product quality through customer output, not spec sheets.",
    visualTechnique: "Real photos by real users, printed at billboard scale. The quality gap between 'phone photo' and 'professional' disappeared.",
    copyTechnique: "Three words: 'Shot on iPhone.' Attribution as advertising. Credit as credibility.",
    lessonForAI: "UGC-style content at professional scale is the most credible format for product quality claims." },
  { brand: "Google", campaign: "Year in Search", year: "2010-present", agency: "In-house", category: "tech",
    whyItWorked: "Turned search data into emotional storytelling. Made Google feel human by reflecting humanity's collective moments.",
    visualTechnique: "Montage of real footage: news clips, personal videos, viral moments. Raw, unproduced, emotionally overwhelming.",
    copyTechnique: "Search queries as narrative device. 'How to help' 'Is it over' 'How to be strong.' Questions reveal humanity.",
    lessonForAI: "Data can be emotional. The most powerful stories are often told through the questions people ask, not the answers brands give." },
  { brand: "Spotify", campaign: "Wrapped / Thanks 2016", year: "2016-present", agency: "In-house", category: "tech",
    whyItWorked: "Personalized data stories that users WANT to share. Turned product usage into social content.",
    visualTechnique: "Bold flat colors, oversized typography, data as visual. Billboard-simple graphics that read instantly.",
    copyTechnique: "Specific, funny data points: 'Dear person who played Sorry 42 times on Valentine's Day, what did you do?' Micro-stories.",
    lessonForAI: "Personalization + humor + shareability = organic virality. Make the user the main character." },

  // ── SOCIAL CAUSES & PURPOSE ──
  { brand: "Dove", campaign: "Real Beauty / Evolution", year: "2004-2006", agency: "Ogilvy Toronto", category: "beauty",
    whyItWorked: "Showed the Photoshop process that creates 'beauty standards.' Made the invisible manipulation visible.",
    visualTechnique: "Time-lapse of a real woman being transformed by makeup, lighting, and Photoshop. Before/after as revelation.",
    copyTechnique: "'No wonder our perception of beauty is distorted.' Statement of fact, not argument.",
    lessonForAI: "Process revelation — showing HOW something is made/manipulated — is one of the most powerful visual devices in advertising." },
  { brand: "Always", campaign: "#LikeAGirl", year: "2014", agency: "Leo Burnett", category: "social",
    whyItWorked: "Reframed an insult ('you throw like a girl') into an empowerment message. Changed language by changing perception.",
    visualTechnique: "Documentary interview format. Real people. Split screen: adults acting out 'like a girl' (mockingly) vs. young girls (powerfully).",
    copyTechnique: "The question IS the ad: 'When did doing something like a girl become an insult?' Forces self-reflection.",
    lessonForAI: "The most powerful social campaigns ask a question the audience has to answer honestly." },
  { brand: "Fearless Girl", campaign: "Fearless Girl Statue", year: "2017", agency: "McCann NY", category: "social",
    whyItWorked: "Physical installation that became the world's most shared ad. A small girl statue facing down the Wall Street bull. David vs. Goliath.",
    visualTechnique: "Scale contrast — tiny figure vs. massive bull. The photograph writes itself from every angle.",
    copyTechnique: "No copy needed. The juxtaposition IS the message. 'Know the power of women in leadership' on the plaque was secondary.",
    lessonForAI: "The most shareable images have built-in contrast — big/small, expected/unexpected, power/vulnerability." },

  // ── AUTOMOTIVE ──
  { brand: "Volkswagen", campaign: "Think Small", year: "1959", agency: "DDB", category: "automotive",
    whyItWorked: "When every car ad screamed BIG, VW whispered small. Turned every convention inside out — small photo, massive whitespace, honest copy.",
    visualTechnique: "Tiny car in vast white space. The opposite of every automotive ad before it. The whitespace was the statement.",
    copyTechnique: "Honest, self-deprecating, funny body copy. Treated the reader as intelligent. No superlatives.",
    lessonForAI: "Study what every competitor does, then do the opposite. Contrast with category conventions is the fastest path to distinctiveness." },
  { brand: "Volkswagen", campaign: "Lemon", year: "1960", agency: "DDB", category: "automotive",
    whyItWorked: "Called their own car a 'lemon' in the headline, then explained it was rejected because of a tiny scratch on the glove compartment. Quality control as selling point.",
    visualTechnique: "Same massive-whitespace layout as Think Small. The car is perfect — the headline creates the tension.",
    copyTechnique: "Misdirection: the headline makes you think 'bad product' but the copy reveals 'insane quality standards.'",
    lessonForAI: "Headline-visual contradiction is one of the most powerful techniques in advertising. Say one thing, show another, resolve in the body copy." },
  { brand: "Volvo", campaign: "Epic Split (Van Damme)", year: "2013", agency: "Forsman & Bodenfors", category: "automotive",
    whyItWorked: "Van Damme doing the splits between two reversing trucks. Product precision demonstrated through human spectacle.",
    visualTechnique: "Single continuous shot, sunrise backdrop, extreme demonstration of product precision. The simplicity made it feel real.",
    copyTechnique: "'This test was set up to demonstrate the stability and precision of Volvo Dynamic Steering.' Understated caption for an over-the-top visual.",
    lessonForAI: "Product demonstration can be spectacular without being complicated. Find the most dramatic way to show the benefit, then capture it simply." },

  // ── PRINT CRAFT EXCELLENCE ──
  { brand: "The Economist", campaign: "Red and White Poster Campaign", year: "1988-present", agency: "AMV BBDO", category: "media",
    whyItWorked: "30+ years of posters using the same visual language: red background, white Economist font, clever wordplay. Most awarded print campaign in history.",
    visualTechnique: "Solid red background, white text, nothing else. The constraint IS the creative platform. No images needed.",
    copyTechnique: "Witty, intellectual one-liners that flatter the reader's intelligence. 'I never read The Economist. Management trainee. Aged 42.'",
    lessonForAI: "A strong visual system — fixed constraints with infinite creative possibilities within them — beats novelty every time." },
  { brand: "Penguin Books", campaign: "Book Cover Design System", year: "1935-present", agency: "In-house", category: "media",
    whyItWorked: "Color-coded spines (orange=fiction, green=crime, blue=biography) created the most recognizable book brand in history. System design.",
    visualTechnique: "Grid-based cover design with strict color coding. The constraint created instant recognition and collectibility.",
    copyTechnique: "Title and author only. Let the content sell itself. The design system handles the marketing.",
    lessonForAI: "Systematic design — where every piece follows strict rules but allows variation within them — builds recognition faster than bespoke creativity." },

  // ── AFRICAN & SOUTH AFRICAN GREATS ──
  { brand: "Nando's", campaign: "Political Commentary Ads", year: "2000s-present", agency: "Various", category: "food",
    whyItWorked: "Nando's in South Africa built a reputation for bold, topical political humor. When a news event happens, people ask 'What will Nando's say?'",
    visualTechnique: "Simple layouts, bold typography, current event imagery repurposed with humor. Speed of execution is part of the creative.",
    copyTechnique: "Topical one-liners that reference local politics, loaded with South African humor and slang. They say what everyone's thinking.",
    lessonForAI: "Brands that consistently respond to cultural moments in real-time build a reputation that transcends advertising. Speed + wit = cultural relevance." },
  { brand: "Castle Lager", campaign: "It's Ours", year: "2019", agency: "Ogilvy SA", category: "beverage",
    whyItWorked: "Reclaimed 'proudly South African' by showing the gritty, real, beautiful chaos of SA life — not the tourist version.",
    visualTechnique: "Documentary-style footage of real South Africans in real moments — township, stadium, braai, taxi rank. Raw, unpolished, true.",
    copyTechnique: "'It's ours.' Two words. Everything else is shown, not told. The pride is in the footage, not the script.",
    lessonForAI: "For South African brands, authenticity means showing real SA — not the glossy version, but the beautiful messy truth." },
  { brand: "Chicken Licken", campaign: "Soul Food", year: "2015-present", agency: "Joe Public", category: "food",
    whyItWorked: "Cinematic storytelling that rivaled Hollywood trailers. Made fast food feel like an epic adventure. Uniquely South African humor.",
    visualTechnique: "Movie-trailer production quality. Dramatic landscapes, cinematic color grading, slow-motion action sequences — for chicken.",
    copyTechnique: "Story-driven copy that builds a mythology around the brand. 'Chicken that moves you' — literal and emotional.",
    lessonForAI: "Over-investing in production quality for a 'low-category' product creates a massive perception gap vs. competitors." },
  { brand: "Savanna Cider", campaign: "Dry Humor", year: "2000s-present", agency: "Various", category: "beverage",
    whyItWorked: "Built the entire brand personality around dry humor that mirrors the product attribute (dry cider). Wordplay and deadpan delivery.",
    visualTechnique: "Clean, simple setups that let the joke land. Often a single image with a deadpan caption. The humor is in the restraint.",
    copyTechnique: "Dry wit, double meanings, SA cultural references. The humor is intelligent, not slapstick. Rewards the attentive reader.",
    lessonForAI: "When a product has a distinctive attribute (dry, hot, cold, fast), build the entire creative personality around that attribute as a metaphor." },
];

// ─── CATEGORY-SPECIFIC PLAYBOOKS ─────────────────────────────────

export type CategoryPlaybook = {
  category: string;
  mustHave: string[];
  neverDo: string[];
  heroShot: string;
  colorPsychology: string;
  topPerformingFormats: string[];
};

export const CATEGORY_PLAYBOOKS: CategoryPlaybook[] = [
  {
    category: "food_restaurant",
    mustHave: [
      "Steam, sizzle, or melt visible — trigger physical craving",
      "Ingredients visible and identifiable — transparency builds trust",
      "Warm color temperature (3200-4500K) — appetite-inducing",
      "Human hands interacting with food — adds scale and relatability",
      "Texture close-ups — crispy edges, gooey cheese, glossy sauce",
    ],
    neverDo: [
      "Blue-toned lighting — suppresses appetite",
      "Overhead flat-lay for hero shots — save it for Instagram only",
      "Perfectly symmetrical plating — feels factory-made, not handmade",
      "Stock-photo smiles while eating — nobody smiles at a camera mid-bite",
      "Empty restaurants — suggests unpopularity",
    ],
    heroShot: "45-degree angle, eye level with the plate. Single dramatic light source from camera-left. Shallow depth of field (f/2.8-f/4) so the closest element (usually cheese drip or sauce) is razor sharp and the background falls away. Dark background or natural surface (wood, slate, marble).",
    colorPsychology: "Red and yellow trigger hunger (McDonald's, Burger King, KFC all use this). Warm earth tones (brown, amber, terracotta) signal 'artisan.' Avoid green backgrounds — associated with diet/health, not indulgence.",
    topPerformingFormats: ["Close-up food 45° angle", "Hands holding/tearing food apart", "Before/after cooking process", "Overhead flat-lay meal spread", "POV first-bite reaction"],
  },
  {
    category: "beverage",
    mustHave: [
      "Condensation on the container — signals cold, refreshing, just-opened",
      "Liquid in motion — pour, splash, or fizz captured mid-action",
      "Ice visible — universal signal for refreshment",
      "Lifestyle context — WHO drinks this, WHERE, WHEN",
      "Bold brand color dominating the frame",
    ],
    neverDo: [
      "Flat, studio-lit product shots without context — boring, forgettable",
      "Multiple products in equal focus — choose ONE hero variant",
      "Warm lighting for cold beverages — contradicts the refreshment message",
      "Text-heavy layouts — beverages sell on emotion, not information",
    ],
    heroShot: "Product at 15-30 degree angle, slightly below eye level (looking up = heroic). Dramatic backlight creating rim glow on condensation. Splash or pour frozen at 1/4000 shutter speed. Dark or complementary-color background.",
    colorPsychology: "Blue = refreshing/clean (water, sports drinks). Red = energy/excitement (Coke, energy drinks). Green = natural/organic. Gold = premium/craft (beer). The background should contrast with the product label color.",
    topPerformingFormats: ["Hero product with splash/pour", "Lifestyle moment (people + product)", "Close-up condensation macro", "Sunset/social occasion with product", "Before/after thirst → satisfaction"],
  },
  {
    category: "beauty_cosmetics",
    mustHave: [
      "Skin texture visible — real skin (with pores) beats airbrushed perfection post-Dove Revolution",
      "Product swatch or application visible — show the actual color/texture on skin",
      "Diverse representation — multiple skin tones are mandatory, not optional",
      "Light reflecting off product surface — signals quality and luxury",
      "Clean, uncluttered composition — let the product or result breathe",
    ],
    neverDo: [
      "Heavy Photoshop on skin — consumers recognize and reject it",
      "Exclusively light-skinned models — alienates majority of global market",
      "Cluttered flat-lays with 20+ products — overwhelms, doesn't sell",
      "Before/after that looks fake — damages credibility permanently",
    ],
    heroShot: "Soft front-light with fill (butterfly lighting or loop lighting). Product held at face height or applied to skin. Shallow depth of field on the product/application point. Clean background (white, soft pink, or skin-complementary neutral).",
    colorPsychology: "Soft pink/rose = feminine/gentle. Gold = luxury/premium. Black = sophistication/drama. White = purity/clinical. Nude tones = natural beauty. Match the color story to the product's positioning.",
    topPerformingFormats: ["Before/after transformation", "Application close-up (texture/swatch)", "Model portrait with product", "Ingredient/science visualization", "Tutorial/how-to sequence"],
  },
  {
    category: "tech_saas",
    mustHave: [
      "Screen/product in context — show it being USED, not just existing",
      "Clean UI visible — if your product has a beautiful interface, show it",
      "Human benefit visible — the person's REACTION to using the product",
      "Aspirational workspace — the environment suggests the user's success",
      "Clear value proposition in headline — tech needs to explain before it can inspire",
    ],
    neverDo: [
      "Stock photos of people pointing at screens — the most generic tech ad cliché",
      "Feature lists as creative — nobody reads bullet points in ads",
      "Blue gradient backgrounds with floating shapes — every tech brand does this",
      "Hands typing on keyboards — says nothing about your specific product",
    ],
    heroShot: "Product screen displayed on a premium device (MacBook, latest phone) in a real environment (home office, café, studio). Natural side light. Screen content clearly readable but secondary to the human reaction.",
    colorPsychology: "Blue = trust/security (finance, enterprise). Purple = innovation/creativity. Green = growth/money. Dark mode = developer/power user. Gradient = modern but potentially generic — use cautiously.",
    topPerformingFormats: ["Product UI screenshot with annotations", "Before/after workflow comparison", "User testimonial with product visible", "Data visualization of results", "Side-by-side vs. competitor"],
  },
  {
    category: "automotive",
    mustHave: [
      "The car in an environment that reflects the owner's aspirations",
      "Motion or implied motion — even static shots should suggest speed/dynamism",
      "Dramatic lighting that sculpts the car's design lines",
      "A clear emotional positioning — adventure, luxury, family, performance",
      "The car should be clean, never dirty (unless it's a deliberate off-road positioning)",
    ],
    neverDo: [
      "Showroom-white backgrounds for lifestyle ads — feels like a configurator, not a dream",
      "Multiple cars in one ad — choose one model, one color, one story",
      "Interior shots without a person — empty cars feel unloved",
      "Tech spec overlays on beauty shots — separate the inspiration from the information",
    ],
    heroShot: "Three-quarter front view, slightly below eye level. Golden hour or blue hour lighting. The car positioned on a road/landscape that tells a story about the driver's life. Motion blur on wheels even in static shots suggests dynamism.",
    colorPsychology: "Black/dark = luxury/power. White = purity/technology. Red = performance/passion. Blue = trust/dependability. Silver = modern/sophisticated. The car's color sets the ad's entire mood.",
    topPerformingFormats: ["Hero car in aspirational landscape", "Driver's POV of open road", "Detail close-up (headlight, wheel, grille)", "Lifestyle scene (arriving at destination)", "Aerial/drone dynamic driving shot"],
  },
  {
    category: "fashion_apparel",
    mustHave: [
      "The clothes on a real human body in motion — not flat-lay, not mannequin",
      "Styling that tells a story about WHO wears this and WHERE",
      "Confidence and attitude in the model's expression and posture",
      "Texture visible — fabric quality should be apparent at a glance",
      "Consistent casting that reflects your actual customer, not your aspiration",
    ],
    neverDo: [
      "White-background e-commerce shots as advertising — that's a product page, not a campaign",
      "Over-retouching that removes the model's personality",
      "Styling that contradicts the brand's price point — don't dress a mass-market brand like haute couture",
      "Static poses that could be replaced by a mannequin — movement = life",
    ],
    heroShot: "Full body or three-quarter body, model in motion (walking, turning, gesturing). Environmental context that matches brand positioning. Natural or editorial lighting. The camera should feel like it caught a moment, not staged a photo.",
    colorPsychology: "Black = luxury/sophisticated. White = clean/minimal. Earth tones = heritage/outdoor. Neon/bright = youth/streetwear. Neutral backgrounds let colorful clothing pop; matching backgrounds create editorial cohesion.",
    topPerformingFormats: ["Model in environment (street, studio, landscape)", "Detail close-up (texture, label, craftsmanship)", "Movement capture (walking, dancing, working)", "Outfit flat-lay with accessories", "Before/after styling transformation"],
  },
];

// ─── PLATFORM-SPECIFIC CREATIVE RULES ────────────────────────────

export type PlatformRules = {
  platform: string;
  optimalFormats: string[];
  hookTiming: string;
  textRules: string;
  visualRules: string[];
  topPerformingStyles: string[];
  avoid: string[];
};

export const PLATFORM_RULES: PlatformRules[] = [
  {
    platform: "instagram_feed",
    optimalFormats: ["1:1 square", "4:5 portrait (recommended — takes more screen space)"],
    hookTiming: "1.5 seconds. The image must stop the scroll before the thumb flicks past.",
    textRules: "Max 20% of the image covered by text (Instagram penalizes text-heavy posts in reach). Caption does the heavy lifting, not the image.",
    visualRules: [
      "High color saturation outperforms desaturated/muted by 17%",
      "Images with faces get 38% more engagement than without",
      "Single dominant color outperforms rainbow palettes",
      "Edge-to-edge imagery (no borders/frames) performs better",
    ],
    topPerformingStyles: ["Bright and bold product shots", "Behind-the-scenes / process content", "User-generated content reposts", "Carousel educational content", "Before/after transformations"],
    avoid: ["Heavy text overlays", "Landscape crops (waste of feed real estate)", "Low-resolution or blurry images", "Overly corporate/stock-photo aesthetic"],
  },
  {
    platform: "instagram_stories",
    optimalFormats: ["9:16 vertical only"],
    hookTiming: "0.5 seconds. Stories auto-advance. You have half a second before a tap-forward.",
    textRules: "Top 15% and bottom 20% are covered by username and reply bar. Keep key content in the middle 65%.",
    visualRules: [
      "Full-bleed imagery with no borders",
      "Bold text overlays with high contrast backgrounds",
      "Stickers, polls, and interactive elements boost completion rates",
      "Raw, authentic aesthetic outperforms polished content",
    ],
    topPerformingStyles: ["Quick tips/hacks with text overlay", "Product reveals with countdown", "POV/first-person content", "This or that polls", "Behind-the-scenes raw footage"],
    avoid: ["Repurposed feed posts without adaptation", "Small text that's unreadable on mobile", "Content that requires sound (85% watch muted)", "Static images — stories should feel alive"],
  },
  {
    platform: "tiktok",
    optimalFormats: ["9:16 vertical only"],
    hookTiming: "0.3 seconds. TikTok's algorithm judges retention in the first second. If they don't stay, you're buried.",
    textRules: "Bold captions are mandatory — most watch without sound. Safe zone: center 80% of frame.",
    visualRules: [
      "Phone-native aesthetic outperforms studio production",
      "Movement in the first frame — static openings kill retention",
      "Trending sounds/music boost algorithmic distribution",
      "Green screen and effects feel native, not gimmicky",
    ],
    topPerformingStyles: ["Transformation/before-after reveals", "ASMR and sensory close-ups (food, texture)", "Reaction/duet format", "Storytime with text overlay", "Tutorial/how-to in under 30 seconds"],
    avoid: ["Landscape video", "Corporate tone of voice", "Ads that look like ads — native content wins", "Long intros before the payoff", "Logos in the first 3 seconds"],
  },
  {
    platform: "facebook",
    optimalFormats: ["1:1 square (feed)", "16:9 landscape (link previews)", "4:5 portrait (mobile feed)"],
    hookTiming: "2 seconds. Facebook users scroll slower than Instagram users but still fast.",
    textRules: "20% text rule relaxed but still impacts cost-per-click. Clear headline above the image is critical.",
    visualRules: [
      "Warm, bright images outperform dark/moody on Facebook",
      "People in the image increase click-through rate",
      "High-contrast images stand out in the feed",
      "Organic-looking content outperforms polished ads in cost efficiency",
    ],
    topPerformingStyles: ["Testimonial with customer photo", "Product in use (lifestyle context)", "Offer/discount announcement with bold text", "Video thumbnails with play button", "Carousel product showcase"],
    avoid: ["All-text graphics", "Dark/moody imagery (reads as depressing on Facebook's bright UI)", "Clickbait visual-headline mismatch", "Tiny product in a large scene"],
  },
  {
    platform: "google_display",
    optimalFormats: ["300x250 medium rectangle", "728x90 leaderboard", "160x600 wide skyscraper", "320x50 mobile banner"],
    hookTiming: "1 second. Display ads are peripheral — they must work without active attention.",
    textRules: "7 words or fewer. Logo always visible. CTA button with contrasting color. Readable at small sizes.",
    visualRules: [
      "Simple, bold, high-contrast — complexity fails at small sizes",
      "Animate sparingly — subtle motion catches the eye without being annoying",
      "Product image + headline + CTA — that's the entire ad",
      "White or brand-colored background — don't fight for attention with the page content",
    ],
    topPerformingStyles: ["Product + offer + CTA button", "Single benefit statement with visual", "Animated GIF (3-frame max)", "Retargeting with specific product image", "Social proof (star rating, review count)"],
    avoid: ["Complex imagery that doesn't read at 300px wide", "More than 2 fonts", "Animations that loop aggressively", "Borders that blend with page content"],
  },
];

// ─── ENHANCED CANON CONTEXT BUILDER ──────────────────────────────

export function getCanonContext(channel: string, archetype?: string, category?: string): string {
  const era = CREATIVE_ERAS[CREATIVE_ERAS.length - 1];
  const selectedArchetype = archetype
    ? CREATIVE_ARCHETYPES.find((a) => a.name.toLowerCase().includes(archetype.toLowerCase()))
    : null;

  const lines: string[] = [];

  lines.push(`CREATIVE CANON (${era.name}):`);
  lines.push(`Era principles: ${era.keyPrinciples.slice(0, 3).join(". ")}.`);
  lines.push(`Visual techniques: ${era.visualTechniques.slice(0, 3).join(". ")}.`);
  lines.push(``);

  if (selectedArchetype) {
    lines.push(`ARCHETYPE: ${selectedArchetype.name}`);
    lines.push(`Formula: ${selectedArchetype.visualFormula}`);
    lines.push(`Photography: ${selectedArchetype.photographyNotes}`);
    lines.push(``);
  }

  // Category-specific playbook
  const playbook = category
    ? CATEGORY_PLAYBOOKS.find((p) => p.category === category || category.toLowerCase().includes(p.category.split("_")[0]))
    : null;
  if (playbook) {
    lines.push(`CATEGORY PLAYBOOK (${playbook.category}):`);
    lines.push(`Hero shot: ${playbook.heroShot}`);
    lines.push(`Color psychology: ${playbook.colorPsychology}`);
    lines.push(`Must have: ${playbook.mustHave.slice(0, 3).join(". ")}.`);
    lines.push(`Never: ${playbook.neverDo.slice(0, 2).join(". ")}.`);
    lines.push(``);
  }

  // Platform-specific rules
  const platformMap: Record<string, string> = {
    META: "instagram_feed",
    TIKTOK: "tiktok",
    GOOGLE: "google_display",
  };
  const platformKey = platformMap[channel.toUpperCase()] ?? "instagram_feed";
  const platform = PLATFORM_RULES.find((p) => p.platform === platformKey);
  if (platform) {
    lines.push(`PLATFORM (${platform.platform}):`);
    lines.push(`Hook timing: ${platform.hookTiming}`);
    lines.push(`Visual rules: ${platform.visualRules.slice(0, 2).join(". ")}.`);
    lines.push(`Avoid: ${platform.avoid.slice(0, 2).join(". ")}.`);
    lines.push(``);
  }

  // Relevant iconic campaign references
  const categoryForCampaigns = category ?? (channel === "META" ? "food" : "tech");
  const relevantCampaigns = ICONIC_CAMPAIGNS
    .filter((c) => c.category === categoryForCampaigns || c.category === "food" || c.category === "beverage")
    .slice(0, 3);
  if (relevantCampaigns.length > 0) {
    lines.push(`REFERENCE CAMPAIGNS:`);
    for (const c of relevantCampaigns) {
      lines.push(`- ${c.brand} '${c.campaign}': ${c.lessonForAI}`);
    }
    lines.push(``);
  }

  // Core design principles
  lines.push(`DESIGN PRINCIPLES:`);
  for (const p of TIMELESS_DESIGN_PRINCIPLES.slice(0, 3)) {
    lines.push(`- ${p.name}: ${p.rule}`);
  }

  return lines.join("\n");
}

export function getCanonStats() {
  return {
    eras: CREATIVE_ERAS.length,
    archetypes: CREATIVE_ARCHETYPES.length,
    principles: TIMELESS_DESIGN_PRINCIPLES.length,
    iconicCampaigns: ICONIC_CAMPAIGNS.length,
    categoryPlaybooks: CATEGORY_PLAYBOOKS.length,
    platformRules: PLATFORM_RULES.length,
    totalKnowledgeItems:
      CREATIVE_ERAS.reduce((s, e) => s + e.keyPrinciples.length + e.visualTechniques.length + e.copywritingRules.length + e.iconicReferences.length, 0) +
      CREATIVE_ARCHETYPES.reduce((s, a) => s + a.whenToUse.length + a.iconicExamples.length, 0) +
      ICONIC_CAMPAIGNS.length +
      CATEGORY_PLAYBOOKS.reduce((s, p) => s + p.mustHave.length + p.neverDo.length + p.topPerformingFormats.length, 0) +
      PLATFORM_RULES.reduce((s, p) => s + p.visualRules.length + p.topPerformingStyles.length + p.avoid.length, 0) +
      TIMELESS_DESIGN_PRINCIPLES.length,
  };
}
