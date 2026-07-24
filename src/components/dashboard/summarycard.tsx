export default function Card({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  const c: Record<string, string> = {
    emerald: "text-emerald-400", rose: "text-rose-400",
    indigo: "text-indigo-400", slate: "text-slate-300",
  };
  return (
    <div className="bg-[#161b22] border border-white/[0.07] rounded-xl p-4">
      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-2">{title}</div>
      <div className={`text-lg font-mono font-semibold ${c[color] ?? "text-white"}`}>{value}</div>
      <div className="text-[10px] text-slate-600 mt-1">{sub}</div>
    </div>
  );
}