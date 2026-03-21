const clsMap: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-zinc-100 text-zinc-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  UNVERIFIED: "bg-orange-100 text-orange-700",
  INACTIVE: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-100 text-red-700",
  ALUMNI: "bg-indigo-100 text-indigo-700",
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-amber-100 text-amber-700",
  PAST: "bg-zinc-100 text-zinc-700",
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${clsMap[status] || "bg-slate-100 text-slate-700"}`}
    >
      {status}
    </span>
  );
}
