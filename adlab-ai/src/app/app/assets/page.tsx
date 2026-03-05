"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Asset = {
  id: string;
  type: string;
  name: string;
  description: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("product_photo");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/brand-assets");
    const data = await res.json();
    setAssets(data.assets ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file || !uploadName) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", uploadName);
    formData.append("type", uploadType);

    await fetch("/api/brand-assets", { method: "POST", body: formData });
    setUploadName("");
    if (fileRef.current) fileRef.current.value = "";
    await load();
    setUploading(false);
  }

  const typeLabels: Record<string, string> = {
    product_photo: "Product Photo",
    logo: "Logo",
    brand_guide: "Brand Guide",
    reference: "Reference Image",
  };

  const typeColors: Record<string, string> = {
    product_photo: "bg-cyan-500/20 text-cyan-300",
    logo: "bg-fuchsia-500/20 text-fuchsia-300",
    brand_guide: "bg-amber-500/20 text-amber-300",
    reference: "bg-emerald-500/20 text-emerald-300",
  };

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Brand Assets</h1>
        <p className="text-[13px] text-zinc-500">Upload product photos, logos, and brand guidelines. These are used as reference images for AI generation.</p>
      </div>

      {/* Upload Area */}
      <div className="mb-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-6">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Asset name"
            value={uploadName}
            onChange={(e) => setUploadName(e.target.value)}
          />
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
          >
            <option value="product_photo">Product Photo</option>
            <option value="logo">Logo</option>
            <option value="brand_guide">Brand Guide</option>
            <option value="reference">Reference Image</option>
          </select>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-xs file:text-zinc-300"
          />
          <button
            onClick={() => void upload()}
            disabled={uploading || !uploadName}
            className="rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-zinc-950 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Asset"}
          </button>
        </div>
      </div>

      {/* Asset Grid */}
      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
          <span className="text-4xl">🎨</span>
          <p className="mt-3 text-[15px] font-medium text-zinc-400">No brand assets yet</p>
          <p className="text-[13px] text-zinc-600">Upload product photos and logos so the AI can reference your actual brand.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {assets.map((a) => (
            <div key={a.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
              <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-zinc-800/50">
                <span className="text-3xl text-zinc-600">
                  {a.type === "product_photo" ? "📦" : a.type === "logo" ? "🏷️" : a.type === "brand_guide" ? "📋" : "🖼️"}
                </span>
              </div>
              <h3 className="text-[13px] font-medium">{a.name}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[a.type] ?? "bg-zinc-500/20 text-zinc-400"}`}>
                  {typeLabels[a.type] ?? a.type}
                </span>
                <span className="text-[10px] text-zinc-600">{a.mimeType}</span>
              </div>
              <p className="mt-1 text-[10px] text-zinc-600">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
