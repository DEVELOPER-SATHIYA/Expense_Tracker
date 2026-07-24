import { useEffect, useMemo, useState } from "react";
import TransactionModal from "../components/transaction/TransactionModal";
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
import { TrendingDown, TrendingUp } from "lucide-react";
import Btn from "../components/Btn";
import LoadingScreen from "./LoadingScreen";

export default function Dashboard() {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [summary, setSummary] = useState<any>();
  const now = new Date();
  const yr = now.getFullYear(),
    mo = now.getMonth();
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
  const fmtK = (n: number) =>
    n >= 1000 ? "₹" + (n / 1000).toFixed(0) + "k" : "₹" + n;


  // const {
  //   transactions,
  //   loading,
  //   error,
  //   dashboardSummary,
  // } = useTransactions();
  const {
    transactions,
    loading,
    error,
    dashboardSummary,
    createTransaction,
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

  useEffect(() => {
    async function loadSummary() {
      const data = await dashboardSummary();
      setSummary(data);
    }
    loadSummary();
  }, [transactions]);

  if (loading) return <LoadingScreen />;

  if (error) return <p>{error}</p>;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Btn onClick={() => setIncomeOpen(true)} variant="primary">
            + Income
          </Btn>
          <Btn onClick={() => setExpenseOpen(true)} variant="primary" >
            + Expense
          </Btn>
        </div>
      </div>



      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card title="Income" value={summary?.income} sub="This month" color="emerald" />
        <Card title="Expense" value={summary?.expense} sub="This month" color="rose" />
        <Card title="Savings" value={summary?.savings} sub="This month" color={summary?.savings >= 0 ? "indigo" : "rose"} />
        <Card title="Overall Balance" value={summary?.balance} sub="All time" color="slate" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Bar chart */}
        <div className="bg-[#161b22] border border-white/[0.07] rounded-xl p-4">
          <h3 className="text-xs font-medium text-slate-400 mb-4">
            Last 6 Months
          </h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={barData}
              barGap={3}
              barCategoryGap="35%"
            >
              <XAxis
                key="xaxis"
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                key="yaxis"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtK}
                width={45}
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

        {/* Pie chart */}
        <div className="bg-[#161b22] border border-white/[0.07] rounded-xl p-4">
          <h3 className="text-xs font-medium text-slate-400 mb-4">
            Expenses by Category
          </h3>
          {expByCat.length === 0 ? (
            <div className="h-[190px] flex items-center justify-center text-slate-600 text-xs">
              No expenses this month
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="45%" height={175}>
                <PieChart>
                  <Pie
                    data={expByCat}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={75}
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
                      border:
                        "1px solid rgba(255,255,255,0.09)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}


                    formatter={(value) => [
                      fmt(Number(value ?? 0))
                    ]}

                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 min-w-0">
                {expByCat.slice(0, 7).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 min-w-0"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: PC[i % PC.length] }}
                    />
                    <span className="text-[11px] text-slate-500 truncate flex-1">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300 flex-shrink-0">
                      {fmt(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#161b22] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
          <h3 className="text-xs font-medium text-slate-400">
            Recent Transactions
          </h3>
          <button
            // onClick={() => setView("transactions")}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all
          </button>
        </div>
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

    </div>
  );
}


