import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Factory, Warehouse, Truck, PackageCheck, PackagePlus, Search, Activity, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useChainData } from "@/lib/use-chain-data";
import { useBlockchain } from "@/lib/blockchain-context";
import { STATUSES, CONTRACT_ADDRESS, CHAIN_ID } from "@/lib/contract";
import { fmtTime, shortAddr } from "@/lib/blockchain";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · ChainTrack" },
      { name: "description", content: "Live supply chain statistics read directly from the ChainTrack Ethereum smart contract." },
      { property: "og:title", content: "ChainTrack Dashboard" },
      { property: "og:description", content: "Blockchain-based product tracking dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const barColors = ["bg-primary", "bg-warning", "bg-info", "bg-success"];

function Dashboard() {
  const { products, history, loading } = useChainData();
  const { account, isOwner, canUpdate, chainId } = useBlockchain();
  const counts = [0, 1, 2, 3].map((s) => products.filter((p) => p.status === s).length);
  const total = products.length;
  const recentRegs = [...products].sort((a, b) => b.registeredAt - a.registeredAt).slice(0, 5);
  const recentUpdates = history.filter((h) => h.type === "updated").reverse().slice(0, 5);

  return (
    <AppShell title="Dashboard" subtitle="All figures are read live from the blockchain">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Products" value={total} icon={Boxes} tone="bg-navy text-navy-foreground" loading={loading} />
        <StatCard label="Manufactured" value={counts[0]} icon={Factory} tone="bg-accent text-accent-foreground" loading={loading} />
        <StatCard label="In Warehouse" value={counts[1]} icon={Warehouse} tone="bg-warning/15 text-warning-foreground" loading={loading} />
        <StatCard label="Shipped" value={counts[2]} icon={Truck} tone="bg-info/15 text-info" loading={loading} />
        <StatCard label="Delivered" value={counts[3]} icon={PackageCheck} tone="bg-success/15 text-success" loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-semibold">Status distribution</h2>
          <div className="mt-6 space-y-4">
            {STATUSES.map((s, i) => {
              const pct = total ? Math.round((counts[i] / total) * 100) : 0;
              return (
                <div key={s}>
                  <div className="mb-1.5 flex justify-between text-sm"><span>{s}</span><span className="text-muted-foreground">{counts[i]} · {pct}%</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${barColors[i]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4" /> Wallet</h2>
          {account ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Address</dt><dd className="font-mono">{shortAddr(account)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Chain ID</dt><dd>{chainId}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Role</dt><dd>{isOwner ? "Owner" : canUpdate ? "Authorized" : "Viewer"}</dd></div>
            </dl>
          ) : <p className="text-sm text-muted-foreground">Not connected. Tracking still works read-only.</p>}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>Contract</p><p className="mt-1 break-all font-mono">{CONTRACT_ADDRESS || "not deployed"}</p>
            <p className="mt-1">Expected chain {CHAIN_ID}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t pt-4">
            <Link to="/add-product" className="btn btn-primary"><PackagePlus className="h-4 w-4" /> Add</Link>
            <Link to="/track" className="btn btn-outline"><Search className="h-4 w-4" /> Track</Link>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="border-b px-6 py-4 font-semibold">Recent registrations</h2>
          {loading ? <Skel /> : recentRegs.length === 0 ? (
            <EmptyState icon={Boxes} title="No products yet" text="Register your first product to see it here." />
          ) : (
            <ul className="divide-y">
              {recentRegs.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.id} · {fmtTime(p.registeredAt)}</p></div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="border-b px-6 py-4 font-semibold">Recent status updates</h2>
          {loading ? <Skel /> : recentUpdates.length === 0 ? (
            <EmptyState icon={Activity} title="No updates yet" text="Status changes recorded as blockchain events appear here." />
          ) : (
            <ul className="divide-y">
              {recentUpdates.map((h) => (
                <li key={h.txHash} className="flex items-center justify-between gap-3 px-6 py-3">
                  <div className="min-w-0"><p className="truncate font-medium">{h.productId}</p><p className="truncate font-mono text-xs text-muted-foreground">{shortAddr(h.txHash)} · {fmtTime(h.timestamp)}</p></div>
                  <StatusBadge status={h.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Skel() {
  return <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-10" />)}</div>;
}
