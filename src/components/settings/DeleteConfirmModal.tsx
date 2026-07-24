import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteConfirmModal({
  open,
  title = "Delete Item",
  message = "This action cannot be undone.",
  itemName,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
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
          {/* Header */}

          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-rose-500/15 p-2">
                <AlertTriangle
                  size={20}
                  className="text-rose-400"
                />
              </div>

              <h2 className="text-lg font-semibold text-white">
                {title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}

          <div className="space-y-4 px-6 py-6">
            {itemName && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                <p className="text-sm text-slate-400">
                  Selected
                </p>

                <p className="mt-1 font-medium text-white">
                  {itemName}
                </p>
              </div>
            )}

            <p className="text-sm text-slate-400">
              {message}
            </p>
          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 border-t border-slate-700 px-6 py-5">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-5 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="rounded-lg bg-rose-600 px-5 py-2 font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}