import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCategories } from "../../hooks/useCategories";
import type {
    CreateTransactionPayload,
} from "../../services/transaction.service";

interface Props {
    open: boolean;
    type: "income" | "expense";
    onClose: () => void;
    onSuccess?: () => void;

    createTransaction: (
        payload: Omit<CreateTransactionPayload, "account_id">
    ) => Promise<void>;
}


const PAYMENT_METHODS = [
    "Cash",
    "UPI",
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
    createTransaction,
}: Props) {
    // const { createTransaction } = useTransactions(); 

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

        setAmount("");
        setNotes("");
        setPaymentMethod("UPI");
        setTransactionDate(
            new Date().toISOString().split("T")[0]
        );

        if (filteredCategories.length) {
            setCategoryId(filteredCategories[0].id);
        }
    }, [open, filteredCategories]);

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!amount) {
            if (!amount) {
                toast.error("Please enter an amount.");
                return;
            }
            return;
        }

        if (!categoryId) {
            toast.error("Please select a category.");
            return;
        }

        try {
            setSaving(true);

            await createTransaction({
                amount: Number(amount),
                category_id: categoryId,
                payment_method: paymentMethod,
                notes,
                transaction_date: transactionDate,
                type,
            });

            toast.success(
                `${type === "income" ? "Income" : "Expense"} added successfully.`
            );
            await onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error(err);

            toast.error(
                err?.message || "Failed to save transaction."
            );
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return createPortal(
        <>
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                onClick={onClose}
            />

            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            >
                <div
                    className="
                            flex
                            max-h-[90vh]
                            w-full
                            max-w-xl
                            flex-col
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-700
                            bg-slate-900
                            shadow-2xl
                        "
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="
                                sticky
                                top-0
                                z-10
                                flex
                                items-center
                                justify-between
                                border-b
                                border-slate-700
                                bg-slate-900
                                px-6
                                py-5
                            "
                    >

                        <h2 className="text-xl font-semibold text-white">

                            {type === "income"
                                ? "Add Income"
                                : "Add Expense"}

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
                        className="
                        flex-1
                        overflow-y-auto
                        space-y-6
                        p-6
                        scrollbar-hide
                       "
                    >
                        {/* Amount */}

                        <div>

                            <label className="mb-2 block text-sm text-slate-300">

                                Amount *

                            </label>

                            <input
                                type="number"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(e.target.value)
                                }
                                placeholder="0.00"
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            />

                        </div>

                        {/* Category */}

                        <div>

                            <label className="mb-2 block text-sm text-slate-300">

                                Category *

                            </label>

                            <select
                                value={categoryId}
                                onChange={(e) =>
                                    setCategoryId(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
                            >
                                {filteredCategories.map((cat) => (
                                    <option
                                        key={cat.id}
                                        value={cat.id}
                                    >
                                        {cat.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                        {/* Payment */}

                        <div>

                            <label className="mb-2 block text-sm text-slate-300">

                                Payment Method

                            </label>

                            <select
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
                            >
                                {PAYMENT_METHODS.map((item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </select>

                        </div>

                        {/* Date */}

                        <div>

                            <label className="mb-2 block text-sm text-slate-300">

                                Transaction Date

                            </label>

                            <input
                                type="date"
                                value={transactionDate}
                                onChange={(e) =>
                                    setTransactionDate(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
                            />

                        </div>

                        {/* Notes */}

                        <div>

                            <label className="mb-2 block text-sm text-slate-300">

                                Notes

                            </label>

                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) =>
                                    setNotes(e.target.value)
                                }
                                placeholder="Optional..."
                                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
                            />

                        </div>

                        {/* Footer */}

                        <div
                            className="
                                bottom-0
                                mt-6
                                flex
                                justify-end
                                gap-3
                                border-t
                                border-slate-700
                                bg-slate-900
                                pt-5
                            "
                        >

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
                                    : "Save Transaction"}
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </>,
        document.body
    );
}