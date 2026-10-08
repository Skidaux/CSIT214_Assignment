import { cn } from "cn";

const colours: Record<string, string> = {
  available: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  reported: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  assigned: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  maintenance: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  closed: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize",
        colours[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
