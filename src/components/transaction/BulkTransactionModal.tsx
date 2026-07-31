import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCategories } from "../../hooks/useCategories";
import type { CreateTransactionPayload } from "../../services/transaction.service";

interface Props {
  open: boolean;
  type: "income" | "expense";
  onClose: () => void;
  onSuccess?: () => void;
  createTransactions: (
    payloads: Omit<CreateTransactionPayload, "account_id">[]
  ) => Promise<void>;
}

interface BulkRow {
  id: string;
  amount: string;
  categoryId: string;
  paymentMethod: string;
  transactionDate: string;
  notes: string;
}

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Sakthi-UPI",
  "Senthil-UPI",
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "Cheque",
  "Other",
];

const today = () => new Date().toISOString().split("T")[0];

const createRow = (categoryId = ""): BulkRow => ({
  id: crypto.randomUUID(),
  amount: "",
  categoryId,
  paymentMethod: "UPI",
  transactionDate: today(),
  notes: "",
});

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500";

export default function BulkTransactionModal({
  open,
  type,
  onClose,
  onSuccess,
  createTransactions,
}: Props) {
  const { categories } = useCategories();

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  const defaultCategoryId = filteredCategories[0]?.id ?? "";

  const [rows, setRows] = useState<BulkRow[]>([createRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setRows([
      createRow(defaultCategoryId),
      createRow(defaultCategoryId),
      createRow(defaultCategoryId),
    ]);
  }, [open, defaultCategoryId, type]);

  const updateRow = (id: string, patch: Partial<BulkRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, createRow(defaultCategoryId)]);
  };

  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.id !== id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filled = rows.filter((row) => row.amount.trim() !== "");

    if (filled.length === 0) {
      toast.error("Enter at least one amount.");
      return;
    }

    for (const row of filled) {
      if (!row.amount || Number(row.amount) <= 0) {
        toast.error("Each amount must be greater than 0.");
        return;
      }
      if (!row.categoryId) {
        toast.error("Please select a category for every row.");
        return;
      }
      if (!row.transactionDate) {
        toast.error("Please set a date for every row.");
        return;
      }
    }

    try {
      setSaving(true);

      await createTransactions(
        filled.map((row) => ({
          amount: Number(row.amount),
          category_id: row.categoryId,
          payment_method: row.paymentMethod,
          notes: row.notes.trim() || undefined,
          transaction_date: row.transactionDate,
          type,
        }))
      );

      toast.success(
        `${filled.length} ${type === "income" ? "income" : "expense"}${
          filled.length > 1 ? "s" : ""
        } added successfully.`
      );
      await onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save transactions.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const label = type === "income" ? "Income" : "Expense";

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-6 p-0">
        <div
          className="flex max-h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[92vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Bulk Add {label}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Empty amount rows are skipped.
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-white"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-slate-700/80 bg-slate-800/40 p-3 sm:p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      Entry {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 disabled:opacity-30"
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="lg:col-span-1">
                      <label className="mb-1.5 block text-xs text-slate-400">
                        Amount *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) =>
                          updateRow(row.id, { amount: e.target.value })
                        }
                        placeholder="0.00"
                        className={inputClass}
                      />
                    </div>

                    <div className="lg:col-span-1">
                      <label className="mb-1.5 block text-xs text-slate-400">
                        Category *
                      </label>
                      <select
                        value={row.categoryId}
                        onChange={(e) =>
                          updateRow(row.id, { categoryId: e.target.value })
                        }
                        className={inputClass}
                      >
                        {filteredCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-1">
                      <label className="mb-1.5 block text-xs text-slate-400">
                        Payment
                      </label>
                      <select
                        value={row.paymentMethod}
                        onChange={(e) =>
                          updateRow(row.id, {
                            paymentMethod: e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        {PAYMENT_METHODS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-1">
                      <label className="mb-1.5 block text-xs text-slate-400">
                        Date
                      </label>
                      <input
                        type="date"
                        value={row.transactionDate}
                        onChange={(e) =>
                          updateRow(row.id, {
                            transactionDate: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="mb-1.5 block text-xs text-slate-400">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) =>
                          updateRow(row.id, { notes: e.target.value })
                        }
                        placeholder="Optional..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addRow}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-600 px-4 py-3 text-sm text-slate-300 hover:border-indigo-500 hover:text-white"
              >
                <Plus size={16} />
                Add another row
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-700 bg-slate-900 px-4 py-3 safe-pb sm:gap-3 sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-white hover:bg-slate-800 sm:px-5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:px-5"
              >
                {saving ? "Saving..." : `Save All`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}
