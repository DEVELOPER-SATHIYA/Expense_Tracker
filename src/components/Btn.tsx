export default function Btn({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const v = {
    primary: "bg-[#161b22] hover:bg-[#161b22]/90 text-white",
    ghost:
      "bg-white/6 hover:bg-white/10 text-slate-300 hover:text-white border border-white/8",
    danger:
      "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300",
  }[variant];
  return (
    <button
      {...props}
      className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors flex items-center gap-1.5 ${v} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}