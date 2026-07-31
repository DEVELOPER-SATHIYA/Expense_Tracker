import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCategories } from "../../hooks/useCategories";
import type {
  CreateTransactionPayload,
  Transaction,
} from "../../services/transaction.service";

interface Props {
  open: boolean;
  type: "income" | "expense";
  onClose: () => void;
  onSuccess?: () => void;
  transaction?: Transaction | null;
  createTransaction?: (
    payload: Omit<CreateTransactionPayload, "account_id">
  ) => Promise<void>;
  updateTransaction?: (
    id: string,
    payload: Partial<CreateTransactionPayload>
  ) => Promise<void>;
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

export default function TransactionModal({
  open,
  type,
  onClose,
  onSuccess,
  transaction,
  createTransaction,
  updateTransaction,
}: Props) {
  const isEditing = Boolean(transaction);

  const { categories } = useCategories();

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setAmount(String(transaction.amount));
      setCategoryId(transaction.category_id);
      setPaymentMethod(transaction.payment_method || "UPI");
      setTransactionDate(transaction.transaction_date);
      setNotes(transaction.notes || "");
      return;
    }

    setAmount("");
    setNotes("");
    setPaymentMethod("UPI");
    setTransactionDate(new Date().toISOString().split("T")[0]);

    if (filteredCategories.length) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [open, filteredCategories, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    const payload = {
      amount: Number(amount),
      category_id: categoryId,
      payment_method: paymentMethod,
      notes,
      transaction_date: transactionDate,
      type,
    };

    try {
      setSaving(true);

      if (isEditing && transaction) {
        if (!updateTransaction) {
          throw new Error("Update handler is missing.");
        }

        await updateTransaction(transaction.id, payload);
        toast.success(
          `${type === "income" ? "Income" : "Expense"} updated successfully.`
        );
      } else {
        if (!createTransaction) {
          throw new Error("Create handler is missing.");
        }

        await createTransaction(payload);
        toast.success(
          `${type === "income" ? "Income" : "Expense"} added successfully.`
        );
      }

      await onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save transaction.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const title = isEditing
    ? type === "income"
      ? "Edit Income"
      : "Edit Expense"
    : type === "income"
      ? "Add Income"
      : "Add Expense";

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          className="flex max-h-[95dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-4">
            <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>

            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-white"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 space-y-5 overflow-y-auto p-4 scrollbar-hide sm:space-y-6 sm:p-6"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Amount *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              >
                {PAYMENT_METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Transaction Date
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional..."
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-4 flex justify-end gap-3 border-t border-slate-700 bg-slate-900 pt-4 safe-pb sm:mt-6 sm:pt-5">
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
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Update"
                    : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}
