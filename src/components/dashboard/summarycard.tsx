export default function Card({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  color: string;
}) {
  const c: Record<string, string> = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    indigo: "text-indigo-400",
    slate: "text-slate-300",
  };
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-3 sm:p-4">
      <div className="mb-1.5 truncate text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:mb-2">
        {title}
      </div>
      <div
        className={`truncate font-mono text-sm font-semibold sm:text-lg ${c[color] ?? "text-white"}`}
      >
        {value}
      </div>
      <div className="mt-1 truncate text-[10px] text-slate-600">{sub}</div>
    </div>
  );
}
