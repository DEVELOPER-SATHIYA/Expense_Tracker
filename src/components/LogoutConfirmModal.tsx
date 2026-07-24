import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";

interface Props {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function LogoutConfirmModal({
  open,
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
          className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111827] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}

          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500/15 p-2">
                <LogOut className="text-red-400" size={20} />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Logout
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

          <div className="px-6 py-6">
            <p className="text-slate-300">
              Are you sure you want to logout?
            </p>

            <p className="mt-2 text-sm text-slate-500">
              You will need to sign in again to continue using the application.
            </p>
          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 border-t border-slate-700 px-6 py-5">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-5 py-2 text-white hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}