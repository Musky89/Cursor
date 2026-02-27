"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Channel = "META" | "TIKTOK" | "GOOGLE";

type UserSummary = {
  id: string;
  fullName: string;
  email: string;
};

type WorkspaceSummary = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  marginPct: number;
  landingUrl: string;
  isActive: boolean;
};

type Audience = {
  id: string;
  name: string;
  painPoints: string;
  desires: string;
  notes: string | null;
};

type Concept = {
  id: string;
  channel: Channel;
  angle: string;
  hook: string;
  painDesire: string;
  promise: string;
  proof: string;
  offer: string;
  cta: string;
  primaryText: string;
  headline: string;
  script: string;
  imagePrompt: string;
  score: number;
  product: {
    id: string;
    name: string;
    price: number;
    marginPct: number;
  };
  audience: {
    id: string;
    name: string;
  };
  performance: {
    spend: number;
    revenue: number;
    conversions: number;
    clicks: number;
    impressions: number;
    roas: number;
    ctr: number;
    cpa: number;
  };
};

type Experiment = {
  id: string;
  name: string;
  channel: Channel;
  status: "RUNNING" | "PAUSED" | "COMPLETED";
  dailyBudget: number;
  summary: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    revenue: number;
    roas: number;
  };
  conceptLinks: Array<{
    id: string;
    conceptId: string;
    allocationPct: number;
    isEnabled: boolean;
    concept: {
      id: string;
      headline: string;
      angle: string;
      score: number;
    };
  }>;
};

type DashboardData = {
  totals: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    revenue: number;
    roas: number;
    ctr: number;
    cpa: number;
  };
  conceptCount: number;
  experimentCount: number;
  topConcepts: Array<{
    conceptId: string;
    headline: string;
    angle: string;
    spend: number;
    revenue: number;
    conversions: number;
    roas: number;
    cpa: number;
  }>;
  dailyTrend: Array<{
    date: string;
    spend: number;
    revenue: number;
    conversions: number;
    roas: number;
  }>;
  optimizationLogs: Array<{
    id: string;
    decision: "SCALE" | "HOLD" | "PAUSE";
    rationale: string;
    createdAt: string;
    concept: {
      id: string;
      headline: string;
    };
    experiment: {
      id: string;
      name: string;
    };
  }>;
};

type ApiErrorPayload = {
  error?: string;
};

const channelOptions: Channel[] = ["META", "TIKTOK", "GOOGLE"];

async function requestJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload & T;
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload as T;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

type AdLabAppProps = {
  initialUser: UserSummary;
  initialWorkspace: WorkspaceSummary;
};

export function AdLabApp({ initialUser, initialWorkspace }: AdLabAppProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [conceptImages, setConceptImages] = useState<Record<string, string>>({});
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [selectedBrandStyle, setSelectedBrandStyle] = useState("pepsi-inspired");

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "199",
    marginPct: "70",
    landingUrl: "https://",
  });

  const [audienceForm, setAudienceForm] = useState({
    name: "",
    painPoints: "",
    desires: "",
    notes: "",
  });

  const [conceptForm, setConceptForm] = useState({
    productId: "",
    audienceId: "",
    channel: "META" as Channel,
    objective: "Increase profitable conversions with lower blended CPA.",
    count: "4",
  });

  const [experimentForm, setExperimentForm] = useState({
    name: "Weekly Creative Test",
    channel: "META" as Channel,
    dailyBudget: "300",
  });

  const visibleConcepts = useMemo(
    () => concepts.filter((concept) => concept.channel === experimentForm.channel),
    [concepts, experimentForm.channel],
  );

  const selectedVisibleConceptCount = useMemo(
    () => selectedConceptIds.filter((id) => visibleConcepts.some((concept) => concept.id === id)).length,
    [selectedConceptIds, visibleConcepts],
  );

  const setMessage = useCallback((message: string) => {
    setStatusMessage(message);
    setErrorMessage(null);
  }, []);

  const setError = useCallback((message: string) => {
    setErrorMessage(message);
    setStatusMessage(null);
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashboardResponse, productsResponse, audiencesResponse, conceptsResponse, experimentsResponse] =
        await Promise.all([
          requestJson<DashboardData>("/api/dashboard"),
          requestJson<{ products: Product[] }>("/api/products"),
          requestJson<{ audiences: Audience[] }>("/api/audiences"),
          requestJson<{ concepts: Concept[] }>("/api/concepts"),
          requestJson<{ experiments: Experiment[] }>("/api/experiments"),
        ]);

      setDashboard(dashboardResponse);
      setProducts(productsResponse.products);
      setAudiences(audiencesResponse.audiences);
      setConcepts(conceptsResponse.concepts);
      setExperiments(experimentsResponse.experiments);

      if (!conceptForm.productId && productsResponse.products[0]) {
        setConceptForm((previous) => ({
          ...previous,
          productId: productsResponse.products[0].id,
        }));
      }

      if (!conceptForm.audienceId && audiencesResponse.audiences[0]) {
        setConceptForm((previous) => ({
          ...previous,
          audienceId: audiencesResponse.audiences[0].id,
        }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [conceptForm.audienceId, conceptForm.productId, setError]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await requestJson<{ product: Product }>("/api/products", {
        method: "POST",
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          marginPct: Number(productForm.marginPct),
        }),
      });
      setMessage("Product created.");
      setProductForm({
        name: "",
        description: "",
        price: productForm.price,
        marginPct: productForm.marginPct,
        landingUrl: "https://",
      });
      await loadAllData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create product.");
    }
  }

  async function createAudience(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await requestJson<{ audience: Audience }>("/api/audiences", {
        method: "POST",
        body: JSON.stringify(audienceForm),
      });
      setMessage("Audience created.");
      setAudienceForm({
        name: "",
        painPoints: "",
        desires: "",
        notes: "",
      });
      await loadAllData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create audience.");
    }
  }

  async function generateConcepts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    try {
      const response = await requestJson<{ generatedCount: number }>("/api/concepts/generate", {
        method: "POST",
        body: JSON.stringify({
          ...conceptForm,
          count: Number(conceptForm.count),
        }),
      });
      setMessage(`Generated ${response.generatedCount} ad concepts.`);
      await loadAllData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to generate concepts.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function launchExperiment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const channelScopedConceptIds = selectedConceptIds.filter((id) =>
      visibleConcepts.some((concept) => concept.id === id),
    );

    if (channelScopedConceptIds.length === 0) {
      setError("Select at least one concept matching the experiment channel.");
      return;
    }

    try {
      await requestJson<{ experiment: Experiment }>("/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          ...experimentForm,
          dailyBudget: Number(experimentForm.dailyBudget),
          conceptIds: channelScopedConceptIds,
        }),
      });
      setSelectedConceptIds([]);
      setMessage("Experiment launched.");
      await loadAllData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to launch experiment.");
    }
  }

  async function simulateExperiment(experimentId: string) {
    try {
      await requestJson<{ ok: boolean }>(`/api/experiments/${experimentId}/simulate`, {
        method: "POST",
      });
      setMessage("Simulation run completed.");
      await loadAllData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to simulate experiment.");
    }
  }

  async function runOptimizer(experimentId?: string) {
    setIsOptimizing(true);
    try {
      const payload = experimentId ? { experimentId } : {};
      await requestJson<{ optimizedExperimentCount: number }>("/api/optimizer/run", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage("Optimizer completed and allocations updated.");
      await loadAllData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to run optimizer.");
    } finally {
      setIsOptimizing(false);
    }
  }

  async function runBootstrap() {
    try {
      await requestJson<{ ok: boolean }>("/api/bootstrap", { method: "POST", body: JSON.stringify({}) });
      setMessage("Demo data ensured.");
      await loadAllData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to seed demo data.");
    }
  }

  async function generateImage(conceptId: string) {
    setGeneratingImages((prev) => ({ ...prev, [conceptId]: true }));
    try {
      const result = await requestJson<{ imageUrl: string }>(`/api/concepts/${conceptId}/image`, {
        method: "POST",
        body: JSON.stringify({ brandStyle: selectedBrandStyle }),
      });
      setConceptImages((prev) => ({ ...prev, [conceptId]: result.imageUrl }));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Image generation failed.");
    } finally {
      setGeneratingImages((prev) => ({ ...prev, [conceptId]: false }));
    }
  }

  async function logout() {
    await requestJson<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    window.location.href = "/login";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 text-zinc-100 md:px-6">
      <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">AdLab AI</h1>
            <p className="text-sm text-zinc-400">
              Workspace: <span className="text-zinc-200">{initialWorkspace.name}</span> · {initialUser.fullName}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runBootstrap()}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
            >
              Seed demo data
            </button>
            <button
              type="button"
              onClick={() => void runOptimizer()}
              disabled={isOptimizing}
              className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {isOptimizing ? "Optimizing..." : "Run optimizer"}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
            >
              Logout
            </button>
          </div>
        </div>

        {statusMessage ? <p className="mt-4 rounded-lg bg-emerald-900/30 px-3 py-2 text-sm text-emerald-200">{statusMessage}</p> : null}
        {errorMessage ? <p className="mt-4 rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-200">{errorMessage}</p> : null}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={formatCurrency(dashboard?.totals.revenue ?? 0)} />
        <KpiCard label="Spend" value={formatCurrency(dashboard?.totals.spend ?? 0)} />
        <KpiCard label="ROAS" value={`${(dashboard?.totals.roas ?? 0).toFixed(2)}x`} />
        <KpiCard label="CPA" value={formatCurrency(dashboard?.totals.cpa ?? 0)} />
        <KpiCard label="Conversions" value={`${dashboard?.totals.conversions ?? 0}`} />
        <KpiCard label="CTR" value={`${((dashboard?.totals.ctr ?? 0) * 100).toFixed(2)}%`} />
        <KpiCard label="Concepts" value={`${dashboard?.conceptCount ?? 0}`} />
        <KpiCard label="Experiments" value={`${dashboard?.experimentCount ?? 0}`} />
      </section>

      {/* Agent Command Center */}
      <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-transparent to-fuchsia-500/5 p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xl">🤖</span>
          <div>
            <h2 className="text-lg font-bold">Agent Command Center</h2>
            <p className="text-xs text-zinc-500">Autonomous AI agents that do the research, strategy, and execution for you.</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <AutoCampaignAgent onComplete={() => { setMessage("Auto-campaign complete! Scroll down to see your concepts."); void loadAllData(); }} />
          <BrandIntelAgent />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <AudienceGenerator onGenerated={(persona) => {
            setAudienceForm({ name: persona.name, painPoints: persona.painPoints, desires: persona.desires, notes: persona.notes ?? "" });
            setMessage("Audience persona generated! Review and save below.");
          }} />
          <CompetitorAnalysis />
          <FatigueCheck />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <form className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5" onSubmit={createProduct}>
          <h2 className="text-lg font-semibold">Add product</h2>
          <Input label="Name" value={productForm.name} onChange={(value) => setProductForm((previous) => ({ ...previous, name: value }))} />
          <TextArea
            label="Description"
            value={productForm.description}
            onChange={(value) => setProductForm((previous) => ({ ...previous, description: value }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Price (USD)"
              value={productForm.price}
              onChange={(value) => setProductForm((previous) => ({ ...previous, price: value }))}
            />
            <Input
              label="Margin %"
              value={productForm.marginPct}
              onChange={(value) => setProductForm((previous) => ({ ...previous, marginPct: value }))}
            />
          </div>
          <Input
            label="Landing URL"
            value={productForm.landingUrl}
            onChange={(value) => setProductForm((previous) => ({ ...previous, landingUrl: value }))}
          />
          <button type="submit" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white">
            Save product
          </button>
        </form>

        <form className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5" onSubmit={createAudience}>
          <h2 className="text-lg font-semibold">Add audience</h2>
          <Input label="Audience name" value={audienceForm.name} onChange={(value) => setAudienceForm((previous) => ({ ...previous, name: value }))} />
          <TextArea
            label="Pain points"
            value={audienceForm.painPoints}
            onChange={(value) => setAudienceForm((previous) => ({ ...previous, painPoints: value }))}
          />
          <TextArea
            label="Desires"
            value={audienceForm.desires}
            onChange={(value) => setAudienceForm((previous) => ({ ...previous, desires: value }))}
          />
          <TextArea
            label="Notes (optional)"
            value={audienceForm.notes}
            onChange={(value) => setAudienceForm((previous) => ({ ...previous, notes: value }))}
          />
          <button type="submit" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white">
            Save audience
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <form className="grid gap-3 lg:grid-cols-6" onSubmit={generateConcepts}>
          <h2 className="col-span-full text-lg font-semibold">Generate ad concepts</h2>

          <label className="space-y-1 lg:col-span-2">
            <span className="text-sm text-zinc-400">Product</span>
            <select
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={conceptForm.productId}
              onChange={(event) =>
                setConceptForm((previous) => ({
                  ...previous,
                  productId: event.target.value,
                }))
              }
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 lg:col-span-2">
            <span className="text-sm text-zinc-400">Audience</span>
            <select
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={conceptForm.audienceId}
              onChange={(event) =>
                setConceptForm((previous) => ({
                  ...previous,
                  audienceId: event.target.value,
                }))
              }
            >
              <option value="">Select audience</option>
              {audiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-zinc-400">Channel</span>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={conceptForm.channel}
              onChange={(event) =>
                setConceptForm((previous) => ({
                  ...previous,
                  channel: event.target.value as Channel,
                }))
              }
            >
              {channelOptions.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-zinc-400">Count</span>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={conceptForm.count}
              onChange={(event) =>
                setConceptForm((previous) => ({
                  ...previous,
                  count: event.target.value,
                }))
              }
            />
          </label>

          <label className="space-y-1 lg:col-span-5">
            <span className="text-sm text-zinc-400">Objective</span>
            <input
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={conceptForm.objective}
              onChange={(event) =>
                setConceptForm((previous) => ({
                  ...previous,
                  objective: event.target.value,
                }))
              }
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGenerating || products.length === 0 || audiences.length === 0}
              className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
          <span className="text-sm font-medium text-zinc-400">Brand Style:</span>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" name="brandStyle" value="pepsi-inspired" checked={selectedBrandStyle === "pepsi-inspired"} onChange={() => setSelectedBrandStyle("pepsi-inspired")} className="accent-blue-500" />
            <span className="text-sm text-blue-400">⚡ Pepsi — Electric Youth</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" name="brandStyle" value="hot-chicken" checked={selectedBrandStyle === "hot-chicken"} onChange={() => setSelectedBrandStyle("hot-chicken")} className="accent-orange-500" />
            <span className="text-sm text-orange-400">🍗 Hot Chicken — Streetfood</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="radio" name="brandStyle" value="coke-inspired" checked={selectedBrandStyle === "coke-inspired"} onChange={() => setSelectedBrandStyle("coke-inspired")} className="accent-red-500" />
            <span className="text-sm text-red-400">🔥 Coke — Authentic Moments</span>
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {concepts.map((concept) => {
            const selected = selectedConceptIds.includes(concept.id);
            const channelMismatch = concept.channel !== experimentForm.channel;
            const imageUrl = conceptImages[concept.id];
            const isImageGenerating = generatingImages[concept.id];
            return (
              <article
                key={concept.id}
                className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase text-zinc-500">
                      {concept.channel} · {concept.product.name} → {concept.audience.name}
                    </p>
                    <h3 className="text-base font-semibold">{concept.headline}</h3>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={channelMismatch}
                      onChange={() =>
                        setSelectedConceptIds((previous) => {
                          if (previous.includes(concept.id)) {
                            return previous.filter((item) => item !== concept.id);
                          }
                          return [...previous, concept.id];
                        })
                      }
                    />
                    Select
                  </label>
                </div>

                {imageUrl ? (
                  <div className="group relative overflow-hidden rounded-lg border border-zinc-700">
                    <img
                      src={imageUrl}
                      alt={concept.headline}
                      className="h-auto w-full object-cover"
                    />
                    <button
                      type="button"
                      disabled={isImageGenerating}
                      onClick={() => { setConceptImages((prev) => { const next = {...prev}; delete next[concept.id]; return next; }); void generateImage(concept.id); }}
                      className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-black/90"
                    >
                      {isImageGenerating ? "Regenerating…" : "🔄 Regenerate"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isImageGenerating}
                    onClick={() => void generateImage(concept.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-600 bg-zinc-900/50 px-4 py-6 text-sm text-zinc-400 transition-colors hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-60"
                  >
                    {isImageGenerating ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                        Generating with {selectedBrandStyle === "pepsi-inspired" ? "⚡ Pepsi" : "🔥 Coke"} style…
                      </>
                    ) : (
                      <>🎨 Generate Ad Image ({selectedBrandStyle === "pepsi-inspired" ? "⚡ Pepsi Style" : "🔥 Coke Style"})</>
                    )}
                  </button>
                )}

                <p className="text-sm text-zinc-300">{concept.hook}</p>
                <a href={`/app/concepts/${concept.id}`} className="inline-block text-[11px] text-cyan-500 transition hover:text-cyan-300">View full concept →</a>
                <p className="text-xs text-zinc-500">{concept.angle}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <StatChip label="Score" value={concept.score.toFixed(0)} />
                  <StatChip label="ROAS" value={concept.performance.roas.toFixed(2)} />
                  <StatChip label="CPA" value={formatCurrency(concept.performance.cpa)} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <form className="grid gap-3 lg:grid-cols-4" onSubmit={launchExperiment}>
          <h2 className="col-span-full text-lg font-semibold">Launch experiment</h2>
          <Input
            label="Experiment name"
            value={experimentForm.name}
            onChange={(value) => setExperimentForm((previous) => ({ ...previous, name: value }))}
          />
          <label className="space-y-1">
            <span className="text-sm text-zinc-400">Channel</span>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={experimentForm.channel}
              onChange={(event) =>
                setExperimentForm((previous) => ({
                  ...previous,
                  channel: event.target.value as Channel,
                }))
              }
            >
              {channelOptions.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Daily budget (USD)"
            value={experimentForm.dailyBudget}
            onChange={(value) => setExperimentForm((previous) => ({ ...previous, dailyBudget: value }))}
          />
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white"
            >
              Launch ({selectedVisibleConceptCount} selected)
            </button>
          </div>
        </form>

        <div className="grid gap-3">
          {experiments.map((experiment) => (
            <article key={experiment.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{experiment.name}</h3>
                  <p className="text-xs uppercase text-zinc-500">
                    {experiment.channel} · {experiment.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void simulateExperiment(experiment.id)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800"
                  >
                    Simulate day
                  </button>
                  <button
                    type="button"
                    onClick={() => void runOptimizer(experiment.id)}
                    className="rounded-lg border border-cyan-700 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-900/40"
                  >
                    Optimize
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-6">
                <StatChip label="Budget" value={formatCurrency(experiment.dailyBudget)} />
                <StatChip label="Spend" value={formatCurrency(experiment.summary.spend)} />
                <StatChip label="Revenue" value={formatCurrency(experiment.summary.revenue)} />
                <StatChip label="ROAS" value={`${experiment.summary.roas.toFixed(2)}x`} />
                <StatChip label="Conversions" value={`${experiment.summary.conversions}`} />
                <StatChip label="Concepts" value={`${experiment.conceptLinks.length}`} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="text-lg font-semibold">Top concepts</h2>
          {(dashboard?.topConcepts ?? []).map((concept) => (
            <div key={concept.conceptId} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="text-sm font-medium">{concept.headline}</p>
              <p className="text-xs text-zinc-500">{concept.angle}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <StatChip label="ROAS" value={`${concept.roas.toFixed(2)}x`} />
                <StatChip label="Spend" value={formatCurrency(concept.spend)} />
                <StatChip label="Revenue" value={formatCurrency(concept.revenue)} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="text-lg font-semibold">Optimizer log</h2>
          {(dashboard?.optimizationLogs ?? []).map((log) => (
            <div key={log.id} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="text-sm font-medium">
                {log.decision} · {log.concept.headline}
              </p>
              <p className="text-xs text-zinc-500">{log.experiment.name}</p>
              <p className="mt-1 text-sm text-zinc-300">{log.rationale}</p>
            </div>
          ))}
        </div>
      </section>

      {isLoading ? <p className="text-sm text-zinc-500">Refreshing data...</p> : null}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1">
      <p className="text-[10px] uppercase text-zinc-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <input
        required
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AutoCampaignAgent({ onComplete }: { onComplete: () => void }) {
  const [url, setUrl] = useState("");
  const [channel, setChannel] = useState("META");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ brand: { name: string; tagline: string }; concepts: { headline: string; score: number }[] } | null>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/auto-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, channel, conceptCount: 4 }),
      });
      const data = await res.json();
      if (data.success) { setResult(data); onComplete(); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🚀</span>
        <h3 className="text-[14px] font-semibold">Auto-Campaign Agent</h3>
      </div>
      <p className="text-[11px] text-zinc-500">Paste any website URL. The agent scrapes the brand, builds an audience, and generates a full campaign — autonomously.</p>
      <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="flex gap-2">
        <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="META">META</option>
          <option value="TIKTOK">TIKTOK</option>
          <option value="GOOGLE">GOOGLE</option>
        </select>
        <button type="button" onClick={run} disabled={loading || url.length < 10} className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">
          {loading ? "Agent working… (30-60s)" : "Launch Agent"}
        </button>
      </div>
      {result && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
          <p className="font-semibold text-emerald-300">✅ Campaign ready for {result.brand.name}</p>
          <p className="text-zinc-500">{result.brand.tagline}</p>
          <div className="mt-2 space-y-1">
            {result.concepts.map((c, i) => <p key={i} className="text-zinc-400">#{i + 1} (Score: {c.score}) {c.headline}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

function BrandIntelAgent() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    name: string; tagline: string; description: string;
    brandVoice: { tone: string; personality: string; vocabulary: string[] };
    visualIdentity: { primaryColors: string[]; style: string; mood: string };
    targetAudience: string; socialProof: string[];
  } | null>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/brand-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.profile) setResult(data.profile);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <h3 className="text-[14px] font-semibold">Brand Intelligence Agent</h3>
      </div>
      <p className="text-[11px] text-zinc-500">Paste a URL. The agent crawls the site and extracts brand voice, colors, products, audience, and positioning.</p>
      <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="https://competitor.com" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button type="button" onClick={run} disabled={loading || url.length < 10} className="w-full rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {loading ? "Scraping & analyzing…" : "Analyze Brand"}
      </button>
      {result && (
        <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
          <p className="font-semibold text-violet-300">{result.name}</p>
          <p className="text-zinc-400">{result.tagline}</p>
          <p className="text-zinc-500">{result.description}</p>
          <div className="flex gap-1">
            {result.visualIdentity.primaryColors.map((c, i) => (
              <span key={i} className="inline-block h-4 w-4 rounded border border-zinc-700" style={{ background: c }} title={c} />
            ))}
          </div>
          <p className="text-zinc-500"><span className="text-zinc-400">Voice:</span> {result.brandVoice.personality}</p>
          <p className="text-zinc-500"><span className="text-zinc-400">Audience:</span> {result.targetAudience}</p>
          <p className="text-zinc-500"><span className="text-zinc-400">Keywords:</span> {result.brandVoice.vocabulary.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

function FatigueCheck() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    fatigueDetected: boolean;
    overusedAngles?: { angle: string; count: number; risk: string }[];
    underexploredAngles?: string[];
    recommendations?: string[];
    freshConceptIdeas?: string[];
  } | null>(null);

  async function check() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/fatigue-check");
      const data = await res.json();
      setResult(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔋</span>
        <h3 className="text-[14px] font-semibold">Creative Fatigue Check</h3>
      </div>
      <p className="text-[11px] text-zinc-500">Analyzes your concept portfolio for repetitive angles and suggests fresh directions.</p>
      <button type="button" onClick={check} disabled={loading} className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">
        {loading ? "Checking…" : "Run Fatigue Check"}
      </button>
      {result && (
        <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
          <p className={`font-semibold ${result.fatigueDetected ? "text-amber-300" : "text-emerald-300"}`}>
            {result.fatigueDetected ? "⚠ Creative fatigue detected" : "✅ Portfolio looks fresh"}
          </p>
          {result.overusedAngles && result.overusedAngles.length > 0 && (
            <div>
              <p className="text-zinc-400">Overused angles:</p>
              {result.overusedAngles.map((a, i) => <p key={i} className="text-zinc-500">• {a.angle} ({a.count}x) — {a.risk}</p>)}
            </div>
          )}
          {result.freshConceptIdeas && (
            <div>
              <p className="text-zinc-400">Try these fresh ideas:</p>
              {result.freshConceptIdeas.map((idea, i) => <p key={i} className="text-emerald-400/70">💡 {idea}</p>)}
            </div>
          )}
          {result.recommendations && (
            <div>
              <p className="text-zinc-400">Recommendations:</p>
              {result.recommendations.map((r, i) => <p key={i} className="text-zinc-500">→ {r}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AudienceGenerator({ onGenerated }: { onGenerated: (persona: { name: string; painPoints: string; desires: string; notes: string }) => void }) {
  const [desc, setDesc] = useState("");
  const [market, setMarket] = useState("South Africa");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; painPoints: string; desires: string; notes: string } | null>(null);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/audience-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc, market }),
      });
      const data = await res.json();
      if (data.persona) {
        setResult(data.persona);
        onGenerated(data.persona);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">🧠</span>
        <h2 className="text-lg font-semibold">AI Audience Generator</h2>
      </div>
      <p className="text-xs text-zinc-500">Describe your target customer in plain English. GPT generates a full persona with pain points, desires, and cultural context.</p>
      <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder='e.g. "Young professionals who love spicy food and follow food TikTok"' value={desc} onChange={(e) => setDesc(e.target.value)} />
      <div className="flex gap-2">
        <input className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Market" value={market} onChange={(e) => setMarket(e.target.value)} />
        <button type="button" onClick={generate} disabled={loading || desc.length < 10} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">
          {loading ? "Generating…" : "Generate Persona"}
        </button>
      </div>
      {result && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
          <p className="font-semibold text-cyan-300">{result.name}</p>
          <p className="mt-1 text-zinc-500">Persona auto-filled in the audience form below. Review and save.</p>
        </div>
      )}
    </div>
  );
}

function CompetitorAnalysis() {
  const [competitor, setCompetitor] = useState("");
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("South Africa");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    competitorWeaknesses: string[];
    attackAngles: { angle: string; headline: string; hook: string; tone: string }[];
    differentiators: string[];
    avoidTopics: string[];
  } | null>(null);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitor, yourProduct: product, market }),
      });
      const data = await res.json();
      if (data.analysis) setResult(data.analysis);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent p-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚔️</span>
        <h2 className="text-lg font-semibold">Competitor Attack Angles</h2>
      </div>
      <p className="text-xs text-zinc-500">Name a competitor. GPT identifies their weaknesses and generates ad angles to steal their market share.</p>
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Competitor (e.g. KFC)" value={competitor} onChange={(e) => setCompetitor(e.target.value)} />
        <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Your product (e.g. Crumbed)" value={product} onChange={(e) => setProduct(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <input className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Market" value={market} onChange={(e) => setMarket(e.target.value)} />
        <button type="button" onClick={analyze} disabled={loading || competitor.length < 2 || product.length < 2} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">
          {loading ? "Analyzing…" : "Find Weaknesses"}
        </button>
      </div>
      {result && (
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
          <div>
            <p className="font-semibold text-orange-300">Weaknesses to Exploit</p>
            <ul className="mt-1 space-y-1">{result.competitorWeaknesses.map((w, i) => <li key={i} className="text-zinc-400">• {w}</li>)}</ul>
          </div>
          <div>
            <p className="font-semibold text-orange-300">Attack Angles</p>
            {result.attackAngles.map((a, i) => (
              <div key={i} className="mt-2 rounded border border-zinc-800 bg-zinc-900/50 p-2">
                <p className="font-medium text-zinc-200">{a.headline}</p>
                <p className="text-zinc-500">{a.hook}</p>
                <p className="mt-0.5 text-zinc-600">Tone: {a.tone}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="font-semibold text-red-400">Avoid These Topics</p>
            <ul className="mt-1 space-y-1">{result.avoidTopics.map((t, i) => <li key={i} className="text-zinc-500">⚠ {t}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <textarea
        required
        rows={3}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
