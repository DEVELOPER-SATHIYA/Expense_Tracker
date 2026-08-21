import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  expandDocketRange,
  normalizeDocketNumber,
} from "../../utils/dockets";

interface Props {
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onAdd: (numbers: string[]) => Promise<{
    added: number;
    skipped: number;
    skippedNumbers: string[];
  }>;
}

export default function AddDocketsModal({
  open,
  saving = false,
  onClose,
  onAdd,
}: Props) {
  const [mode, setMode] = useState<"single" | "range">("single");
  const [single, setSingle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode("single");
    setSingle("");
    setFrom("");
    setTo("");
  }, [open]);

  const preview = useMemo(() => {
    try {
      if (mode === "single") {
        const number = normalizeDocketNumber(single);
        return number ? [number] : [];
      }
      if (!from.trim() || !to.trim()) return [];
      return expandDocketRange(from, to);
    } catch {
      return [];
    }
  }, [mode, single, from, to]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const numbers =
        mode === "single"
          ? [normalizeDocketNumber(single)].filter(
              (value): value is string => Boolean(value)
            )
          : expandDocketRange(from, to);

      if (numbers.length === 0) {
        toast.error("Enter a valid docket number like C1001785142.");
        return;
      }

      const result = await onAdd(numbers);
      const skippedNote =
        result.skipped > 0
          ? ` ${result.skipped} already existed and were skipped.`
          : "";
      toast.success(
        `Added ${result.added} in-hand docket${result.added === 1 ? "" : "s"}.${skippedNote}`
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add dockets.");
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || saving;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          className="flex max-h-[95dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">
              Add in-hand dockets
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 overflow-y-auto p-4 sm:p-6"
          >
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-700 bg-slate-800/70 p-1">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  mode === "single"
                    ? "bg-amber-500 text-[#0d1117]"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setMode("range")}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  mode === "range"
                    ? "bg-amber-500 text-[#0d1117]"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                Range
              </button>
            </div>

            {mode === "single" ? (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Docket number
                </label>
                <input
                  value={single}
                  onChange={(e) => setSingle(e.target.value)}
                  placeholder="C1001785142"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-mono text-white outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    From
                  </label>
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="C1001785142"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-mono text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    To
                  </label>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="C1001785150"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-mono text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {preview.length > 0 && (
              <p className="text-xs text-slate-400">
                {preview.length} docket{preview.length === 1 ? "" : "s"} will be
                added
                {preview.length <= 8 ? `: ${preview.join(", ")}` : "."}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-700 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {busy ? "Adding..." : "Add dockets"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}
