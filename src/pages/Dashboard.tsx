import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransactionModal from "../components/transaction/TransactionModal";
import BulkTransactionModal from "../components/transaction/BulkTransactionModal";
import { useTransactions } from "../hooks/useTransactions";
import Card from "../components/dashboard/summarycard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useCategories } from "../hooks/useCategories";
import PC from "../theme/pc";
import MS from "../constants/MS";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import Btn from "../components/Btn";
import LoadingScreen from "./LoadingScreen";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [bulkIncomeOpen, setBulkIncomeOpen] = useState(false);
  const [bulkExpenseOpen, setBulkExpenseOpen] = useState(false);
  const [summary, setSummary] = useState<any>();
  const now = new Date();
  const yr = now.getFullYear(),
    mo = now.getMonth();
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
  const fmtK = (n: number) =>
    n >= 1000 ? "₹" + (n / 1000).toFixed(0) + "k" : "₹" + n;

  const {
    transactions,
    loading,
    error,
    dashboardSummary,
    createTransaction,
    createTransactions,
    refresh,
  } = useTransactions();

  const { categories } = useCategories();

  useEffect(() => {
    async function loadSummary() {
      const data = await dashboardSummary();
      setSummary(data);
    }
    loadSummary();
  }, [transactions]);

  const getCat = (id: string) =>
    categories.find((c) => c.id === id);
  const monthTxs = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getFullYear() === yr && d.getMonth() === mo;
  });

  const expByCat = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category_id] = (map[t.category_id] ?? 0) + t.amount;
      });
    return Object.entries(map)
      .map(([id, value]) => ({
        name:
          categories.find((c) => c.id === id)?.name ?? "Other",
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthTxs, categories]);

  const paymentBalances = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};

    for (const t of transactions) {
      const method = t.payment_method?.trim() || "Other";
      if (!map[method]) map[method] = { income: 0, expense: 0 };
      if (t.type === "income") map[method].income += Number(t.amount);
      else map[method].expense += Number(t.amount);
    }

    return Object.entries(map)
      .map(([method, { income, expense }]) => ({
        method,
        balance: income - expense,
        income,
        expense,
      }))
      .sort((a, b) => a.method.localeCompare(b.method));
  }, [transactions]);

  const recent = [...transactions]
    .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
    .slice(0, 10);

  const barData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(yr, mo - 5 + i, 1);
        const y2 = d.getFullYear(),
          m2 = d.getMonth();
        const txs = transactions.filter((t) => {
          const d2 = new Date(t.transaction_date);
          return (
            d2.getFullYear() === y2 && d2.getMonth() === m2
          );
        });
        return {
          name: MS[m2],
          income: txs
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + t.amount, 0),
          expense: txs
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + t.amount, 0),
        };
      }),
    [transactions, yr, mo],
  );

  if (loading) return <LoadingScreen />;

  if (error) return <p>{error}</p>;
  const username = user?.email.split("@")[0] || 'User';

  return (
    <div className="safe-px space-y-4 p-3 sm:space-y-5 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg">Welcome Back , {username} !</h1>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <Btn
            onClick={() => setIncomeOpen(true)}
            variant="primary"
            className="justify-center"
          >
            + Income
          </Btn>
          <Btn
            onClick={() => setExpenseOpen(true)}
            variant="primary"
            className="justify-center"
          >
            + Expense
          </Btn>
          <Btn
            onClick={() => setBulkIncomeOpen(true)}
            variant="ghost"
            className="justify-center"
          >
            Bulk Income
          </Btn>
          <Btn
            onClick={() => setBulkExpenseOpen(true)}
            variant="ghost"
            className="justify-center"
          >
            Bulk Expense
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <Card
          title="Income"
          value={fmt(summary?.income ?? 0)}
          sub="All time"
          color="emerald"
        />
        <Card
          title="Expense"
          value={fmt(summary?.expense ?? 0)}
          sub="All time"
          color="rose"
        />
        <Card
          title="Overall Balance"
          value={fmt(summary?.balance ?? 0)}
          sub="All time"
          color="slate"
        />

        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-3 sm:p-4">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Payment Method Balance
          </div>
          {paymentBalances.length === 0 ? (
            <div className="text-xs text-slate-600">No payments yet</div>
          ) : (
            <div className="max-h-[110px] space-y-2 overflow-y-auto scrollbar-hide sm:max-h-[120px]">
              {paymentBalances.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate text-[11px] text-slate-400">
                    {item.method}
                  </span>
                  <span
                    className={`flex-shrink-0 font-mono text-[11px] font-medium ${item.balance >= 0 ? "text-indigo-400" : "text-rose-400"
                      }`}
                  >
                    {fmt(item.balance)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-3 sm:p-4">
          <h3 className="mb-3 text-xs font-medium text-slate-400 sm:mb-4">
            Last 6 Months
          </h3>
          <div className="h-[180px] w-full sm:h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={3} barCategoryGap="35%">
                <XAxis
                  key="xaxis"
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  key="yaxis"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtK}
                  width={40}
                />
                <Tooltip
                  key="tooltip"
                  contentStyle={{
                    background: "#1a2236",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 8,
                    fontSize: 12,
                    padding: "8px 12px",
                  }}
                  labelStyle={{
                    color: "#e2e8f0",
                    marginBottom: 4,
                  }}
                  formatter={(value: any, name: any) => [
                    fmt(Number(value)),
                    name,
                  ]}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  key="bar-income"
                  dataKey="income"
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                  name="Income"
                />
                <Bar
                  key="bar-expense"
                  dataKey="expense"
                  fill="#f43f5e"
                  radius={[3, 3, 0, 0]}
                  name="Expense"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-3 sm:p-4">
          <h3 className="mb-3 text-xs font-medium text-slate-400 sm:mb-4">
            Expenses by Category
          </h3>
          {expByCat.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-xs text-slate-600 sm:h-[190px]">
              No expenses this month
            </div>
          ) : (
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-3">
              <div className="mx-auto h-[160px] w-full max-w-[220px] sm:mx-0 sm:h-[175px] sm:w-[45%] sm:max-w-none">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expByCat}
                      dataKey="value"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {expByCat.map((entry, i) => (
                        <Cell
                          key={`cell-${entry.name}-${i}`}
                          fill={PC[i % PC.length]}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1a2236",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      formatter={(value) => [fmt(Number(value ?? 0))]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                {expByCat.slice(0, 7).map((item, i) => (
                  <div key={i} className="flex min-w-0 items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: PC[i % PC.length] }}
                    />
                    <span className="flex-1 truncate text-[11px] text-slate-500">
                      {item.name}
                    </span>
                    <span className="flex-shrink-0 font-mono text-[11px] text-slate-300">
                      {fmt(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {expByCat[0] && (
        <button
          type="button"
          onClick={() => navigate("/leaks")}
          className="w-full rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-rose-500/10 px-4 py-3 text-left transition hover:border-amber-500/40"
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-300/80">
                Biggest leak this month
              </p>
              <p className="mt-1 truncate text-sm text-slate-200">
                <span className="font-semibold text-white">{expByCat[0].name}</span>
                {" — "}
                <span className="font-mono text-rose-400">
                  {fmt(expByCat[0].value)}
                </span>
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-amber-400 whitespace-nowrap">
              Report
              <ChevronRight size={12} />
            </span>
          </div>
        </button>
      )}

      <div className="bg-[#161b22] border border-white/[0.07] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => navigate("/transactions")}
          className="flex w-full items-center justify-between px-4 py-3 border-b border-white/[0.07] hover:bg-white/[0.02] transition-colors text-left"
        >
          <h3 className="text-xs font-medium text-slate-400">
            Recent Transactions
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
            View all
            <ChevronRight size={12} />
          </span>
        </button>
        <div className="divide-y divide-white/[0.05]">
          {recent.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-600 text-xs">
              No transactions yet. Add one to get started.
            </div>
          ) : (
            recent.map((tx) => {
              const cat = getCat(tx.category_id);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "income"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                      }`}
                  >
                    {tx.type === "income" ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-200 truncate">
                      {cat?.name ?? "—"}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      · {tx.transaction_date}
                    </div>
                  </div>
                  {tx.notes && (
                    <div className="text-[10px] text-slate-600 hidden sm:block truncate max-w-[140px]">
                      {tx.notes}
                    </div>
                  )}
                  <div
                    className={`text-xs font-mono font-medium flex-shrink-0 ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {tx.type === "income" ? "+" : "−"}
                    {fmt(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* <TransactionModal
        open={incomeOpen}
        type="income"
        onClose={() => setIncomeOpen(false)}
      />

      <TransactionModal
        open={expenseOpen}
        type="expense"
        onClose={() => setExpenseOpen(false)}
      /> */}

      <TransactionModal
        open={incomeOpen}
        type="income"
        createTransaction={createTransaction}
        onSuccess={refresh}
        onClose={() => setIncomeOpen(false)}
      />

      <TransactionModal
        open={expenseOpen}
        type="expense"
        createTransaction={createTransaction}
        onSuccess={refresh}
        onClose={() => setExpenseOpen(false)}
      />

      <BulkTransactionModal
        open={bulkIncomeOpen}
        type="income"
        createTransactions={createTransactions}
        onSuccess={refresh}
        onClose={() => setBulkIncomeOpen(false)}
      />

      <BulkTransactionModal
        open={bulkExpenseOpen}
        type="expense"
        createTransactions={createTransactions}
        onSuccess={refresh}
        onClose={() => setBulkExpenseOpen(false)}
      />

    </div>
  );
}


