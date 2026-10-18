import { STATUSES } from "@/lib/contract";

const styles = [
  "bg-accent text-accent-foreground",
  "bg-warning/15 text-warning-foreground",
  "bg-info/15 text-info",
  "bg-success/15 text-success",
];

export function StatusBadge({ status }: { status: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUSES[status]}
    </span>
  );
}
