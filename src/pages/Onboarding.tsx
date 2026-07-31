import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ChevronRight,
  Droplets,
  IndianRupee,
  PlusCircle,
  Settings,
  Wallet,
} from "lucide-react";
import logo from "../assets/money-leak-logo.png";
import { clearOnboardingFlag } from "../utils/onboarding";

const steps = [
  {
    icon: Wallet,
    title: "Welcome to கல்லாப்பெட்டி",
    description:
      "Your simple cash box for tracking income, expenses, and where money leaks away.",
    tips: [
      "Everything is saved securely to your account",
      "Use it for Personal or Business accounts",
    ],
  },
  {
    icon: PlusCircle,
    title: "Add income & expenses",
    description:
      "From the Dashboard, tap + Income or + Expense. Use Bulk when you have many entries.",
    tips: [
      "Pick category, payment method, and date",
      "Bulk Income / Bulk Expense saves many rows at once",
    ],
  },
  {
    icon: ArrowLeftRight,
    title: "Manage transactions",
    description:
      "Open Transactions to search, filter by date, edit, delete, or export CSV.",
    tips: [
      "Pencil to edit, trash to delete",
      "Export CSV for backup or sharing",
    ],
  },
  {
    icon: Droplets,
    title: "Find money leaks",
    description:
      "Leak Report shows your biggest spending categories. Monthly Profit shows month-wise profit.",
    tips: [
      "Watch burn rate vs income",
      "Compare this month with last month",
    ],
  },
  {
    icon: Settings,
    title: "Accounts & categories",
    description:
      "In Settings, add accounts and income/expense categories. Switch accounts from the sidebar.",
    tips: [
      "Personal and Business stay separate",
      "Create categories that match how you spend",
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const Icon = step.icon;
  const isLast = index === steps.length - 1;

  const finish = () => {
    clearOnboardingFlag();
    navigate("/", { replace: true });
  };

  const next = () => {
    if (isLast) finish();
    else setIndex((i) => i + 1);
  };

  const back = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0d1117] safe-px safe-pb">
      <div className="flex items-center justify-between px-1 py-4 sm:px-2">
        <div className="flex items-center gap-2">
          <img src={logo} alt="கல்லாப்பெட்டி" className="h-9 w-9 object-contain" />
          <span className="text-sm font-semibold text-white">கல்லாப்பெட்டி</span>
        </div>
        <button
          type="button"
          onClick={finish}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          Skip
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-1 pb-4 sm:px-2">
        <div className="mb-6 flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-amber-500"
                  : i < index
                    ? "w-1.5 bg-amber-500/40"
                    : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col rounded-2xl border border-white/[0.07] bg-[#161b22] p-5 sm:p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
            <Icon size={28} />
          </div>

          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Step {index + 1} of {steps.length}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {step.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            {step.description}
          </p>

          <ul className="mt-6 space-y-3">
            {step.tips.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300"
              >
                <ChevronRight
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-400"
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          {index === 3 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0d1117] px-3 py-2.5 text-xs text-slate-400">
              <IndianRupee size={14} className="text-emerald-400" />
              Tip: open Monthly Profit to pick any month and see profit instantly.
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={back}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-[#0d1117] hover:bg-amber-400"
          >
            {isLast ? "Get started" : "Next"}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
