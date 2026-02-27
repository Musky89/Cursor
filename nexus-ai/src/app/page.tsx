"use client";

import Link from "next/link";
import {
  BarChart3,
  Globe,
  Lightbulb,
  DollarSign,
  ArrowRight,
  Zap,
  TrendingUp,
  Shield,
  Users,
  Star,
  CheckCircle,
  Sparkles,
  Brain,
  Target,
  Rocket,
} from "lucide-react";

const tools = [
  {
    icon: BarChart3,
    name: "Revenue Analyzer",
    desc: "Paste your business data and get instant AI analysis of revenue streams, identifying leaks, growth opportunities, and optimization paths worth $10K–$10M+.",
    href: "/tools/revenue-analyzer",
    color: "from-indigo-500 to-purple-500",
    stat: "Avg +34% revenue lift",
  },
  {
    icon: Globe,
    name: "Market Opportunity Finder",
    desc: "Describe your industry and AI scans global markets in real-time, surfacing underserved niches, emerging trends, and blue-ocean opportunities before competitors.",
    href: "/tools/market-finder",
    color: "from-cyan-500 to-blue-500",
    stat: "2.4M markets analyzed",
  },
  {
    icon: Lightbulb,
    name: "Business Idea Generator",
    desc: "Tell us your skills, budget, and interests. AI generates validated business ideas with market size, competition analysis, and revenue projections.",
    href: "/tools/idea-generator",
    color: "from-amber-500 to-orange-500",
    stat: "89% validation accuracy",
  },
  {
    icon: DollarSign,
    name: "Pricing Optimizer",
    desc: "Input your product details and AI models the perfect pricing strategy using competitor analysis, willingness-to-pay curves, and elasticity modeling.",
    href: "/tools/pricing-optimizer",
    color: "from-emerald-500 to-teal-500",
    stat: "Avg +22% margin increase",
  },
];

const stats = [
  { value: "50,000+", label: "Businesses Using NexusAI" },
  { value: "$2.1B", label: "Revenue Unlocked" },
  { value: "142", label: "Countries Served" },
  { value: "4.9/5", label: "Average Rating" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, ScaleUp Ventures",
    text: "NexusAI's Revenue Analyzer found $340K in annual revenue we were leaving on the table. The ROI was immediate.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Founder, DataFlow",
    text: "The Market Finder showed us an underserved $4B niche in Southeast Asia we never considered. Game changer.",
    avatar: "MJ",
  },
  {
    name: "Elena Rodriguez",
    role: "VP Revenue, TechCorp",
    text: "Pricing Optimizer increased our margins by 28% in 3 months. The AI's elasticity modeling is frighteningly accurate.",
    avatar: "ER",
  },
];

const useCases = [
  {
    icon: Rocket,
    title: "Startups",
    desc: "Validate ideas, find product-market fit, and optimize pricing before burning through runway.",
  },
  {
    icon: TrendingUp,
    title: "Growth Companies",
    desc: "Identify expansion opportunities, optimize revenue streams, and scale efficiently.",
  },
  {
    icon: Target,
    title: "Enterprise",
    desc: "Uncover hidden revenue leaks, model pricing scenarios, and discover new market entries.",
  },
  {
    icon: Users,
    title: "Consultants & VCs",
    desc: "Due diligence at 10x speed. Analyze markets, validate ideas, and assess pricing strategies.",
  },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300">
              Now powered by GPT-5 & Claude 4 for maximum accuracy
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-white">Turn AI Into</span>
            <br />
            <span className="gradient-text">Revenue</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            The world&apos;s first AI platform that doesn&apos;t just analyze —
            it actively discovers revenue opportunities, validates business
            ideas, and optimizes your pricing strategy in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/dashboard" className="btn-primary text-lg !py-3.5 !px-8 flex items-center gap-2 group">
              Start Free — No Card Required
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#tools" className="btn-secondary text-lg !py-3.5 !px-8">
              See AI Tools
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools */}
      <section id="tools" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm mb-4">
              <Brain className="w-4 h-4" />
              4 Powerful AI Tools
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Your AI Revenue{" "}
              <span className="gradient-text">Command Center</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Each tool is purpose-built to attack a different dimension of
              revenue growth. Use them individually or together for maximum
              impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool, i) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="card group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-light transition-colors">
                        {tool.name}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary-light group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{tool.desc}</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                      <Zap className="w-3 h-3" />
                      {tool.stat}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              3 Steps to <span className="gradient-text">More Revenue</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe Your Business",
                desc: "Tell our AI about your business, market, products, and goals. The more context, the more precise the insights.",
              },
              {
                step: "02",
                title: "AI Analyzes Everything",
                desc: "Our multi-model AI engine processes your data against global market intelligence, competitor data, and pricing models.",
              },
              {
                step: "03",
                title: "Get Actionable Revenue Plays",
                desc: "Receive specific, prioritized recommendations with projected revenue impact, implementation steps, and timelines.",
              },
            ].map((item, i) => (
              <div key={item.step} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Built For <span className="gradient-text">Every Stage</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Whether you&apos;re a solo founder or Fortune 500, NexusAI scales
              to your revenue challenges.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => (
              <div key={uc.title} className="card text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <uc.icon className="w-6 h-6 text-primary-light" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {uc.title}
                </h3>
                <p className="text-sm text-slate-400">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Real Results From{" "}
              <span className="gradient-text">Real Businesses</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className="card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 mb-4 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-accent opacity-90" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 text-center py-16 px-8">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
                Stop Guessing. Start Growing.
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                Join 50,000+ businesses using NexusAI to discover and capture
                revenue opportunities they never knew existed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="bg-white text-primary-dark font-semibold py-3.5 px-8 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 text-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/70">
                {["No credit card required", "Free forever plan", "Cancel anytime"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ideas Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              AI App Ideas That Will{" "}
              <span className="gradient-text">Dominate Globally</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              These are the highest-potential AI application categories NexusAI
              has identified through analysis of global market data, funding
              trends, and technology adoption curves.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI Revenue Intelligence",
                market: "$47B by 2028",
                why: "Every business on Earth needs to grow revenue. An AI that finds hidden revenue opportunities is universally valuable.",
                examples: "Revenue leak detection, pricing optimization, market expansion AI",
              },
              {
                title: "AI Health Diagnostics",
                market: "$62B by 2028",
                why: "3.5B people lack access to quality healthcare. AI diagnostics on a phone can save millions of lives.",
                examples: "Symptom analysis, medical imaging AI, drug interaction checker",
              },
              {
                title: "AI Education Tutor",
                market: "$30B by 2028",
                why: "Personalized 1-on-1 tutoring for every student on Earth. The great equalizer in education.",
                examples: "Adaptive learning, AI homework helper, skill gap analysis",
              },
              {
                title: "AI Legal Assistant",
                market: "$25B by 2028",
                why: "Legal services are expensive and inaccessible. AI can democratize legal help for billions.",
                examples: "Contract review, legal research, compliance automation",
              },
              {
                title: "AI Creative Studio",
                market: "$38B by 2028",
                why: "Content creation demand is exploding. AI that generates video, music, and designs at scale wins big.",
                examples: "Video generation, music composition, brand design AI",
              },
              {
                title: "AI Financial Advisor",
                market: "$35B by 2028",
                why: "Only the wealthy get financial advice. AI can provide personalized wealth building to everyone.",
                examples: "Portfolio optimization, tax strategy, bill negotiation AI",
              },
            ].map((idea, i) => (
              <div key={idea.title} className="card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {idea.title}
                  </h3>
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                    {idea.market}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{idea.why}</p>
                <div className="text-xs text-slate-500">
                  <span className="text-primary-light font-medium">
                    Examples:
                  </span>{" "}
                  {idea.examples}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
