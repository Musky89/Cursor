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
      <SocialProof />
      <BeforeAfter />
      <ProductShowcase />
      <HowItWorks />
      <Features />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-fuchsia-500">
            <span className="text-xs font-black text-white">A</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">AdLab AI</span>
        </Link>
        <div className="hidden items-center gap-7 text-[13px] text-zinc-500 md:flex">
          <a href="#product" className="transition hover:text-white">Product</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] text-zinc-400 transition hover:text-white">Sign in</Link>
          <Link href="/login" className="rounded-lg bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-950 transition hover:bg-zinc-200">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(6,182,212,0.12),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] text-zinc-400">
          <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
          Now with Google Nano Banana — #1 AI image model
        </div>

        <h1 className="mx-auto max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight">
          Your creative agency<br />
          <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">costs $0/month</span>
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-zinc-400">
          AdLab generates studio-quality ad copy and images for META, TikTok, and Google — in seconds, not weeks. No designers. No agencies. No briefs.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login" className="group rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-zinc-950 shadow-lg shadow-white/10 transition hover:shadow-white/20">
            Start for free
            <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <a href="#product" className="rounded-xl px-6 py-3 text-[15px] text-zinc-500 transition hover:text-white">
            See it in action
          </a>
        </div>

        <p className="mt-4 text-[12px] text-zinc-600">No credit card required · Free tier available</p>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[13px] text-zinc-600">
        <span>Trusted by teams at</span>
        {["DTC brands", "Performance agencies", "Solo marketers", "E-commerce", "SaaS companies"].map(t => (
          <span key={t} className="font-medium text-zinc-500">{t}</span>
        ))}
      </div>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <span className="text-[12px] font-semibold uppercase tracking-widest text-red-400">Before AdLab</span>
          <ul className="mt-5 space-y-3 text-[15px] text-zinc-400">
            <li className="flex gap-3"><span className="text-red-500/70">✕</span> 2-4 weeks for a campaign creative deck</li>
            <li className="flex gap-3"><span className="text-red-500/70">✕</span> $5,000–$50,000 per agency retainer</li>
            <li className="flex gap-3"><span className="text-red-500/70">✕</span> 3 rounds of revisions, still mediocre</li>
            <li className="flex gap-3"><span className="text-red-500/70">✕</span> Generic stock photos that scream &quot;ad&quot;</li>
            <li className="flex gap-3"><span className="text-red-500/70">✕</span> No idea which creative will convert until you spend</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 p-8">
          <span className="text-[12px] font-semibold uppercase tracking-widest text-cyan-400">With AdLab</span>
          <ul className="mt-5 space-y-3 text-[15px] text-zinc-300">
            <li className="flex gap-3"><span className="text-cyan-400">✓</span> Full campaign in under 60 seconds</li>
            <li className="flex gap-3"><span className="text-cyan-400">✓</span> Starts at $0. Pro at $49/month.</li>
            <li className="flex gap-3"><span className="text-cyan-400">✓</span> Unlimited variations until you love it</li>
            <li className="flex gap-3"><span className="text-cyan-400">✓</span> Photorealistic images rated 9.5/10 by reviewers</li>
            <li className="flex gap-3"><span className="text-cyan-400">✓</span> AI optimizer tells you which creative wins before you spend</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProductShowcase() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-fuchsia-400">The output</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">This is what AdLab generates.</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-zinc-500">Real output from a real prompt. Not mocked up. Not designed. AI-generated in under 30 seconds each.</p>
      </div>
      <div className="mt-12 grid gap-3 md:grid-cols-3">
        {[
          { src: "/showcase-1.png", label: "META Feed Ad", sublabel: "Pepsi-style · Neon energy" },
          { src: "/showcase-2.png", label: "Lifestyle Campaign", sublabel: "Coke-style · Golden hour" },
          { src: "/showcase-3.png", label: "Product Hero Shot", sublabel: "Studio · Commercial grade" },
        ].map((img) => (
          <div key={img.src} className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-zinc-700">
            <div className="aspect-square overflow-hidden">
              <Image src={img.src} alt={img.label} width={600} height={600} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-4">
              <p className="text-[14px] font-medium">{img.label}</p>
              <p className="text-[12px] text-zinc-500">{img.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-y border-white/5 bg-zinc-900/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-zinc-500">How it works</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">Brief → Copy → Image → Launch.<br /><span className="text-zinc-600">All in one place.</span></h2>

        <div className="mt-14 grid gap-12 md:grid-cols-4">
          {[
            { n: "1", t: "Describe", d: "Enter your product, audience, and cultural context. The richer the input, the sharper the output." },
            { n: "2", t: "Generate", d: "GPT writes ad copy in your audience's voice — their slang, their references, their vibe. Not corporate-speak." },
            { n: "3", t: "Render", d: "GPT acts as art director. Nano Banana renders the brief into images that look like a $500K shoot." },
            { n: "4", t: "Optimize", d: "Launch experiments. Simulate performance. AI pauses losers and scales winners automatically." },
          ].map((s) => (
            <div key={s.n}>
              <span className="text-[42px] font-black text-zinc-800">{s.n}</span>
              <h3 className="mt-1 text-[16px] font-semibold">{s.t}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: "⚡", t: "GPT Art Director", d: "Transforms your brief into camera angles, lighting setups, talent direction, and color grades. The brief IS the difference between AI slop and agency output." },
          { icon: "🎨", t: "Nano Banana Rendering", d: "Google's #1 ranked image model. Photorealistic output that human reviewers rated 9.5/10. Legible text, accurate products, real humans." },
          { icon: "🧠", t: "Cultural Intelligence", d: "Feeds your audience's slang, music references, and cultural context directly into copy and visuals. Township lingo? Amapiano vibes? It gets it." },
          { icon: "🧪", t: "Campaign Simulator", d: "Run 5 days of simulated ad performance before spending a cent. Know which creative wins before you open your wallet." },
          { icon: "🔄", t: "Brand Style Switching", d: "Pepsi energy or Coke warmth? Define your visual identity once. Every image stays on-brand automatically." },
          { icon: "📊", t: "Autonomous Optimizer", d: "ROAS below threshold? The AI pauses it. CTR spiking? It scales budget. You set the rules, AI enforces them." },
        ].map((f) => (
          <div key={f.t} className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5 transition hover:border-zinc-700">
            <span className="text-2xl">{f.icon}</span>
            <h3 className="mt-3 text-[15px] font-semibold">{f.t}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-y border-white/5 bg-zinc-900/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Simple pricing. Start free.</h2>
          <p className="mt-2 text-[15px] text-zinc-500">No credit card required. Upgrade when you&apos;re ready.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          <PricingCard
            name="Free"
            price="$0"
            features={["5 concepts/month", "2 images/month", "1 workspace", "META only"]}
            cta="Get started"
          />
          <PricingCard
            name="Pro"
            price="$49"
            period="/mo"
            features={["Unlimited concepts", "100 images/month", "All channels", "Art Director", "Brand styles", "Optimizer"]}
            cta="Start free trial"
            highlight
          />
          <PricingCard
            name="Agency"
            price="$199"
            period="/mo"
            features={["Everything in Pro", "Unlimited images", "Unlimited workspaces", "API access", "Team seats", "White-label"]}
            cta="Talk to us"
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({ name, price, period, features, cta, highlight }: {
  name: string; price: string; period?: string; features: string[]; cta: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-white/20 bg-white/5 shadow-lg shadow-white/5" : "border-zinc-800/50 bg-zinc-900/30"}`}>
      <p className="text-[13px] font-medium text-zinc-400">{name}</p>
      <div className="mt-2 flex items-baseline gap-0.5">
        <span className="text-3xl font-bold">{price}</span>
        {period && <span className="text-[13px] text-zinc-500">{period}</span>}
      </div>
      <ul className="mt-5 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-zinc-400">
            <span className="text-zinc-600">—</span>{f}
          </li>
        ))}
      </ul>
      <Link href="/login" className={`mt-6 block rounded-lg py-2.5 text-center text-[13px] font-medium transition ${highlight ? "bg-white text-zinc-950 hover:bg-zinc-200" : "border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"}`}>
        {cta}
      </Link>
    </div>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 text-center">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Your competitors are still waiting<br />for their agency to deliver.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] text-zinc-500">
        You could have 50 ad concepts with studio-quality images by the time they schedule a kickoff call.
      </p>
      <Link href="/login" className="group mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-[15px] font-semibold text-zinc-950 shadow-lg shadow-white/10 transition hover:shadow-white/20">
        Start creating now
        <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[12px] text-zinc-600">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-cyan-400 to-fuchsia-500">
            <span className="text-[8px] font-black text-white">A</span>
          </div>
          <span>AdLab AI</span>
        </div>
        <div className="flex gap-6">
          <a href="#product" className="hover:text-white">Product</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <Link href="/login" className="hover:text-white">Sign in</Link>
        </div>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
