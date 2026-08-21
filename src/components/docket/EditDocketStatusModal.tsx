import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { DeliveryStatus, Docket } from "../../services/docket.service";
import { formatDocketDateTime } from "../../utils/dockets";

interface Props {
  open: boolean;
  docket: Docket | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (status: DeliveryStatus) => Promise<void> | void;
}

export default function EditDocketStatusModal({
  open,
  docket,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [status, setStatus] = useState<DeliveryStatus>("undelivered");

  useEffect(() => {
    if (!open || !docket) return;
    setStatus(docket.delivery_status ?? "undelivered");
  }, [open, docket]);

  if (!open || !docket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(status);
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          className="w-full max-w-md overflow-hidden rounded-t-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">
              Update delivery status
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
              <p className="text-xs text-slate-400">Docket number</p>
              <p className="mt-1 font-mono text-sm font-medium text-white">
                {docket.docket_number}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {formatDocketDateTime(docket)}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              >
                <option value="undelivered">Undelivered</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update status"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}
