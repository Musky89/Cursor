"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb,
  ArrowRight,
  Trophy,
  DollarSign,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  Star,
} from "lucide-react";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ScoreGauge } from "@/components/ScoreGauge";
import type { IdeaResult } from "@/lib/ai-engine";

export default function IdeaGenerator() {
  const [formData, setFormData] = useState({
    skills: "",
    budget: "",
    interests: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<IdeaResult | null>(null);
  const [selectedIdea, setSelectedIdea] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s < 4 ? s + 1 : s));
    }, 600);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setResult(null);
    setSelectedIdea(0);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const compBadge = {
    low: "text-success bg-success/10",
    medium: "text-warning bg-warning/10",
    high: "text-danger bg-danger/10",
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            AI Business Idea <span className="gradient-text">Generator</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tell us your skills, budget, and interests. AI generates validated
            business ideas with market sizing, revenue projections, and step-by-step
            launch plans.
          </p>
        </div>

        {!result && !loading && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Skills & Experience
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="E.g., Full-stack development, marketing, data analysis, 5 years in fintech..."
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Starting Budget
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="$5,000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Interests / Passions
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="AI, health, education..."
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
              Generate Business Ideas
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {loading && <LoadingAnalysis step={loadingStep} />}

        {result && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Your AI-Generated Ideas</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Top pick: <span className="text-primary-light font-medium">{result.topPick}</span>
                </p>
              </div>
              <button
                onClick={() => { setResult(null); setFormData({ skills: "", budget: "", interests: "" }); }}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                Generate More
              </button>
            </div>

            {/* Idea Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {result.ideas.map((idea, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIdea(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedIdea === i
                      ? "bg-primary text-white"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {i === 0 && <Trophy className="w-3.5 h-3.5 inline mr-1.5" />}
                  {idea.name}
                </button>
              ))}
            </div>

            {/* Selected Idea Detail */}
            {result.ideas[selectedIdea] && (() => {
              const idea = result.ideas[selectedIdea];
              return (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="card">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-bold text-white">{idea.name}</h3>
                          {selectedIdea === 0 && (
                            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" /> Top Pick
                            </span>
                          )}
                        </div>
                        <p className="text-primary-light font-medium mb-3">{idea.tagline}</p>
                        <p className="text-sm text-slate-400">{idea.description}</p>
                      </div>
                      <ScoreGauge score={idea.validationScore} label="Validation Score" size={120} />
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card text-center">
                      <DollarSign className="w-5 h-5 text-success mx-auto mb-2" />
                      <div className="text-lg font-bold text-white">{idea.marketSize}</div>
                      <div className="text-xs text-slate-400">Market Size</div>
                    </div>
                    <div className="card text-center">
                      <DollarSign className="w-5 h-5 text-primary-light mx-auto mb-2" />
                      <div className="text-lg font-bold text-white">{idea.monthlyRevenuePotential}</div>
                      <div className="text-xs text-slate-400">Monthly Rev. Potential</div>
                    </div>
                    <div className="card text-center">
                      <DollarSign className="w-5 h-5 text-warning mx-auto mb-2" />
                      <div className="text-lg font-bold text-white">{idea.startupCost}</div>
                      <div className="text-xs text-slate-400">Startup Cost</div>
                    </div>
                    <div className="card text-center">
                      <Users className="w-5 h-5 text-accent mx-auto mb-2" />
                      <div className={`text-lg font-bold ${compBadge[idea.competitionLevel].split(" ")[0]}`}>
                        {idea.competitionLevel.charAt(0).toUpperCase() + idea.competitionLevel.slice(1)}
                      </div>
                      <div className="text-xs text-slate-400">Competition</div>
                    </div>
                  </div>

                  {/* Revenue Model & Moat */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="card">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-success" />
                        Revenue Model
                      </h4>
                      <p className="text-sm text-slate-400">{idea.revenueModel}</p>
                    </div>
                    <div className="card">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary-light" />
                        Competitive Moat
                      </h4>
                      <p className="text-sm text-slate-400">{idea.moat}</p>
                    </div>
                  </div>

                  {/* Launch Steps */}
                  <div className="card">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Launch Playbook
                    </h4>
                    <ol className="space-y-3">
                      {idea.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs text-primary-light font-bold">{i + 1}</span>
                          </div>
                          <span className="text-sm text-slate-300">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Risks */}
                  <div className="card">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Key Risks
                    </h4>
                    <ul className="space-y-2">
                      {idea.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
