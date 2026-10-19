import { createFileRoute } from "@tanstack/react-router";
import { Factory, Warehouse, Truck, PackageCheck, ArrowRight, ShieldCheck, Eye, Lock, Link2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ChainTrack · Blockchain Supply Chain Project" },
      { name: "description", content: "How ChainTrack uses Ethereum smart contracts for transparent, tamper-resistant product tracking." },
      { property: "og:title", content: "About ChainTrack" },
      { property: "og:description", content: "Blockchain-based product tracking academic project." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

const steps = [
  { icon: Factory, label: "Manufactured" },
  { icon: Warehouse, label: "In Warehouse" },
  { icon: Truck, label: "Shipped" },
  { icon: PackageCheck, label: "Delivered" },
];

const setup = [
  ["Install & start blockchain", "cd blockchain && npm install && npx hardhat node"],
  ["Deploy contract (new terminal)", "cd blockchain && npm run deploy"],
  ["Start the web app", "npm install && npm run dev"],
  ["MetaMask network", "RPC http://127.0.0.1:8545 · Chain ID 31337 · Symbol ETH"],
  ["Import account", "Paste Account #0 private key printed by `npx hardhat node` (owner)"],
];

function About() {
  return (
    <AppShell title="About Project" subtitle="ChainTrack – Blockchain-Based Product Tracking System">
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Transparent supply chains, secured by Ethereum</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          ChainTrack registers products in a Solidity smart contract and records every movement as a blockchain event.
          Anyone can verify a product's journey, but only authorized wallets can write to it — and nothing can be edited after the fact.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {steps.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border bg-muted px-4 py-3 text-sm font-medium"><Icon className="h-4 w-4 text-primary" />{label}</div>
              {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Lock, t: "Tamper-resistant", d: "Data lives in contract storage; past blocks can't be rewritten. Status can only move forward." },
          { icon: Eye, t: "Transparent", d: "Every change emits an event with tx hash and timestamp that anyone can audit." },
          { icon: ShieldCheck, t: "Access control", d: "Only the owner registers products; owner-approved wallets update statuses (msg.sender checks)." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="card p-6"><Icon className="h-5 w-5 text-primary" /><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h3 className="font-semibold">Objectives</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Register products on-chain with unique IDs</li>
            <li>Enforce sequential supply chain stages in the smart contract</li>
            <li>Provide public, wallet-free product verification</li>
            <li>Derive all dashboard statistics from blockchain data</li>
          </ul>
          <h3 className="mt-6 font-semibold">Technologies</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Solidity 0.8.24", "Hardhat", "Ethers.js v6", "MetaMask", "React 19", "TanStack Router", "Tailwind CSS v4", "Lucide"].map((t) => (
              <span key={t} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{t}</span>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold"><Link2 className="h-4 w-4" /> Local setup</h3>
          <ol className="mt-3 space-y-3 text-sm">
            {setup.map(([t, c], i) => (
              <li key={t}><p className="font-medium">{i + 1}. {t}</p><code className="mt-1 block rounded-md bg-navy px-3 py-2 font-mono text-xs text-navy-foreground">{c}</code></li>
            ))}
          </ol>
          <p className="mt-4 rounded-md bg-destructive/10 p-3 text-xs text-destructive">Hardhat development keys are public. Never use them with real funds or on public networks.</p>
        </section>
      </div>
    </AppShell>
  );
}
