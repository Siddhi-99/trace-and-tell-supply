import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, PackageSearch, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { EmptyState } from "@/components/EmptyState";
import { fetchHistory, fetchProduct, friendlyError, fmtTime, shortAddr, type HistoryEntry, type Product } from "@/lib/blockchain";
import { STATUSES } from "@/lib/contract";
import { useBlockchain } from "@/lib/blockchain-context";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({
    meta: [
      { title: "Track Product · ChainTrack" },
      { name: "description", content: "Publicly verify a product's full supply chain history on the blockchain. No wallet needed." },
      { property: "og:title", content: "Track a Product · ChainTrack" },
      { property: "og:description", content: "Tamper-proof product tracking timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackProduct,
});

function TrackProduct() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: "/track" });
  const { refreshKey } = useBlockchain();
  const [input, setInput] = useState(id ?? "");
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "found" | "missing" | "error">("idle");
  const [err, setErr] = useState("");

  // Read-only lookup via JSON-RPC provider (no MetaMask needed).
  useEffect(() => {
    if (!id) return setState("idle");
    setInput(id);
    setState("loading");
    Promise.all([fetchProduct(id), fetchHistory(id)])
      .then(([p, h]) => {
        setProduct(p);
        setHistory(h);
        setState(p ? "found" : "missing");
      })
      .catch((e) => { setErr(friendlyError(e)); setState("error"); });
  }, [id, refreshKey]);

  return (
    <AppShell title="Track Product" subtitle="Public, read-only verification — no wallet required">
      <form className="card flex flex-col gap-3 p-4 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (input.trim()) navigate({ search: { id: input.trim() } }); }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="field pl-9 font-mono" placeholder="Enter Product ID, e.g. PRD-1001" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={state === "loading"}>
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track
        </button>
      </form>

      {state === "idle" && <div className="card"><EmptyState icon={PackageSearch} title="Track any product" text="Enter a product ID to see its verified journey through the supply chain." /></div>}
      {state === "loading" && <div className="grid gap-6 lg:grid-cols-5"><div className="skeleton h-72 lg:col-span-2" /><div className="skeleton h-72 lg:col-span-3" /></div>}
      {state === "missing" && <div className="card"><EmptyState icon={PackageSearch} title="Product not found" text={`No product with ID "${id}" exists on the blockchain.`} /></div>}
      {state === "error" && <div className="card"><EmptyState icon={PackageSearch} title="Couldn't load product" text={err} /></div>}

      {state === "found" && product && (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="card p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-mono text-xs text-muted-foreground">{product.id}</p><h2 className="mt-1 text-xl font-semibold">{product.name}</h2></div>
              <StatusBadge status={product.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>
            <dl className="mt-6 space-y-3 border-t pt-4 text-sm">
              {[
                ["Manufacturer", product.manufacturer],
                ["Category", product.category],
                ["Manufacturing date", product.manufacturingDate],
                ["Current status", STATUSES[product.status]],
                ["Registered", fmtTime(product.registeredAt)],
                ["Last updated", fmtTime(product.updatedAt)],
                ["Registered by", shortAddr(product.registeredBy)],
              ].map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
            </dl>
          </section>
          <section className="card p-6 lg:col-span-3">
            <h2 className="mb-6 font-semibold">Blockchain tracking timeline</h2>
            <TrackingTimeline current={product.status} history={history} />
          </section>
          <section className="card overflow-hidden lg:col-span-5">
            <h2 className="border-b px-6 py-4 font-semibold">Transaction history</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Event", "Status", "Tx hash", "Block", "Timestamp"].map((h) => <th key={h} className="px-6 py-3 font-medium">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {history.map((h) => (
                    <tr key={h.txHash + h.status}>
                      <td className="px-6 py-3">{h.type === "registered" ? "ProductRegistered" : "ProductStatusUpdated"}</td>
                      <td className="px-6 py-3"><StatusBadge status={h.status} /></td>
                      <td className="max-w-[260px] truncate px-6 py-3 font-mono text-xs" title={h.txHash}>{h.txHash}</td>
                      <td className="px-6 py-3">#{h.blockNumber}</td>
                      <td className="px-6 py-3 text-muted-foreground">{fmtTime(h.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
