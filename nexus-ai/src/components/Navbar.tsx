"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  Globe,
  Lightbulb,
  DollarSign,
} from "lucide-react";

const tools = [
  {
    name: "Revenue Analyzer",
    href: "/tools/revenue-analyzer",
    icon: BarChart3,
    desc: "Analyze and optimize revenue streams",
  },
  {
    name: "Market Finder",
    href: "/tools/market-finder",
    icon: Globe,
    desc: "Discover untapped market opportunities",
  },
  {
    name: "Idea Generator",
    href: "/tools/idea-generator",
    icon: Lightbulb,
    desc: "AI-validated business ideas",
  },
  {
    name: "Pricing Optimizer",
    href: "/tools/pricing-optimizer",
    icon: DollarSign,
    desc: "Maximize revenue with smart pricing",
  },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">NexusAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                AI Tools
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {toolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 glass rounded-xl p-2 animate-fade-in-up">
                  {tools.map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <tool.icon className="w-4 h-4 text-primary-light" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {tool.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {tool.desc}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm !py-2 !px-5">
              Get Started Free
            </Link>
          </div>

          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/5 animate-fade-in-up">
          <div className="px-4 py-4 space-y-2">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <tool.icon className="w-5 h-5 text-primary-light" />
                <span className="text-sm text-slate-300">{tool.name}</span>
              </Link>
            ))}
            <hr className="border-white/5" />
            <Link
              href="/dashboard"
              className="block p-3 text-sm text-slate-300 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="block p-3 text-sm text-slate-300 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="block p-3 text-sm text-slate-300 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="block btn-primary text-center text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
