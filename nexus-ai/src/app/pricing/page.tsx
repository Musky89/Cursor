"use client";

import Link from "next/link";
import { CheckCircle, X, Zap, Star, Crown } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for exploring AI revenue tools",
    features: [
      { name: "3 analyses per month", included: true },
      { name: "Revenue Analyzer (basic)", included: true },
      { name: "Market Finder (basic)", included: true },
      { name: "Idea Generator (basic)", included: true },
      { name: "Pricing Optimizer", included: false },
      { name: "Custom reports", included: false },
      { name: "API access", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    icon: Star,
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "For growing businesses serious about revenue",
    features: [
      { name: "Unlimited analyses", included: true },
      { name: "Revenue Analyzer (advanced)", included: true },
      { name: "Market Finder (global)", included: true },
      { name: "Idea Generator (full)", included: true },
      { name: "Pricing Optimizer", included: true },
      { name: "Custom reports", included: true },
      { name: "API access", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Crown,
    monthlyPrice: 199,
    yearlyPrice: 159,
    description: "For teams that need maximum revenue intelligence",
    features: [
      { name: "Unlimited everything", included: true },
      { name: "All tools (enterprise-grade)", included: true },
      { name: "Real-time market monitoring", included: true },
      { name: "Multi-user workspace", included: true },
      { name: "Custom AI model training", included: true },
      { name: "White-label reports", included: true },
      { name: "Full API access", included: true },
      { name: "Dedicated success manager", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Start free, upgrade when you need more power. Every plan includes
            our core AI revenue tools.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? "text-white" : "text-slate-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-primary" : "bg-surface-lighter"}`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${annual ? "left-8" : "left-1"}`}
              />
            </button>
            <span className={`text-sm ${annual ? "text-white" : "text-slate-500"}`}>
              Annual
            </span>
            {annual && (
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => {
            const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={`card relative ${
                  plan.popular
                    ? "border-primary/50 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <plan.icon className="w-8 h-8 text-primary-light mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-slate-400 text-sm">/month</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.name} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className={f.included ? "text-slate-300" : "text-slate-600"}>
                        {f.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "btn-primary !w-full"
                      : "btn-secondary !w-full"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How accurate are the AI recommendations?",
                a: "Our AI models are trained on millions of data points from real businesses. Revenue Analyzer recommendations have a 34% average revenue lift, and Pricing Optimizer achieves 22% average margin improvement across all users.",
              },
              {
                q: "Can I connect my real business data?",
                a: "Yes! Pro and Enterprise plans support direct integrations with Stripe, QuickBooks, Shopify, HubSpot, and 50+ other platforms. Your data is encrypted end-to-end and never shared.",
              },
              {
                q: "What if I need more than the free plan?",
                a: "Start with Starter to explore the tools. Upgrade to Pro when you need unlimited analyses and full tool access. Enterprise is designed for teams and includes custom AI model training.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Yes — Pro comes with a 14-day free trial, no credit card required. Enterprise includes a 30-day pilot program with onboarding support.",
              },
            ].map((faq) => (
              <div key={faq.q} className="card">
                <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
