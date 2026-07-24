import { Pencil, Plus, Trash2, Wallet } from "lucide-react";

import type { Account } from "../../services/account.service";

interface Props {
  accounts: Account[];
  onAdd: () => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export default function AccountCard({
  accounts,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#161b22] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-indigo-400" />

          <h2 className="text-sm font-semibold text-white">
            Accounts
          </h2>
        </div>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      {/* Body */}
      {accounts.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          No accounts found.
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition"
            >
              <div>
                <h3 className="font-medium text-white">
                  {account.name}
                </h3>

                <p className="mt-1 text-xs capitalize text-slate-400">
                  {account.type}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(account)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-indigo-400"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => onDelete(account)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}