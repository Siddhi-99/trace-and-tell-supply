import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Eye, ArrowRight, Boxes, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmTxDialog } from "@/components/ConfirmTxDialog";
import { useChainData } from "@/lib/use-chain-data";
import { useBlockchain } from "@/lib/blockchain-context";
import { useTx } from "@/lib/use-tx";
import { STATUSES } from "@/lib/contract";
import { fmtTime, type Product } from "@/lib/blockchain";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Manage Products · ChainTrack" },
      { name: "description", content: "Search, filter and advance on-chain products through the supply chain." },
      { property: "og:title", content: "Manage Products · ChainTrack" },
      { property: "og:description", content: "Manage blockchain-registered products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ManageProducts,
});

function ManageProducts() {
  const { products, loading, error } = useChainData();
  const { canUpdate } = useBlockchain();
  const { send, pending } = useTx();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<Product | null>(null);

  const list = products.filter((p) =>
    (status === "all" || p.status === Number(status)) &&
    (p.id.toLowerCase().includes(q.toLowerCase()) || p.name.toLowerCase().includes(q.toLowerCase())));

  async function advance() {
    if (!target) return;
    await send(`Move ${target.id} to ${STATUSES[target.status + 1]}`, (c) => c.updateProductStatus(target.id, target.status + 1));
    setTarget(null);
  }

  return (
    <AppShell title="Manage Products" subtitle="Advance products one stage at a time">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="field pl-9" placeholder="Search by product ID or name" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="field sm:w-52" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s, i) => <option key={s} value={i}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : list.length === 0 ? (
          <EmptyState icon={Boxes} title={products.length ? "No matching products" : "No products registered"}
            text={error ?? (products.length ? "Try a different search or filter." : "Products you register on-chain will show here.")}
            action={!products.length && <Link to="/add-product" className="btn btn-primary">Add Product</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>{["Product ID", "Name", "Manufacturer", "Category", "Mfg Date", "Status", "Registered", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {list.map((p) => (
                  <tr key={p.id} className="transition hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.manufacturer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.manufacturingDate}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmtTime(p.registeredAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to="/track" search={{ id: p.id }} className="btn btn-outline px-2.5 py-1.5" title="View details"><Eye className="h-4 w-4" /></Link>
                        {p.status < 3 ? (
                          <button disabled={!canUpdate || pending} onClick={() => setTarget(p)} className="btn btn-primary px-2.5 py-1.5 text-xs"
                            title={canUpdate ? "" : "Connect an authorized wallet"}>
                            {pending && target?.id === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            {STATUSES[p.status + 1]}
                          </button>
                        ) : <span className="px-2 py-1.5 text-xs text-success">Complete</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!canUpdate && products.length > 0 && <p className="text-xs text-muted-foreground">Connect the owner or an authorized wallet to update statuses.</p>}

      <ConfirmTxDialog open={!!target && !pending} onOpenChange={(o) => !o && setTarget(null)} title="Update product status?" onConfirm={advance}
        description={target && <>Move <b className="font-mono">{target.id}</b> from <b>{STATUSES[target.status]}</b> to <b>{STATUSES[target.status + 1]}</b>. This cannot be undone.</>} />
    </AppShell>
  );
}
