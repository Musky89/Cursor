"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, EmptyState, PageHeader, useToast } from "@/components/ui";

type Client = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  _count: { brands: number };
  brands: { id: string; name: string; industry: string | null }[];
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", industry: "", website: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data.clients ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function create() {
    setLoading(true);
    await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowCreate(false);
    setForm({ name: "", industry: "", website: "", notes: "" });
    await load();
    setLoading(false);
    addToast("Client added");
  }

  return (
    <div className="p-6 text-zinc-100">
      <PageHeader title="Clients" description="Your client portfolio. Click a client to manage their brands." actions={<Button onClick={() => setShowCreate(!showCreate)}>+ New Client</Button>} />

      {showCreate && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 animate-fade-in">
          <h3 className="mb-3 text-[14px] font-semibold">Add Client</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Client name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Industry (e.g. Food & Beverage)" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <Button onClick={() => void create()} disabled={loading || form.name.length < 2} loading={loading} className="mt-3">Add Client</Button>
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState icon="🏢" title="No clients yet" description="Add your first client to start managing their brands and campaigns." action={<Button onClick={() => setShowCreate(true)}>Add Client</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <a key={c.id} href={`/app/clients/${c.id}`} className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-600 hover:bg-zinc-900/60">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 text-xl font-bold text-cyan-300">
                  {c.name.charAt(0)}
                </div>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{c._count.brands} brand{c._count.brands !== 1 ? "s" : ""}</span>
              </div>
              <h3 className="mt-3 text-[16px] font-semibold group-hover:text-white">{c.name}</h3>
              {c.industry && <p className="mt-0.5 text-[12px] text-zinc-500">{c.industry}</p>}
              {c.brands.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.brands.map((b) => (
                    <span key={b.id} className="rounded-md bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">{b.name}</span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
