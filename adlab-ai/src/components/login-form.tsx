"use client";

import { FormEvent, useMemo, useState } from "react";

type AuthMode = "login" | "register";

type FormState = {
  fullName: string;
  email: string;
  password: string;
};

const defaultFormState: FormState = {
  fullName: "",
  email: "",
  password: "",
};

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modeLabel = useMemo(
    () =>
      mode === "login"
        ? {
            title: "Sign in to AdLab AI",
            subtitle: "Run AI ad concepts, launch experiments, and optimize toward revenue.",
            action: "Sign in",
          }
        : {
            title: "Create your workspace",
            subtitle: "Get a seeded workspace and start generating revenue-focused ad concepts.",
            action: "Create account",
          },
    [mode],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? {
            email: formState.email,
            password: formState.password,
          }
        : formState;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(data?.error ?? "Unable to complete request.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/app";
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/50 p-7 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-zinc-50">{modeLabel.title}</h1>
        <p className="text-sm text-zinc-400">{modeLabel.subtitle}</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">Full name</span>
            <input
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none ring-cyan-500 transition focus:ring-2"
              value={formState.fullName}
              onChange={(event) =>
                setFormState((previous) => ({ ...previous, fullName: event.target.value }))
              }
              placeholder="Alex Carter"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">Email</span>
          <input
            required
            type="email"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none ring-cyan-500 transition focus:ring-2"
            value={formState.email}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, email: event.target.value }))
            }
            placeholder="you@company.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">Password</span>
          <input
            required
            minLength={8}
            type="password"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none ring-cyan-500 transition focus:ring-2"
            value={formState.password}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, password: event.target.value }))
            }
            placeholder="Minimum 8 characters"
          />
        </label>

        {error ? <p className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Processing..." : modeLabel.action}
        </button>
      </form>

      <div className="mt-5 text-sm text-zinc-400">
        {mode === "login" ? "New user?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="font-semibold text-cyan-400 hover:text-cyan-300"
        >
          {mode === "login" ? "Create one now" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
