import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useAccount } from "../context/AccountContext";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { Download, Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import LoadingScreen from "./LoadingScreen";
import TransactionModal from "../components/transaction/TransactionModal";
import DeleteConfirmModal from "../components/settings/DeleteConfirmModal";
import type { Transaction } from "../services/transaction.service";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { categories } = useCategories();
  const {
    transactions,
    loading,
    error,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();
  const { accounts } = useAccount();

  const getCat = (id: string) => categories.find((c) => c.id === id);
  const getAcc = (id: string) => accounts.find((a) => a.id === id);

  const formatTxTime = (createdAt: string) =>
    new Date(createdAt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
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

        const matchesFrom = !fromDate || tx.transaction_date >= fromDate;
        const matchesTo = !toDate || tx.transaction_date <= toDate;

        return (
          matchesSearch &&
          matchesType &&
          matchesPayment &&
          matchesCategory &&
          matchesFrom &&
          matchesTo
        );
      })
      .sort((a, b) => {
        const byDate = b.transaction_date.localeCompare(a.transaction_date);
        if (byDate !== 0) return byDate;
        return (b.created_at || "").localeCompare(a.created_at || "");
      });
  }, [
    transactions,
    search,
    typeFilter,
    paymentFilter,
    categoryFilter,
    fromDate,
    toDate,
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
    setFromDate("");
    setToDate("");
  };

  const exportCsv = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export.");
      return;
    }

    const headers = [
      "Date",
      "Type",
      "Category",
      "Amount",
      "Account",
      "Payment Method",
      "Notes",
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.transaction_date,
      tx.type,
      getCat(tx.category_id)?.name ?? "",
      String(tx.amount),
      getAcc(tx.account_id)?.name ?? "",
      tx.payment_method ?? "",
      (tx.notes ?? "").replace(/"/g, '""'),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kallappetti-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  };

  const handleDelete = async () => {
    if (!deletingTx) return;

    try {
      setDeleting(true);
      await deleteTransaction(deletingTx.id);
      toast.success("Transaction deleted successfully.");
      setDeletingTx(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete transaction.");
    } finally {
      setDeleting(false);
    }
  };

  const deleteItemName = deletingTx
    ? `${deletingTx.type === "income" ? "+" : "−"}${fmt(deletingTx.amount)} · ${
        getCat(deletingTx.category_id)?.name ?? "Uncategorized"
      }`
    : undefined;

  if (loading) return <LoadingScreen />;
  if (error) return <p className="p-5 text-rose-400">{error}</p>;

  return (
    <div className="safe-px space-y-4 p-3 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          Filter, edit, and export your ledger
        </p>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-[#161b22] px-3 text-xs font-medium text-slate-200 hover:bg-slate-800 sm:h-9 sm:w-auto"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Income</p>
          <h2 className="mt-1 truncate text-base font-bold text-emerald-400 sm:mt-2 sm:text-2xl">
            {fmt(totalIncome)}
          </h2>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Expense</p>
          <h2 className="mt-1 truncate text-base font-bold text-rose-400 sm:mt-2 sm:text-2xl">
            {fmt(totalExpense)}
          </h2>
        </div>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Balance</p>
          <h2 className="mt-1 truncate text-base font-bold text-indigo-400 sm:mt-2 sm:text-2xl">
            {fmt(balance)}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Transactions</p>
          <h2 className="mt-1 text-base font-bold text-white sm:mt-2 sm:text-2xl">
            {filteredTransactions.length}
          </h2>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:gap-3 md:flex md:flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="col-span-2 h-11 rounded-lg border border-slate-700 bg-[#161b22] px-3 text-sm text-white focus:border-slate-500 focus:outline-none md:h-10 md:flex-1 sm:px-4"
        />

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white focus:border-slate-500 focus:outline-none md:h-10 sm:px-3"
          title="From date"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white focus:border-slate-500 focus:outline-none md:h-10 sm:px-3"
          title="To date"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white focus:border-slate-500 focus:outline-none md:h-10 sm:px-4"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white focus:border-slate-500 focus:outline-none md:h-10 sm:px-4"
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
          className="col-span-2 h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white focus:border-slate-500 focus:outline-none md:col-span-1 md:h-10 sm:px-4"
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
          className="col-span-2 h-11 rounded-lg border border-slate-700 bg-[#161b22] px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white md:col-span-1 md:h-10"
        >
          Clear Filters
        </button>
      </div>

      <div className="bg-[#161b22] border border-white/[0.07] rounded-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-white text-xs">
            No transactions found
          </div>
        ) : (
          <>
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
                          {tx.transaction_date} {formatTxTime(tx.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingTx(tx)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200"
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTx(tx)}
                          className="p-1 rounded hover:bg-rose-500/15 text-slate-400 hover:text-rose-400"
                          title="Delete"
                        >
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

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="px-4 py-2.5 text-left text-[10px] text-slate-300 font-medium uppercase tracking-wide">
                      Date & Time
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
                          {tx.transaction_date} {formatTxTime(tx.created_at)}
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
                            <button
                              type="button"
                              onClick={() => setEditingTx(tx)}
                              className="p-1.5 rounded hover:bg-white/8 text-slate-400 hover:text-slate-300 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTx(tx)}
                              className="p-1.5 rounded hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
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

      <TransactionModal
        open={Boolean(editingTx)}
        type={editingTx?.type ?? "expense"}
        transaction={editingTx}
        updateTransaction={updateTransaction}
        onClose={() => setEditingTx(null)}
      />

      <DeleteConfirmModal
        open={Boolean(deletingTx)}
        title="Delete Transaction"
        message="This transaction will be permanently removed. This action cannot be undone."
        itemName={deleteItemName}
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeletingTx(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
