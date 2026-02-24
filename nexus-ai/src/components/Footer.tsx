import Link from "next/link";
import { Brain, Github, Twitter, Linkedin } from "lucide-react";

const links = {
  Product: [
    { name: "Revenue Analyzer", href: "/tools/revenue-analyzer" },
    { name: "Market Finder", href: "/tools/market-finder" },
    { name: "Idea Generator", href: "/tools/idea-generator" },
    { name: "Pricing Optimizer", href: "/tools/pricing-optimizer" },
  ],
  Company: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
  ],
  Resources: [
    { name: "Documentation", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Status", href: "#" },
    { name: "Support", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">NexusAI</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs mb-6">
              The world&apos;s most advanced AI-powered revenue intelligence
              platform. Trusted by 50,000+ businesses worldwide.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-primary-light transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} NexusAI. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <a key={t} href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
