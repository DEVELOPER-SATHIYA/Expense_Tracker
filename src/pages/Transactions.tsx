import { useMemo, useState } from "react";
import { useAccount } from "../context/AccountContext";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import LoadingScreen from "./LoadingScreen";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { categories } = useCategories();
  const { transactions, loading, error } = useTransactions();
  const { accounts } = useAccount();

  const getCat = (id: string) => categories.find((c) => c.id === id);
  const getAcc = (id: string) => accounts.find((a) => a.id === id);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const cat = getCat(tx.category_id);

      const matchesSearch =
        search === "" ||
        cat?.name.toLowerCase().includes(search.toLowerCase()) ||
        tx.notes?.toLowerCase().includes(search.toLowerCase()) ||
        tx.payment_method?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || tx.type === typeFilter;

      const matchesPayment =
        paymentFilter === "all" || tx.payment_method === paymentFilter;

      const matchesCategory =
        categoryFilter === "all" || tx.category_id === categoryFilter;

      return (
        matchesSearch && matchesType && matchesPayment && matchesCategory
      );
    });
  }, [
    transactions,
    search,
    typeFilter,
    paymentFilter,
    categoryFilter,
    categories,
  ]);

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const balance = totalIncome - totalExpense;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setPaymentFilter("all");
    setCategoryFilter("all");
  };

  if (loading) return <LoadingScreen />;
  if (error) return <p className="p-5 text-rose-400">{error}</p>;

  return (
    <div className="p-3 sm:p-5 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Income</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-emerald-400">
            {fmt(totalIncome)}
          </h2>
        </div>

        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Expense</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-rose-400">
            {fmt(totalExpense)}
          </h2>
        </div>

        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Balance</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-indigo-400">
            {fmt(balance)}
          </h2>
        </div>

        <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Transactions</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-white">
            {filteredTransactions.length}
          </h2>
        </div>
      </div>

      {/* Responsive Filter Control Bar */}
      <div className="mb-5 grid grid-cols-2 md:flex flex-wrap gap-2 sm:gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="col-span-2 md:flex-1 h-10 rounded-sm border border-slate-700 bg-[#161b22] px-3 sm:px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-slate-500"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-sm border border-slate-700 bg-[#161b22] px-2 sm:px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-slate-500"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-10 rounded-sm border border-slate-700 bg-[#161b22] px-2 sm:px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-slate-500"
        >
          <option value="all">All Methods</option>
          {[...new Set(transactions.map((t) => t.payment_method))]
            .filter(Boolean)
            .map((method) => (
              <option key={method} value={method || "cash"}>
                {method}
              </option>
            ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="col-span-2 md:col-span-1 h-10 rounded-sm border border-slate-700 bg-[#161b22] px-2 sm:px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-slate-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="col-span-2 md:col-span-1 h-10 rounded-sm border border-slate-700 bg-[#161b22] px-4 text-xs sm:text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
        >
          Clear Filters
        </button>
      </div>

      {/* Transactions Container */}
      <div className="bg-[#161b22] border border-white/[0.07] rounded-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-white text-xs">
            No transactions found
          </div>
        ) : (
          <>
            {/* Mobile Card View (Visible on small screens) */}
            <div className="block md:hidden divide-y divide-white/[0.07]">
              {filteredTransactions.map((tx) => {
                const cat = getCat(tx.category_id);
                const acc = getAcc(tx.account_id);
                return (
                  <div key={tx.id} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            tx.type === "income"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <TrendingUp size={9} />
                          ) : (
                            <TrendingDown size={9} />
                          )}
                          {tx.type}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {tx.transaction_date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200">
                          <Pencil size={12} />
                        </button>
                        <button className="p-1 rounded hover:bg-rose-500/15 text-slate-400 hover:text-rose-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-200">
                          {cat?.name ?? "Uncategorized"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {acc?.name ? `${acc.name} • ` : ""}
                          {tx.payment_method || "—"}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-mono font-semibold ${
                          tx.type === "income"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "−"}
                        {fmt(tx.amount)}
                      </p>
                    </div>

                    {tx.notes && (
                      <p className="text-[11px] text-slate-400 truncate italic">
                        {tx.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Visible on desktop screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="px-4 py-2.5 text-left text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                      Category
                    </th>
                    <th className="px-4 py-2.5 text-right text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                      Account
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                      Method
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                      Notes
                    </th>
                    <th className="px-4 py-2.5 w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredTransactions.map((tx) => {
                    const cat = getCat(tx.category_id);
                    const acc = getAcc(tx.account_id);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-2.5 text-slate-500 font-mono whitespace-nowrap">
                          {tx.transaction_date}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                              tx.type === "income"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-rose-500/15 text-rose-400"
                            }`}
                          >
                            {tx.type === "income" ? (
                              <TrendingUp size={9} />
                            ) : (
                              <TrendingDown size={9} />
                            )}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">
                          {cat?.name ?? "—"}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-mono font-medium whitespace-nowrap ${
                            tx.type === "income"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "−"}
                          {fmt(tx.amount)}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                          {acc?.name || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-white whitespace-nowrap">
                          {tx.payment_method || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-white max-w-[180px] truncate">
                          {tx.notes || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-0.5">
                            <button className="p-1.5 rounded hover:bg-white/8 text-slate-400 hover:text-slate-300 transition-colors">
                              <Pencil size={12} />
                            </button>
                            <button className="p-1.5 rounded hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
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