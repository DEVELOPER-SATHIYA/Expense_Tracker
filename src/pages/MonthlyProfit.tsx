import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import LoadingScreen from "./LoadingScreen";

export default function MonthlyProfit() {
  const { transactions, loading, error } = useTransactions();
  const { categories } = useCategories();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const getCategory = (id: string) =>
    categories.find((c) => c.id === id);

  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) =>
      tx.transaction_date.startsWith(selectedMonth)
    );
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthTransactions]
  );

  const totalExpense = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthTransactions]
  );

  const profit = totalIncome - totalExpense;

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  if (loading) return <LoadingScreen />;

  if (error) return <p className="p-5 text-rose-400">{error}</p>;

  return (
    <div className="safe-px mx-auto max-w-7xl space-y-4 p-3 sm:space-y-5 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-white sm:text-2xl">
          Monthly Profit
        </h1>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#161b22] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto sm:px-4 sm:py-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 sm:text-sm">Income</p>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="mt-2 truncate text-2xl font-bold text-emerald-400 sm:mt-3 sm:text-3xl">
            {fmt(totalIncome)}
          </h2>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 sm:text-sm">Expense</p>
            <TrendingDown className="h-5 w-5 text-rose-400" />
          </div>
          <h2 className="mt-2 truncate text-2xl font-bold text-rose-400 sm:mt-3 sm:text-3xl">
            {fmt(totalExpense)}
          </h2>
        </div>

        {/* Profit Card */}
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 sm:p-5 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-slate-400">Profit</p>
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <h2
            className={`mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold ${
              profit >= 0 ? "text-indigo-400" : "text-rose-400"
            }`}
          >
            {fmt(profit)}
          </h2>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#161b22]">
        {monthTransactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No transactions found for this month.
          </div>
        ) : (
          <>
            {/* Mobile View: Card List */}
            <div className="block md:hidden divide-y divide-white/[0.05]">
              {monthTransactions.map((tx) => {
                const cat = getCategory(tx.category_id);
                return (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {tx.transaction_date}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                          tx.type === "income"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">
                        {cat?.name || "Uncategorized"}
                      </p>
                      <p
                        className={`text-base font-semibold ${
                          tx.type === "income"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}{" "}
                        {fmt(tx.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-white/[0.07]">
                  <tr>
                    <th className="px-4 py-3 text-left text-white">Date</th>
                    <th className="px-4 py-3 text-left text-white">Category</th>
                    <th className="px-4 py-3 text-left text-white">Type</th>
                    <th className="px-4 py-3 text-right text-white">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {monthTransactions.map((tx) => {
                    const cat = getCategory(tx.category_id);

                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-white/[0.05] hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {tx.transaction_date}
                        </td>

                        <td className="px-4 py-3 text-white">
                          {cat?.name}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs capitalize ${
                              tx.type === "income"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-rose-500/15 text-rose-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>

                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            tx.type === "income"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}{" "}
                          {fmt(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}