import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500">
              <span className="text-sm font-black text-white">A</span>
            </div>
            <span className="text-lg font-bold">AdLab AI</span>
          </Link>
          <Link href="/login" className="rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">
            Start Free
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold md:text-5xl">Simple, transparent pricing</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-400">Start free. Upgrade when your ads start performing. No hidden fees.</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <PlanCard
            name="Starter"
            price="Free"
            period=""
            description="Perfect for testing the waters"
            features={["5 ad concepts per month", "2 AI image generations", "1 workspace", "META channel", "Basic campaign simulator", "Community support"]}
            cta="Get Started Free"
            href="/login"
          />
          <PlanCard
            name="Pro"
            price="$49"
            period="/month"
            description="For brands serious about growth"
            features={["Unlimited ad concepts", "100 AI image generations", "5 workspaces", "All channels (META, TikTok, Google)", "GPT Art Director", "Brand Style System", "Autonomous Optimizer", "Priority email support"]}
            cta="Start 14-Day Free Trial"
            href="/login"
            highlight
          />
          <PlanCard
            name="Agency"
            price="$199"
            period="/month"
            description="For agencies managing multiple brands"
            features={["Everything in Pro", "Unlimited image generations", "Unlimited workspaces", "Custom brand style profiles", "REST API access", "Team collaboration (5 seats)", "White-label PDF exports", "Dedicated account manager"]}
            cta="Contact Sales"
            href="/login"
          />
        </div>

        <section className="mt-24">
          <h2 className="text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            <FAQ q="Do I need my own AI API keys?" a="No. AdLab AI handles all AI infrastructure. Your subscription includes GPT-4 for copy and art direction, plus Google Nano Banana for image generation. No separate API keys needed." />
            <FAQ q="Can I use the generated images commercially?" a="Yes. All images generated through AdLab AI are yours to use in any commercial context — paid ads, social media, print, billboards. No attribution required." />
            <FAQ q="How is this different from Canva or generic AI image tools?" a="AdLab AI is purpose-built for advertising. Every image is art-directed by GPT-4 with specific camera angles, lighting, and composition for maximum conversion impact. Generic tools give you generic output." />
            <FAQ q="What about Stripe / payments?" a="Stripe integration is coming soon. Currently all plans are accessible for testing. You'll be notified when billing goes live." />
            <FAQ q="Can I fine-tune the AI to match my exact brand style?" a="Yes. The Brand Style System lets you define visual identity profiles (color palette, photography style, lighting, mood). For even deeper customization, we support LoRA fine-tuning of image models on your own reference images." />
          </div>
        </section>
      </main>
    </div>
  );
}

function PlanCard({ name, price, period, description, features, cta, href, highlight = false }: {
  name: string; price: string; period: string; description: string; features: string[]; cta: string; href: string; highlight?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border p-8 ${highlight ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-transparent shadow-xl shadow-cyan-500/10" : "border-zinc-800 bg-zinc-900/40"}`}>
      {highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-1 text-xs font-bold text-white">Most Popular</span>}
      <h3 className="text-xl font-bold">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-extrabold">{price}</span>
        {period && <span className="text-zinc-500">{period}</span>}
      </div>
      <p className="mt-3 text-sm text-zinc-400">{description}</p>
      <ul className="mt-8 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
            <span className="mt-0.5 text-cyan-400">✓</span>{f}
          </li>
        ))}
      </ul>
      <Link href={href} className={`mt-8 block rounded-xl px-6 py-3.5 text-center text-sm font-bold transition ${highlight ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90" : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"}`}>
        {cta}
      </Link>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h3 className="font-semibold">{q}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{a}</p>
    </div>
  );
}
