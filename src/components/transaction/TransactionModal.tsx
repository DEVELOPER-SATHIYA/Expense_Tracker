import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCategories } from "../../hooks/useCategories";
import { useDockets } from "../../hooks/useDockets";
import { docketService } from "../../services/docket.service";
import type { DocketAssignment } from "../../services/docket.service";
import type {
  CreateTransactionPayload,
  Transaction,
} from "../../services/transaction.service";
import { isBookingCategory, normalizeDocketNumber } from "../../utils/dockets";
import DocketNumberInput from "../docket/DocketNumberInput";

interface Props {
  open: boolean;
  type: "income" | "expense";
  onClose: () => void;
  onSuccess?: () => void;
  transaction?: Transaction | null;
  createTransaction?: (
    payload: Omit<CreateTransactionPayload, "account_id">,
    dockets?: DocketAssignment[]
  ) => Promise<void>;
  updateTransaction?: (
    id: string,
    payload: Partial<CreateTransactionPayload>,
    dockets?: DocketAssignment[]
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

type ParcelRow = { docketId: string; docketNumber: string; weight: string };

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
  const { dockets, inHand, refresh: refreshDockets } = useDockets();

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
  const [parcels, setParcels] = useState<ParcelRow[]>([
    { docketId: "", docketNumber: "", weight: "" },
  ]);

  const selectedCategory = filteredCategories.find((c) => c.id === categoryId);
  const showDockets =
    type === "income" && isBookingCategory(selectedCategory?.name);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const hydrate = async () => {
      if (transaction) {
        setAmount(String(transaction.amount));
        setCategoryId(transaction.category_id);
        setPaymentMethod(transaction.payment_method || "UPI");
        setTransactionDate(transaction.transaction_date);
        setNotes(transaction.notes || "");

        const assigned = await docketService.getByTransaction(transaction.id);
        if (cancelled) return;
        setParcels(
          assigned.length
            ? assigned.map((docket) => ({
                docketId: docket.id,
                docketNumber: docket.docket_number,
                weight: String(docket.chargeable_weight ?? ""),
              }))
            : [{ docketId: "", docketNumber: "", weight: "" }]
        );
        return;
      }

      setAmount("");
      setNotes("");
      setPaymentMethod("UPI");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setParcels([{ docketId: "", docketNumber: "", weight: "" }]);

      if (filteredCategories.length) {
        setCategoryId(filteredCategories[0].id);
      }
    };

    hydrate();
    refreshDockets();

    return () => {
      cancelled = true;
    };
  }, [open, filteredCategories, transaction]);

  const optionsForRow = (currentId: string) => {
    const taken = new Set(
      parcels.map((row) => row.docketId).filter((id) => id && id !== currentId)
    );

    return dockets.filter((docket) => {
      if (taken.has(docket.id)) return false;
      if (docket.status === "in_hand") return true;
      if (transaction && docket.transaction_id === transaction.id) return true;
      return docket.id === currentId;
    });
  };

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

    let assignments: DocketAssignment[] | undefined;

    if (type === "income") {
      if (showDockets) {
        const filled = parcels.filter(
          (row) => row.docketId || row.docketNumber || row.weight
        );
        if (filled.length === 0) {
          toast.error("Add at least one docket number and chargeable weight.");
          return;
        }

        const resolved: DocketAssignment[] = [];
        const usedNumbers = new Set<string>();

        for (const row of filled) {
          const typed = normalizeDocketNumber(row.docketNumber);
          if (!typed) {
            toast.error("Enter a valid docket number like C1001785142.");
            return;
          }

          const available = optionsForRow(row.docketId);
          const matched =
            available.find((docket) => docket.id === row.docketId) ||
            available.find((docket) => docket.docket_number === typed);

          if (!matched) {
            toast.error(`${typed} is not in-hand. Add it in Dockets first.`);
            return;
          }

          if (usedNumbers.has(matched.id)) {
            toast.error("Each docket can only be used once.");
            return;
          }
          usedNumbers.add(matched.id);

          if (!row.weight || Number(row.weight) <= 0) {
            toast.error("Enter chargeable weight for every docket.");
            return;
          }

          resolved.push({
            docketId: matched.id,
            chargeableWeight: Number(row.weight),
          });
        }

        assignments = resolved;
      } else {
        assignments = [];
      }
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

        await updateTransaction(transaction.id, payload, assignments);
        toast.success(
          `${type === "income" ? "Income" : "Expense"} updated successfully.`
        );
      } else {
        if (!createTransaction) {
          throw new Error("Create handler is missing.");
        }

        await createTransaction(payload, assignments);
        toast.success(
          `${type === "income" ? "Income" : "Expense"} added successfully.`
        );
      }

      await refreshDockets();
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

            {showDockets && (
              <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-amber-200">
                      Parcels
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Each docket is one parcel with its own chargeable weight.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setParcels((rows) => [
                        ...rows,
                        { docketId: "", docketNumber: "", weight: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 px-2.5 py-1.5 text-[11px] font-medium text-amber-300 hover:bg-amber-500/10"
                  >
                    <Plus size={12} />
                    Add docket
                  </button>
                </div>

                {inHand.length === 0 &&
                  parcels.every((row) => !row.docketId && !row.docketNumber) && (
                    <p className="text-[11px] text-slate-400">
                      No unused dockets in-hand.{" "}
                      <Link
                        to="/dockets"
                        onClick={onClose}
                        className="text-amber-300 underline"
                      >
                        Add them in Dockets
                      </Link>{" "}
                      first.
                    </p>
                  )}

                {parcels.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_7.5rem_auto] gap-2"
                  >
                    <DocketNumberInput
                      value={row.docketNumber}
                      options={optionsForRow(row.docketId)}
                      onChange={(docketNumber, matched) =>
                        setParcels((rows) =>
                          rows.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  docketNumber,
                                  docketId: matched?.id ?? "",
                                }
                              : item
                          )
                        )
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={row.weight}
                      onChange={(e) =>
                        setParcels((rows) =>
                          rows.map((item, i) =>
                            i === index
                              ? { ...item, weight: e.target.value }
                              : item
                          )
                        )
                      }
                      placeholder="Weight kg"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setParcels((rows) =>
                          rows.length === 1
                            ? [{ docketId: "", docketNumber: "", weight: "" }]
                            : rows.filter((_, i) => i !== index)
                        )
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400"
                      title="Remove parcel"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

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
