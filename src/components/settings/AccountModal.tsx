import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

import type {
  Account,
  CreateAccountPayload,
} from "../../services/account.service";

interface Props {
  open: boolean;
  account?: Account | null;
  onClose: () => void;
  onSave: (payload: CreateAccountPayload) => Promise<void>;
}

export default function AccountModal({
  open,
  account,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");

  const [type, setType] = useState<"personal" | "business">(
    "personal"
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (account) {
      setName(account.name);
      setType(account.type);
    } else {
      setName("");
      setType("personal");
    }
  }, [open, account]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Account name is required.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        name: name.trim(),
        type,
      });

      toast.success(
        account
          ? "Account updated successfully."
          : "Account created successfully."
      );

      onClose();
    } catch (err: any) {
      toast.error(
        err?.message ?? "Failed to save account."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">
              {account ? "Edit Account" : "Add Account"}
            </h2>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Account Name *
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Personal"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Account Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as
                      | "personal"
                      | "business"
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              >
                <option value="personal">
                  Personal
                </option>

                <option value="business">
                  Business
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-5 py-2 text-white hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : account
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}