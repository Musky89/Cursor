export interface AnalysisResult {
  title: string;
  score: number;
  insights: string[];
  opportunities: Opportunity[];
  risks: string[];
  projections: Projection[];
}

export interface Opportunity {
  name: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  revenueEstimate: string;
  description: string;
  timeframe: string;
}

export interface Projection {
  month: string;
  current: number;
  optimized: number;
}

export interface MarketResult {
  markets: MarketOpportunity[];
  trends: Trend[];
  globalInsights: string[];
}

export interface MarketOpportunity {
  name: string;
  region: string;
  marketSize: string;
  growth: string;
  competition: "low" | "medium" | "high";
  entryBarrier: "low" | "medium" | "high";
  score: number;
  description: string;
}

export interface Trend {
  name: string;
  direction: "up" | "down" | "stable";
  relevance: number;
}

export interface IdeaResult {
  ideas: BusinessIdea[];
  topPick: string;
}

export interface BusinessIdea {
  name: string;
  tagline: string;
  description: string;
  marketSize: string;
  revenueModel: string;
  startupCost: string;
  monthlyRevenuePotential: string;
  competitionLevel: "low" | "medium" | "high";
  validationScore: number;
  steps: string[];
  risks: string[];
  moat: string;
}

export interface PricingResult {
  currentAnalysis: PricingAnalysis;
  recommendations: PricingRecommendation[];
  elasticityData: ElasticityPoint[];
  competitorPricing: CompetitorPrice[];
}

export interface PricingAnalysis {
  currentPrice: number;
  optimalPrice: number;
  priceRange: { min: number; max: number };
  currentMargin: number;
  potentialMargin: number;
  revenueImpact: string;
}

export interface PricingRecommendation {
  strategy: string;
  description: string;
  expectedImpact: string;
  confidence: number;
}

export interface ElasticityPoint {
  price: number;
  demand: number;
  revenue: number;
}

export interface CompetitorPrice {
  name: string;
  price: number;
  features: string;
}

function generateHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateRevenueAnalysis(businessDesc: string, revenue: string, industry: string): AnalysisResult {
  const seed = generateHash(businessDesc + revenue + industry);
  const rng = seededRandom(seed);
  const rev = parseFloat(revenue.replace(/[^0-9.]/g, "")) || 100000;

  const industries: Record<string, string[]> = {
    saas: [
      "Implement usage-based pricing tier to capture 15-30% more from power users",
      "Launch annual billing with 20% discount to improve cash flow and reduce churn",
      "Add AI-powered upsell recommendations at key product touchpoints",
      "Create expansion revenue playbook targeting existing accounts for 2x ARPU",
      "Implement product-led growth loops with viral coefficients above 1.0",
    ],
    ecommerce: [
      "Implement dynamic pricing engine to optimize margins by product category",
      "Launch subscription/replenishment program for consumable products",
      "Add AI-powered cross-sell engine to increase average order value by 25%",
      "Optimize abandoned cart recovery flow with personalized incentives",
      "Expand to cross-border commerce in high-growth Southeast Asian markets",
    ],
    services: [
      "Package services into productized offerings with standardized pricing",
      "Create a retainer model converting one-time clients to recurring revenue",
      "Launch a digital product (course/template) to capture passive income at 90%+ margins",
      "Implement value-based pricing by quantifying client ROI",
      "Build a referral program with 20% revenue share for partner-sourced deals",
    ],
    default: [
      "Diversify revenue streams to reduce dependency on single channel",
      "Implement AI-powered customer segmentation for targeted pricing",
      "Launch premium tier with exclusive features at 3x current pricing",
      "Build strategic partnerships for distribution and co-selling",
      "Create data monetization strategy from existing customer insights",
    ],
  };

  const industryKey = Object.keys(industries).find((k) =>
    industry.toLowerCase().includes(k)
  ) || "default";
  const insightPool = industries[industryKey];
  const selectedInsights = insightPool.sort(() => rng() - 0.5).slice(0, 4);

  const score = Math.round(45 + rng() * 45);

  const opportunities: Opportunity[] = [
    {
      name: "Revenue Optimization Quick Wins",
      impact: "high",
      effort: "low",
      revenueEstimate: `$${Math.round(rev * 0.08).toLocaleString()} - $${Math.round(rev * 0.15).toLocaleString()}/yr`,
      description: "Immediate pricing and packaging adjustments based on competitive positioning and willingness-to-pay analysis.",
      timeframe: "2-4 weeks",
    },
    {
      name: "New Revenue Stream Launch",
      impact: "high",
      effort: "medium",
      revenueEstimate: `$${Math.round(rev * 0.2).toLocaleString()} - $${Math.round(rev * 0.35).toLocaleString()}/yr`,
      description: "Adjacent product/service launch leveraging existing customer base and distribution channels.",
      timeframe: "2-3 months",
    },
    {
      name: "Market Expansion Play",
      impact: "medium",
      effort: "high",
      revenueEstimate: `$${Math.round(rev * 0.3).toLocaleString()} - $${Math.round(rev * 0.5).toLocaleString()}/yr`,
      description: "Geographic or vertical market expansion into underserved segments with high growth potential.",
      timeframe: "3-6 months",
    },
    {
      name: "Retention & Expansion Revenue",
      impact: "high",
      effort: "medium",
      revenueEstimate: `$${Math.round(rev * 0.12).toLocaleString()} - $${Math.round(rev * 0.25).toLocaleString()}/yr`,
      description: "Reduce churn and increase expansion revenue through proactive customer success and upsell automation.",
      timeframe: "1-3 months",
    },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const projections: Projection[] = months.map((month, i) => {
    const monthlyRev = rev / 12;
    const growth = 1 + (i * 0.02) + (rng() * 0.01);
    const optimizedGrowth = 1 + (i * 0.045) + (rng() * 0.02);
    return {
      month,
      current: Math.round(monthlyRev * growth),
      optimized: Math.round(monthlyRev * optimizedGrowth),
    };
  });

  return {
    title: `Revenue Analysis: ${industry || "Your Business"}`,
    score,
    insights: selectedInsights,
    opportunities,
    risks: [
      "Market saturation in primary segment may limit organic growth ceiling",
      "Customer concentration risk — top 20% of accounts drive 65%+ of revenue",
      "Pricing pressure from low-cost competitors and open-source alternatives",
    ],
    projections,
  };
}

export function generateMarketAnalysis(industry: string, region: string): MarketResult {
  const seed = generateHash(industry + region);
  const rng = seededRandom(seed);

  const marketTemplates = [
    { name: "AI-Powered {industry} Solutions", region: "North America", base: 4.2 },
    { name: "{industry} Automation Platform", region: "Europe", base: 2.8 },
    { name: "Mobile-First {industry} Services", region: "Southeast Asia", base: 3.5 },
    { name: "{industry} Analytics & Intelligence", region: "Global", base: 5.1 },
    { name: "Sustainable {industry} Tech", region: "Europe", base: 2.1 },
    { name: "{industry} Marketplace", region: "India", base: 1.8 },
    { name: "Enterprise {industry} Cloud", region: "North America", base: 6.3 },
    { name: "{industry} for SMBs", region: "Latin America", base: 1.4 },
  ];

  const cap = industry.charAt(0).toUpperCase() + industry.slice(1);
  const markets: MarketOpportunity[] = marketTemplates
    .sort(() => rng() - 0.5)
    .slice(0, 5)
    .map((m) => {
      const size = m.base * (0.5 + rng());
      const score = Math.round(60 + rng() * 35);
      const comp = rng() > 0.6 ? "high" : rng() > 0.3 ? "medium" : "low";
      const barrier = rng() > 0.5 ? "medium" : rng() > 0.2 ? "low" : "high";
      return {
        name: m.name.replace("{industry}", cap),
        region: region || m.region,
        marketSize: `$${size.toFixed(1)}B`,
        growth: `${Math.round(15 + rng() * 30)}% CAGR`,
        competition: comp as "low" | "medium" | "high",
        entryBarrier: barrier as "low" | "medium" | "high",
        score,
        description: `High-potential ${m.name.replace("{industry}", industry).toLowerCase()} market with strong fundamentals and growing demand. ${comp === "low" ? "First-mover advantage available." : "Differentiation is key to capturing market share."}`,
      };
    })
    .sort((a, b) => b.score - a.score);

  const trends: Trend[] = [
    { name: "AI Integration", direction: "up", relevance: Math.round(70 + rng() * 28) },
    { name: "Sustainability Focus", direction: "up", relevance: Math.round(50 + rng() * 40) },
    { name: "Mobile-First", direction: "up", relevance: Math.round(60 + rng() * 35) },
    { name: "Consolidation", direction: rng() > 0.5 ? "up" : "stable", relevance: Math.round(40 + rng() * 40) },
    { name: "Regulation", direction: "up", relevance: Math.round(30 + rng() * 50) },
  ];

  return {
    markets,
    trends,
    globalInsights: [
      `The global ${industry} market is projected to reach $${(10 + rng() * 40).toFixed(0)}B by 2030`,
      `AI adoption in ${industry} is accelerating at ${Math.round(25 + rng() * 30)}% annually`,
      `${region || "Emerging markets"} represent the fastest-growing opportunity for ${industry} solutions`,
      `Cross-border ${industry} services are growing 3x faster than domestic markets`,
    ],
  };
}

export function generateBusinessIdeas(skills: string, budget: string, interests: string): IdeaResult {
  const seed = generateHash(skills + budget + interests);
  const rng = seededRandom(seed);
  const budgetNum = parseFloat(budget.replace(/[^0-9.]/g, "")) || 5000;

  const ideaTemplates = [
    {
      name: "AI Content Engine",
      tagline: "Automated content creation at scale",
      description: "Build an AI-powered platform that generates, optimizes, and distributes content across multiple channels. Combine your skills to create a content automation pipeline that produces blog posts, social media, newsletters, and video scripts — all personalized to target audiences.",
      revenueModel: "SaaS subscription ($49-$499/mo per user)",
      competitionLevel: "medium" as const,
      moat: "Proprietary training data from user interactions creates a flywheel effect",
    },
    {
      name: "Niche Marketplace",
      tagline: "Connecting buyers and sellers in underserved markets",
      description: "Create a specialized marketplace for a niche vertical. Focus on a specific industry where existing platforms (Amazon, eBay) do a poor job. Add AI-powered matching, curation, and quality verification to build trust and justify premium fees.",
      revenueModel: "Transaction fees (8-15%) + premium listings",
      competitionLevel: "low" as const,
      moat: "Network effects — more sellers attract more buyers, creating a self-reinforcing loop",
    },
    {
      name: "AI Workflow Automator",
      tagline: "Eliminate repetitive business tasks with AI agents",
      description: "Build autonomous AI agents that handle specific business workflows end-to-end: invoice processing, customer support triage, data entry, report generation. Target SMBs who can't afford enterprise automation tools.",
      revenueModel: "Usage-based pricing ($0.10-$2.00 per automation)",
      competitionLevel: "medium" as const,
      moat: "Deep workflow integrations and domain-specific AI models trained on real business data",
    },
    {
      name: "Creator Economy Platform",
      tagline: "Monetization infrastructure for digital creators",
      description: "Build the backend that helps creators monetize their audience: paid communities, digital products, courses, coaching, and merchandise — all in one platform with AI-powered analytics and growth recommendations.",
      revenueModel: "Platform fee (5%) + SaaS ($29-$199/mo)",
      competitionLevel: "high" as const,
      moat: "Creator lock-in through audience data, payment history, and integrated tools",
    },
    {
      name: "Vertical SaaS Solution",
      tagline: "Industry-specific software that replaces spreadsheets",
      description: "Identify an industry still running on spreadsheets and email (construction, agriculture, logistics) and build purpose-built software with AI features. Vertical SaaS commands premium pricing and has lower churn than horizontal SaaS.",
      revenueModel: "SaaS subscription ($99-$999/mo per company)",
      competitionLevel: "low" as const,
      moat: "Deep industry expertise and integrations that horizontal tools can't match",
    },
    {
      name: "AI-Powered Consulting",
      tagline: "Scalable expertise through AI-augmented advisory",
      description: "Combine your domain expertise with AI tools to deliver consulting at 10x the scale. Build proprietary AI models that analyze client data and generate insights, while you provide strategic oversight and relationship management.",
      revenueModel: "Retainer ($2K-$20K/mo) + performance bonuses",
      competitionLevel: "low" as const,
      moat: "Proprietary AI models trained on your consulting engagements",
    },
  ];

  const ideas: BusinessIdea[] = ideaTemplates
    .sort(() => rng() - 0.5)
    .slice(0, 4)
    .map((t) => {
      const validationScore = Math.round(65 + rng() * 30);
      const marketSize = `$${(1 + rng() * 20).toFixed(1)}B`;
      const monthlyPotential = budgetNum < 5000
        ? `$${Math.round(2000 + rng() * 8000).toLocaleString()}`
        : budgetNum < 50000
          ? `$${Math.round(5000 + rng() * 25000).toLocaleString()}`
          : `$${Math.round(15000 + rng() * 85000).toLocaleString()}`;

      return {
        ...t,
        marketSize,
        startupCost: budgetNum < 5000 ? "$1K - $5K" : budgetNum < 50000 ? "$5K - $25K" : "$25K - $100K",
        monthlyRevenuePotential: monthlyPotential,
        validationScore,
        steps: [
          "Validate demand with 20+ customer discovery interviews",
          "Build MVP with core value proposition in 4-6 weeks",
          "Launch to first 100 users with waitlist-driven onboarding",
          "Iterate based on usage data and feedback loops",
          "Scale acquisition through content marketing and partnerships",
        ],
        risks: [
          "Market timing risk — being too early or too late",
          "Customer acquisition cost may exceed initial projections",
          "Technical complexity could extend development timeline",
        ],
      };
    })
    .sort((a, b) => b.validationScore - a.validationScore);

  return {
    ideas,
    topPick: ideas[0].name,
  };
}

export function generatePricingAnalysis(product: string, currentPrice: string, market: string): PricingResult {
  const seed = generateHash(product + currentPrice + market);
  const rng = seededRandom(seed);
  const price = parseFloat(currentPrice.replace(/[^0-9.]/g, "")) || 49;

  const optimalPrice = price * (1.1 + rng() * 0.4);
  const minPrice = price * 0.7;
  const maxPrice = price * 2.2;

  const currentMargin = Math.round(40 + rng() * 25);
  const potentialMargin = Math.round(currentMargin + 5 + rng() * 15);

  const elasticityData: ElasticityPoint[] = [];
  for (let p = Math.round(minPrice); p <= Math.round(maxPrice); p += Math.round((maxPrice - minPrice) / 15)) {
    const demandFactor = Math.max(0.1, 1 - ((p - minPrice) / (maxPrice - minPrice)) * 0.8 + rng() * 0.05);
    const demand = Math.round(1000 * demandFactor);
    elasticityData.push({ price: Math.round(p), demand, revenue: Math.round(p * demand) });
  }

  const competitorPricing: CompetitorPrice[] = [
    { name: "Competitor A (Market Leader)", price: Math.round(price * (1.3 + rng() * 0.5)), features: "Full suite, enterprise focus" },
    { name: "Competitor B (Mid-Market)", price: Math.round(price * (0.9 + rng() * 0.3)), features: "Core features, good UX" },
    { name: "Competitor C (Budget)", price: Math.round(price * (0.4 + rng() * 0.3)), features: "Basic features, limited support" },
    { name: "Competitor D (Premium)", price: Math.round(price * (1.8 + rng() * 0.7)), features: "White-glove service, custom" },
  ];

  return {
    currentAnalysis: {
      currentPrice: price,
      optimalPrice: Math.round(optimalPrice * 100) / 100,
      priceRange: { min: Math.round(minPrice), max: Math.round(maxPrice) },
      currentMargin,
      potentialMargin,
      revenueImpact: `+$${Math.round(((optimalPrice - price) / price) * 100)}% revenue potential`,
    },
    recommendations: [
      {
        strategy: "Value-Based Pricing Restructure",
        description: "Realign pricing tiers to reflect customer value perception. Introduce a premium tier with exclusive features that justify 2-3x pricing.",
        expectedImpact: `+${Math.round(15 + rng() * 20)}% revenue`,
        confidence: Math.round(75 + rng() * 20),
      },
      {
        strategy: "Strategic Anchoring",
        description: "Introduce a high-priced enterprise tier to anchor perception, making your mid-tier feel like exceptional value.",
        expectedImpact: `+${Math.round(8 + rng() * 15)}% conversion`,
        confidence: Math.round(70 + rng() * 25),
      },
      {
        strategy: "Usage-Based Component",
        description: "Add usage-based pricing on top of base subscription. Captures more value from power users without raising the entry barrier.",
        expectedImpact: `+${Math.round(20 + rng() * 25)}% ARPU`,
        confidence: Math.round(65 + rng() * 25),
      },
      {
        strategy: "Annual Discount Optimization",
        description: `Current annual discount is likely too high. Reduce from 20% to ${Math.round(10 + rng() * 8)}% to improve cash flow while maintaining conversion.`,
        expectedImpact: `+${Math.round(5 + rng() * 10)}% cash efficiency`,
        confidence: Math.round(80 + rng() * 15),
      },
    ],
    elasticityData,
    competitorPricing,
  };
}
