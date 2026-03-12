export function EmptyState({ title = "Không có dữ liệu" }: { title?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      {title}
    </div>
  );
}
