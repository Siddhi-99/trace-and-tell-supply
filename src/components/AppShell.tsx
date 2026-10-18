import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, PackagePlus, Boxes, Search, Info, Menu, X, Link2 } from "lucide-react";
import { WalletConnect } from "./WalletConnect";
import { NetworkBanner } from "./NetworkBanner";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-product", label: "Add Product", icon: PackagePlus },
  { to: "/products", label: "Manage Products", icon: Boxes },
  { to: "/track", label: "Track Product", icon: Search },
  { to: "/about", label: "About Project", icon: Info },
] as const;

function NavLinks({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-1">
      {nav.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link key={to} to={to} onClick={onNav}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-navy-foreground/70 hover:bg-navy-muted hover:text-navy-foreground"}`}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Link2 className="h-5 w-5" /></span>
      <span>
        <span className="block text-base font-semibold text-navy-foreground">ChainTrack</span>
        <span className="block text-[11px] text-navy-foreground/50">Supply chain on Ethereum</span>
      </span>
    </Link>
  );
}

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-8 bg-navy p-4 lg:flex">
        <div className="pt-2"><Brand /></div>
        <NavLinks />
        <p className="mt-auto px-2 text-[11px] text-navy-foreground/40">Hardhat local · chain 31337</p>
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col gap-8 bg-navy p-4">
            <div className="flex items-center justify-between pt-2"><Brand />
              <button onClick={() => setOpen(false)} className="text-navy-foreground" aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            <NavLinks onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-8">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>}
        </div>
        <WalletConnect />
      </header>
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
        <NetworkBanner />
        {children}
      </main>
    </div>
  );
}
