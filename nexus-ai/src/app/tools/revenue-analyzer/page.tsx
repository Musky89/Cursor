"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ScoreGauge } from "@/components/ScoreGauge";
import type { AnalysisResult } from "@/lib/ai-engine";

export default function RevenueAnalyzer() {
  const [formData, setFormData] = useState({
    businessDescription: "",
    revenue: "",
    industry: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

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
      const res = await fetch("/api/analyze", {
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

  const impactColor = {
    high: "text-success bg-success/10",
    medium: "text-warning bg-warning/10",
    low: "text-slate-400 bg-slate-400/10",
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            AI Revenue <span className="gradient-text">Analyzer</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Describe your business and current revenue. Our AI will identify
            optimization opportunities, revenue leaks, and growth strategies
            worth $10K–$10M+.
          </p>
        </div>

        {/* Form */}
        {!result && !loading && (
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto space-y-6 animate-fade-in-up"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Describe Your Business
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="E.g., We're a B2B SaaS company selling project management software to mid-market companies. We have 500 paying customers with an average deal size of $2K/month..."
                value={formData.businessDescription}
                onChange={(e) =>
                  setFormData({ ...formData, businessDescription: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Annual Revenue
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="$500,000"
                  value={formData.revenue}
                  onChange={(e) =>
                    setFormData({ ...formData, revenue: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="SaaS, E-commerce, Services..."
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
              Analyze Revenue
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* Loading */}
        {loading && <LoadingAnalysis step={loadingStep} />}

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{result.title}</h2>
              <button
                onClick={() => { setResult(null); setFormData({ businessDescription: "", revenue: "", industry: "" }); }}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                New Analysis
              </button>
            </div>

            {/* Score + Insights */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card flex flex-col items-center justify-center">
                <ScoreGauge score={result.score} label="Revenue Health Score" size={140} />
              </div>
              <div className="card md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary-light" />
                  Key Insights
                </h3>
                <ul className="space-y-3">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-primary-light font-bold">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-sm text-slate-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Opportunities */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                Revenue Opportunities
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.opportunities.map((opp) => (
                  <div key={opp.name} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{opp.name}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${impactColor[opp.impact]}`}>
                        {opp.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{opp.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-success font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {opp.revenueEstimate}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {opp.timeframe}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projections Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-light" />
                12-Month Revenue Projection
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.projections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "0.75rem" }}
                      labelStyle={{ color: "#e2e8f0" }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="current" stroke="#64748b" strokeWidth={2} name="Current Trajectory" dot={false} />
                    <Line type="monotone" dataKey="optimized" stroke="#6366f1" strokeWidth={3} name="Optimized (AI)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risks */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Risk Factors
              </h3>
              <ul className="space-y-2">
                {result.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
