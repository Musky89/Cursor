"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  Target,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ScoreGauge } from "@/components/ScoreGauge";
import type { PricingResult } from "@/lib/ai-engine";

export default function PricingOptimizer() {
  const [formData, setFormData] = useState({
    product: "",
    currentPrice: "",
    market: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<PricingResult | null>(null);

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
      const res = await fetch("/api/pricing", {
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

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            AI Pricing <span className="gradient-text">Optimizer</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Input your product and current pricing. AI models the optimal
            strategy using elasticity curves, competitor analysis, and
            willingness-to-pay modeling.
          </p>
        </div>

        {!result && !loading && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Product / Service Description
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="E.g., Cloud-based project management tool for teams of 5-50 people. Features: task boards, time tracking, reporting, integrations..."
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Price (per unit/mo)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="$49"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Market
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="SMBs, Enterprise, B2C..."
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
              Optimize Pricing
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {loading && <LoadingAnalysis step={loadingStep} />}

        {result && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Pricing Analysis</h2>
              <button
                onClick={() => { setResult(null); setFormData({ product: "", currentPrice: "", market: "" }); }}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                New Analysis
              </button>
            </div>

            {/* Price Comparison */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="text-sm text-slate-400 mb-1">Current Price</div>
                <div className="text-3xl font-bold text-white">${result.currentAnalysis.currentPrice}</div>
                <div className="text-xs text-slate-500 mt-1">{result.currentAnalysis.currentMargin}% margin</div>
              </div>
              <div className="card text-center border-primary/30 animate-pulse-glow">
                <div className="text-sm text-primary-light mb-1 flex items-center justify-center gap-1">
                  <Target className="w-4 h-4" />
                  Optimal Price
                </div>
                <div className="text-3xl font-bold gradient-text">${result.currentAnalysis.optimalPrice}</div>
                <div className="text-xs text-success mt-1 flex items-center justify-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {result.currentAnalysis.revenueImpact}
                </div>
              </div>
              <div className="card text-center">
                <div className="text-sm text-slate-400 mb-1">Potential Margin</div>
                <div className="text-3xl font-bold text-success">{result.currentAnalysis.potentialMargin}%</div>
                <div className="text-xs text-success mt-1">
                  +{result.currentAnalysis.potentialMargin - result.currentAnalysis.currentMargin}% increase
                </div>
              </div>
            </div>

            {/* Elasticity Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-light" />
                Price Elasticity & Revenue Curve
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.elasticityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                    <XAxis dataKey="price" stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.75rem" }}
                      formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === "revenue" ? "Revenue" : "Demand"]}
                      labelFormatter={(l) => `Price: $${l}`}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenueGradient)" strokeWidth={2} />
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Pricing Strategies
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.recommendations.map((rec) => (
                  <div key={rec.strategy} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{rec.strategy}</h4>
                      <ScoreGauge score={rec.confidence} label="Confidence" size={60} />
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{rec.description}</p>
                    <div className="text-xs text-success font-medium flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {rec.expectedImpact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Pricing */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">
                Competitive Pricing Landscape
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Your Price", price: result.currentAnalysis.currentPrice, isYou: true },
                    ...result.competitorPricing.map((c) => ({ name: c.name.split("(")[0].trim(), price: c.price, isYou: false })),
                    { name: "Optimal", price: result.currentAnalysis.optimalPrice, isYou: true },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={50} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.75rem" }}
                      formatter={(value) => [`$${value}`, "Price"]}
                    />
                    <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                      {[
                        { isYou: true },
                        ...result.competitorPricing.map(() => ({ isYou: false })),
                        { isYou: true },
                      ].map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.isYou ? "#6366f1" : "#334155"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {result.competitorPricing.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{c.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 text-xs">{c.features}</span>
                      <span className="text-white font-medium">${c.price}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
