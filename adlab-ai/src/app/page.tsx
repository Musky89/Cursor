import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";

export default async function LandingPage() {
  const auth = await getAuthContext();
  if (auth) redirect("/app");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <AdShowcase />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500">
            <span className="text-sm font-black text-white">A</span>
          </div>
          <span className="text-lg font-bold">AdLab AI</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#how-it-works" className="transition hover:text-white">How it works</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 transition hover:text-white">Log in</Link>
          <Link href="/login" className="rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,70,239,0.1),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 text-center md:pt-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Powered by GPT-4 + Google Nano Banana
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          AI Ad Creative That
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent"> Actually Converts</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
          Generate studio-quality ad copy, images, and campaigns in seconds.
          Art-directed by GPT. Rendered by Nano Banana. Optimized by AI.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login" className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 hover:opacity-95">
            Start Creating Ads — Free
          </Link>
          <a href="#how-it-works" className="rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white">
            See How It Works
          </a>
        </div>
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-orange-500/20 blur-xl" />
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
            <Image src="/hero-dashboard.png" alt="AdLab AI Dashboard" width={1200} height={675} className="w-full" priority />
          </div>
        </div>
      </div>
    </section>
  );
}

function Logos() {
  const brands = ["Meta Ads", "TikTok Ads", "Google Ads", "Instagram", "YouTube"];
  return (
    <section className="border-y border-zinc-800/50 bg-zinc-900/30 py-8">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-zinc-500">Generate ads for every major platform</p>
      <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-8 text-zinc-500">
        {brands.map((b) => (
          <span key={b} className="text-sm font-semibold">{b}</span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: "🎯",
      title: "GPT Art Director",
      description: "GPT-4 transforms your brief into a hyper-specific photographic brief — camera angles, lighting rigs, talent direction, wardrobe. Agency-grade art direction, automated.",
    },
    {
      icon: "🎨",
      title: "Nano Banana Image Gen",
      description: "Google's #1 ranked image model renders your art-directed briefs into photorealistic ad creative. 9.5/10 quality rated. Not stock photos — studio-grade originals.",
    },
    {
      icon: "✍️",
      title: "AI Copywriter",
      description: "GPT writes culturally-aware ad copy that matches your audience's language, slang, and vibes. SA township culture? Gen-Z campus lingo? It adapts.",
    },
    {
      icon: "🧪",
      title: "Experiment Engine",
      description: "Launch A/B experiments across META, TikTok, and Google. Assign budgets, allocate concepts, and simulate campaign outcomes before spending a cent.",
    },
    {
      icon: "🤖",
      title: "Autonomous Optimizer",
      description: "AI monitors ROAS, CPA, and CTR in real-time. Automatically scales winners and pauses losers to protect your budget. No manual babysitting.",
    },
    {
      icon: "🎭",
      title: "Brand Style System",
      description: "Switch between brand aesthetics instantly. Pepsi energy? Coke warmth? Custom profiles? Your visual identity stays consistent across every asset.",
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Features</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Everything a creative agency does.<br /><span className="text-zinc-500">At 1/100th the cost.</span></h2>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-zinc-700 hover:bg-zinc-900/70">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { step: "01", title: "Define your product & audience", description: "Enter your product details, target audience pain points, desires, and cultural context. The more specific, the better the output." },
    { step: "02", title: "AI generates ad concepts", description: "GPT creates multiple ad concepts with headlines, hooks, body copy, video scripts, and image prompts — all tailored to your audience's language." },
    { step: "03", title: "Art Director renders visuals", description: "GPT writes a studio-grade creative brief, then Nano Banana renders photorealistic ad images that look like they came from a $500K shoot." },
    { step: "04", title: "Launch, simulate & optimize", description: "Select your best concepts, launch experiments, simulate campaign performance, and let the AI optimizer auto-allocate budget to winners." },
  ];

  return (
    <section id="how-it-works" className="border-y border-zinc-800/50 bg-zinc-900/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-fuchsia-400">How it works</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">From brief to billboard in minutes</h2>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="relative">
              <span className="text-5xl font-black text-zinc-800">{s.step}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Real output</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Generated by AdLab AI. Not a designer.</h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">These ads were generated in seconds using our GPT Art Director + Nano Banana pipeline. Zero human design work.</p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <Image src="/hero-concepts.png" alt="AI generated ad concepts" width={600} height={600} className="w-full" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <Image src="/hero-abstract.png" alt="AI advertising technology" width={600} height={600} className="w-full" />
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Try AdLab AI with limited generations",
      features: ["5 ad concepts/month", "2 image generations/month", "1 workspace", "META channel only", "Basic optimizer"],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/mo",
      description: "For growing brands and solo marketers",
      features: ["Unlimited ad concepts", "100 image generations/month", "5 workspaces", "All channels (META, TikTok, Google)", "GPT Art Director", "Brand Style System", "Priority support"],
      cta: "Start Pro Trial",
      highlight: true,
    },
    {
      name: "Agency",
      price: "$199",
      period: "/mo",
      description: "For agencies managing multiple brands",
      features: ["Everything in Pro", "Unlimited image generations", "Unlimited workspaces", "Custom brand styles", "API access", "Team collaboration", "White-label exports", "Dedicated support"],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="border-y border-zinc-800/50 bg-zinc-900/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Start free. Scale when ready.</h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">No credit card required. Stripe integration coming soon.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-transparent shadow-lg shadow-cyan-500/10"
                  : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-1 text-xs font-bold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && <span className="text-zinc-500">{plan.period}</span>}
              </div>
              <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="mt-0.5 text-cyan-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-8 block rounded-xl px-6 py-3 text-center text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90"
                    : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 text-center">
      <h2 className="text-3xl font-bold md:text-5xl">
        Stop paying agencies.<br />
        <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Start generating revenue.</span>
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
        Join the brands using AI to produce ad creative that actually performs. Your first campaign is free.
      </p>
      <Link href="/login" className="mt-10 inline-block rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40">
        Create Your First Ad →
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-900/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500">
              <span className="text-xs font-black text-white">A</span>
            </div>
            <span className="font-bold">AdLab AI</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <Link href="/login" className="hover:text-white">Log in</Link>
          </div>
          <p className="text-sm text-zinc-600">© {new Date().getFullYear()} AdLab AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
