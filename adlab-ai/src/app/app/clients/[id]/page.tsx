"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, PageHeader, EmptyState, Badge, useToast } from "@/components/ui";

type Brand = { id: string; name: string; industry: string | null; strategy: { status: string; lockedTerritory: string | null } | null; _count: { quickAssets: number; logoDesigns: number; briefs: number } };
type ClientData = { id: string; name: string; industry: string | null; website: string | null };

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientData | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", website: "", industry: "" });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch(`/api/clients/${id}/brands`);
    const data = await res.json();
    setClient(data.client);
    setBrands(data.brands ?? []);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function createBrand() {
    setLoading(true);
    await fetch(`/api/clients/${id}/brands`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowCreate(false);
    setForm({ name: "", description: "", website: "", industry: "" });
    await load();
    setLoading(false);
    addToast("Brand created");
  }

  if (!client) return <div className="p-6 text-zinc-500">Loading...</div>;

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href="/app/clients" className="hover:text-white">Clients</Link>
        <span>/</span>
        <span className="text-zinc-300">{client.name}</span>
      </div>

      <PageHeader title={client.name} description={client.industry ?? undefined} actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.location.href = `/app/clients/${id}/blueprint`}>⚙️ Service Blueprint</Button>
          <Button onClick={() => setShowCreate(!showCreate)}>+ New Brand</Button>
        </div>
      } />

      {showCreate && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 animate-fade-in">
          <h3 className="mb-3 text-[14px] font-semibold">Add Brand</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Brand name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Button onClick={() => void createBrand()} disabled={loading || form.name.length < 2} loading={loading} className="mt-3">Create Brand</Button>
        </div>
      )}

      {brands.length === 0 ? (
        <EmptyState icon="🏷️" title="No brands yet" description={`Add the first brand under ${client.name}.`} action={<Button onClick={() => setShowCreate(true)}>Add Brand</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <a key={b.id} href={`/app/brands/${b.id}`} className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-600">
              <h3 className="text-[16px] font-semibold group-hover:text-white">{b.name}</h3>
              {b.industry && <p className="mt-0.5 text-[12px] text-zinc-500">{b.industry}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={b.strategy?.status === "locked" ? "success" : "default"}>{b.strategy?.status === "locked" ? "Strategy locked" : "No strategy"}</Badge>
                <Badge>{b._count.quickAssets} assets</Badge>
                <Badge>{b._count.logoDesigns} logos</Badge>
                <Badge>{b._count.briefs} briefs</Badge>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
