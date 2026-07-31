import { useMemo, useState } from "react";
import { AlertTriangle, Droplets, TrendingDown, TrendingUp } from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import LoadingScreen from "./LoadingScreen";
import PC from "../theme/pc";

export default function LeakReport() {
  const { transactions, loading, error } = useTransactions();
  const { categories } = useCategories();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  const prevMonth = useMemo(() => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [selectedMonth]);

  const monthTxs = useMemo(
    () =>
      transactions.filter((t) => t.transaction_date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  const prevTxs = useMemo(
    () => transactions.filter((t) => t.transaction_date.startsWith(prevMonth)),
    [transactions, prevMonth]
  );

  const monthExpense = useMemo(
    () =>
      monthTxs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount), 0),
    [monthTxs]
  );

  const monthIncome = useMemo(
    () =>
      monthTxs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount), 0),
    [monthTxs]
  );

  const prevExpense = useMemo(
    () =>
      prevTxs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount), 0),
    [prevTxs]
  );

  const categoryLeaks = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category_id] = (map[t.category_id] ?? 0) + Number(t.amount);
      });

    return Object.entries(map)
      .map(([id, amount]) => ({
        id,
        name: categories.find((c) => c.id === id)?.name ?? "Other",
        amount,
        share: monthExpense > 0 ? (amount / monthExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTxs, categories, monthExpense]);

  const paymentLeaks = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const method = t.payment_method?.trim() || "Other";
        map[method] = (map[method] ?? 0) + Number(t.amount);
      });

    return Object.entries(map)
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTxs]);

  const expenseChange =
    prevExpense === 0
      ? monthExpense > 0
        ? 100
        : 0
      : ((monthExpense - prevExpense) / prevExpense) * 100;

  const burnRate =
    monthIncome > 0 ? (monthExpense / monthIncome) * 100 : monthExpense > 0 ? 100 : 0;

  const biggestLeak = categoryLeaks[0];

  if (loading) return <LoadingScreen />;
  if (error) return <p className="p-5 text-rose-400">{error}</p>;

  return (
    <div className="safe-px mx-auto max-w-7xl space-y-4 p-3 sm:space-y-5 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-white sm:text-2xl">
            Leak Report
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            See where your money is draining this month.
          </p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#161b22] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 sm:w-auto"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Total Leaked</p>
            <Droplets className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 truncate text-lg font-bold text-rose-400 sm:text-2xl">
            {fmt(monthExpense)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Expense this month</p>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">vs Last Month</p>
            {expenseChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-rose-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <p
            className={`mt-2 text-lg font-bold sm:text-2xl ${
              expenseChange >= 0 ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {expenseChange >= 0 ? "+" : ""}
            {expenseChange.toFixed(1)}%
          </p>
          <p className="mt-1 truncate text-[11px] text-slate-500">
            Prev: {fmt(prevExpense)}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Burn Rate</p>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-lg font-bold text-amber-300 sm:text-2xl">
            {burnRate.toFixed(0)}%
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Of income spent this month
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-3 sm:p-4">
          <p className="text-xs text-slate-400">Biggest Leak</p>
          <p className="mt-2 truncate text-base font-bold text-white sm:text-lg">
            {biggestLeak?.name ?? "—"}
          </p>
          <p className="mt-1 truncate text-[11px] text-rose-400">
            {biggestLeak ? fmt(biggestLeak.amount) : "No expenses"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-4">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
            Top Category Leaks
          </h3>
          {categoryLeaks.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-600">
              No expense leaks this month.
            </p>
          ) : (
            <div className="space-y-3">
              {categoryLeaks.slice(0, 8).map((item, i) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: PC[i % PC.length] }}
                      />
                      <span className="truncate text-xs text-slate-300">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-[10px] text-slate-500">
                        {item.share.toFixed(0)}%
                      </span>
                      <span className="font-mono text-xs text-rose-400">
                        {fmt(item.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(item.share, 100)}%`,
                        background: PC[i % PC.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-4">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
            Leaks by Payment Method
          </h3>
          {paymentLeaks.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-600">
              No payment data this month.
            </p>
          ) : (
            <div className="space-y-2.5">
              {paymentLeaks.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="text-xs text-slate-300">{item.method}</span>
                  <span className="font-mono text-xs text-rose-400">
                    {fmt(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {biggestLeak && (
        <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-300/80">
            Insight
          </p>
          <p className="mt-2 text-sm text-slate-200 sm:text-base">
            Your biggest money leak this month is{" "}
            <span className="font-semibold text-white">{biggestLeak.name}</span>{" "}
            at{" "}
            <span className="font-semibold text-rose-400">
              {fmt(biggestLeak.amount)}
            </span>{" "}
            ({biggestLeak.share.toFixed(0)}% of expenses).
            {expenseChange > 10 &&
              ` Spending is up ${expenseChange.toFixed(0)}% vs last month — worth a closer look.`}
            {expenseChange < -10 &&
              ` Nice work — spending is down ${Math.abs(expenseChange).toFixed(0)}% vs last month.`}
          </p>
        </div>
      )}
    </div>
  );
}
