import { ArrowDown, ArrowRight, Briefcase, User, X } from "lucide-react";
import type { Account } from "../../services/account.service";
import { useAccount } from "../../context/AccountContext";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  account: Account | null;
  onClose: () => void;
}

function AccountPreview({
  label,
  account,
  highlight = false,
}: {
  label: string;
  account: Account | null | undefined;
  highlight?: boolean;
}) {
  if (!account) return null;

  return (
    <div className="min-w-0 w-full">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div
        className={`flex min-w-0 items-center gap-3 rounded-xl p-3 ${
          highlight
            ? "border border-amber-500/50 bg-amber-500/10"
            : "bg-slate-800"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${
            highlight ? "bg-amber-500/20 text-amber-300" : "bg-slate-700 text-slate-300"
          }`}
        >
          {account.type === "business" ? (
            <Briefcase size={18} />
          ) : (
            <User size={18} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{account.name}</p>
          <p
            className={`truncate text-sm capitalize ${
              highlight ? "text-slate-300" : "text-slate-400"
            }`}
          >
            {account.type}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SwitchAccountModal({ open, account, onClose }: Props) {
  const { currentAccount, switchAccount } = useAccount();

  if (!open || !account) return null;

  const handleSwitch = () => {
    switchAccount(account);
    onClose();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-700 p-4 sm:p-5">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Switch Account
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                You&apos;re about to switch your active account.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-stretch gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <AccountPreview label="Current Account" account={currentAccount} />

            <div className="flex shrink-0 items-center justify-center py-0.5">
              <ArrowDown size={22} className="text-amber-400 sm:hidden" />
              <ArrowRight size={22} className="hidden text-amber-400 sm:block" />
            </div>

            <AccountPreview label="Switch To" account={account} highlight />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-700 p-4 safe-pb sm:flex-row sm:justify-end sm:gap-3 sm:p-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-slate-600 px-5 py-2.5 text-white transition hover:bg-slate-800 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSwitch}
              className="w-full rounded-lg bg-amber-500 px-5 py-2.5 font-medium text-[#0d1117] transition hover:bg-amber-400 sm:w-auto"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
