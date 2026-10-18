import { Factory, Warehouse, Truck, PackageCheck, Check } from "lucide-react";
import { STATUSES } from "@/lib/contract";
import { fmtTime, shortAddr, type HistoryEntry } from "@/lib/blockchain";

const icons = [Factory, Warehouse, Truck, PackageCheck];

/** Vertical timeline: one row per stage, filled with the on-chain event if it happened. */
export function TrackingTimeline({ current, history }: { current: number; history: HistoryEntry[] }) {
  return (
    <ol className="relative">
      {STATUSES.map((label, i) => {
        const ev = history.find((h) => h.status === i);
        const done = i <= current;
        const Icon = icons[i];
        return (
          <li key={label} className="relative flex gap-4 pb-8 last:pb-0">
            {i < 3 && <span className={`absolute left-5 top-11 h-[calc(100%-2.75rem)] w-0.5 ${i < current ? "bg-success" : "bg-border"}`} />}
            <span className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 ${done ? "border-success bg-success text-success-foreground" : "border-border bg-card text-muted-foreground"}`}>
              {done ? (i === current ? <Icon className="h-4 w-4" /> : <Check className="h-4 w-4" />) : <Icon className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className={`font-medium ${done ? "" : "text-muted-foreground"}`}>{label}</p>
                {i === current && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Current</span>}
              </div>
              {ev ? (
                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <p>{fmtTime(ev.timestamp)} · by {shortAddr(ev.by)} · block #{ev.blockNumber}</p>
                  <p className="truncate font-mono" title={ev.txHash}>tx {ev.txHash}</p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Pending</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
