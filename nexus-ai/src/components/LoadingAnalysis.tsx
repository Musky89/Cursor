"use client";

import { Brain, Loader2 } from "lucide-react";

const steps = [
  "Initializing AI models...",
  "Processing your data...",
  "Analyzing market patterns...",
  "Generating insights...",
  "Compiling recommendations...",
];

export function LoadingAnalysis({ step = 0 }: { step?: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-primary-light animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        AI is analyzing...
      </h3>
      <div className="space-y-2 mt-4">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-2 text-sm transition-all duration-500 ${
              i <= step ? "text-primary-light opacity-100" : "text-slate-500 opacity-40"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                i < step
                  ? "bg-success"
                  : i === step
                    ? "bg-primary-light animate-pulse"
                    : "bg-slate-600"
              }`}
            />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
