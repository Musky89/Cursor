"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Zap,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ScoreGauge } from "@/components/ScoreGauge";
import type { MarketResult } from "@/lib/ai-engine";

export default function MarketFinder() {
  const [formData, setFormData] = useState({ industry: "", region: "" });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<MarketResult | null>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s < 4 ? s + 1 : s));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setResult(null);

    try {
      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const compColor = { low: "text-success", medium: "text-warning", high: "text-danger" };
  const trendIcon = {
    up: <TrendingUp className="w-4 h-4 text-success" />,
    down: <TrendingDown className="w-4 h-4 text-danger" />,
    stable: <Minus className="w-4 h-4 text-slate-400" />,
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Market Opportunity <span className="gradient-text">Finder</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tell us your industry and target region. AI scans global markets to
            surface underserved niches, emerging trends, and blue-ocean
            opportunities.
          </p>
        </div>

        {!result && !loading && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Industry / Sector
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="E.g., Healthcare, Fintech, Education, E-commerce..."
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Region (optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="E.g., Global, North America, Southeast Asia, Europe..."
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
              Find Market Opportunities
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {loading && <LoadingAnalysis step={loadingStep} />}

        {result && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Market Analysis: {formData.industry}
              </h2>
              <button
                onClick={() => { setResult(null); setFormData({ industry: "", region: "" }); }}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                New Search
              </button>
            </div>

            {/* Global Insights */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Global Market Insights
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.globalInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-white/5 rounded-lg p-3">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-accent font-bold">{i + 1}</span>
                    </div>
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Market Opportunities */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-light" />
                Top Market Opportunities
              </h3>
              <div className="space-y-4">
                {result.markets.map((market, i) => (
                  <div key={i} className="card">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-white text-lg">{market.name}</h4>
                          <span className="text-xs bg-primary/10 text-primary-light px-2 py-0.5 rounded-full">
                            {market.region}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{market.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="text-success font-medium">{market.marketSize} market</span>
                          <span className="text-primary-light font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {market.growth}
                          </span>
                          <span className={`font-medium ${compColor[market.competition]}`}>
                            {market.competition} competition
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {market.entryBarrier} barrier
                          </span>
                        </div>
                      </div>
                      <ScoreGauge score={market.score} label="Opportunity Score" size={100} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trends */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Market Trends
                </h3>
                <div className="space-y-3">
                  {result.trends.map((trend) => (
                    <div key={trend.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {trendIcon[trend.direction]}
                        <span className="text-sm text-slate-300">{trend.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                            style={{ width: `${trend.relevance}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-8">{trend.relevance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Opportunity Radar
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={result.markets.map((m) => ({ name: m.name.split(" ").slice(0, 2).join(" "), score: m.score }))}>
                      <PolarGrid stroke="rgba(99,102,241,0.15)" />
                      <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <PolarRadiusAxis stroke="rgba(99,102,241,0.1)" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.75rem" }} />
                      <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
