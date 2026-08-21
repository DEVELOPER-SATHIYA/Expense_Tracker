import { useMemo, useState } from "react";
import { Download, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDockets } from "../hooks/useDockets";
import LoadingScreen from "./LoadingScreen";
import AddDocketsModal from "../components/docket/AddDocketsModal";
import EditDocketStatusModal from "../components/docket/EditDocketStatusModal";
import DeleteConfirmModal from "../components/settings/DeleteConfirmModal";
import type { DeliveryStatus, Docket } from "../services/docket.service";
import {
  docketDateKey,
  docketTimeLabel,
  formatDocketDateTime,
} from "../utils/dockets";

export default function Dockets() {
  const {
    inHand,
    used,
    loading,
    error,
    addDockets,
    deleteDocket,
    updateDeliveryStatus,
  } = useDockets();

  const [tab, setTab] = useState<"in_hand" | "used">("in_hand");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DeliveryStatus>("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Docket | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState<Docket | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

  const filteredInHand = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inHand;
    return inHand.filter((d) => d.docket_number.toLowerCase().includes(q));
  }, [inHand, search]);

  const filteredUsed = useMemo(() => {
    const q = search.trim().toLowerCase();

    return used
      .filter((docket) => {
        const dateKey = docketDateKey(docket);
        const matchesSearch =
          !q || docket.docket_number.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "all" || docket.delivery_status === statusFilter;
        const matchesMonth = !monthFilter || dateKey.startsWith(monthFilter);
        const matchesFrom = !fromDate || dateKey >= fromDate;
        const matchesTo = !toDate || dateKey <= toDate;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesMonth &&
          matchesFrom &&
          matchesTo
        );
      })
      .sort((a, b) => {
        const byDate = docketDateKey(b).localeCompare(docketDateKey(a));
        if (byDate !== 0) return byDate;
        const aTime = a.transactions?.created_at || a.updated_at;
        const bTime = b.transactions?.created_at || b.updated_at;
        return bTime.localeCompare(aTime);
      });
  }, [used, search, statusFilter, monthFilter, fromDate, toDate]);

  const deliveredCount = used.filter((d) => d.delivery_status === "delivered").length;
  const undeliveredCount = used.filter((d) => d.delivery_status === "undelivered").length;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setMonthFilter("");
    setFromDate("");
    setToDate("");
  };

  const exportCsv = () => {
    if (filteredUsed.length === 0) {
      toast.error("No used dockets to export.");
      return;
    }

    const headers = [
      "S.No",
      "Date",
      "Time",
      "Docket number",
      "Weight (kg)",
      "Amount",
      "Status",
    ];

    const rows = filteredUsed.map((docket, index) => [
      String(index + 1),
      docketDateKey(docket),
      docketTimeLabel(docket),
      docket.docket_number,
      docket.chargeable_weight ?? "",
      docket.amount ?? "",
      docket.delivery_status ?? "undelivered",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kallappetti-dockets-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  };

  const handleStatusSave = async (status: DeliveryStatus) => {
    if (!editing) return;
    try {
      setStatusSaving(true);
      await updateDeliveryStatus(editing.id, status);
      toast.success("Delivery status updated.");
      setEditing(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setDeleteLoading(true);
      await deleteDocket(deleting.id);
      toast.success("In-hand docket removed.");
      setDeleting(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete docket.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <p className="p-5 text-rose-400">{error}</p>;

  return (
    <div className="safe-px mx-auto max-w-7xl space-y-4 p-3 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-white sm:text-2xl">Dockets</h1>
          <p className="mt-1 text-xs text-slate-400">
            Keep unused numbers in-hand, then assign them on Booking income.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {tab === "used" && (
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-[#161b22] px-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <Download size={16} />
              Export CSV
            </button>
          )}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 text-sm font-medium text-[#0d1117] hover:bg-amber-400"
          >
            <Plus size={16} />
            Add in-hand dockets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-3 sm:p-4">
          <p className="text-xs text-slate-400">In-hand unused</p>
          <p className="mt-2 text-lg font-bold text-white sm:text-2xl">
            {inHand.length}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-[#161b22] p-3 sm:p-4">
          <p className="text-xs text-slate-400">Used in booking</p>
          <p className="mt-2 text-lg font-bold text-amber-300 sm:text-2xl">
            {used.length}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Delivered</p>
          <p className="mt-2 text-lg font-bold text-emerald-400 sm:text-2xl">
            {deliveredCount}
          </p>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 sm:p-4">
          <p className="text-xs text-slate-400">Undelivered</p>
          <p className="mt-2 text-lg font-bold text-rose-400 sm:text-2xl">
            {undeliveredCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-700 bg-[#161b22] p-1 sm:inline-flex">
          <button
            type="button"
            onClick={() => setTab("in_hand")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              tab === "in_hand"
                ? "bg-amber-500/15 text-amber-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            In-hand ({inHand.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("used")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              tab === "used"
                ? "bg-amber-500/15 text-amber-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Used ({used.length})
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search docket number"
          className="w-full rounded-lg border border-slate-700 bg-[#161b22] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 sm:max-w-xs"
        />
      </div>

      {tab === "used" && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:flex md:flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | DeliveryStatus)
            }
            className="h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white outline-none md:h-10 sm:px-4"
          >
            <option value="all">All statuses</option>
            <option value="delivered">Delivered</option>
            <option value="undelivered">Undelivered</option>
          </select>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white outline-none md:h-10 sm:px-3"
            title="Filter by month"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white outline-none md:h-10 sm:px-3"
            title="From date"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-11 rounded-lg border border-slate-700 bg-[#161b22] px-2 text-sm text-white outline-none md:h-10 sm:px-3"
            title="To date"
          />
          <button
            type="button"
            onClick={clearFilters}
            className="col-span-2 h-11 rounded-lg border border-slate-700 bg-[#161b22] px-4 text-sm font-medium text-slate-200 hover:bg-slate-700 md:col-span-1 md:h-10"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#111827]">
        {tab === "in_hand" ? (
          filteredInHand.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
              <Package className="text-slate-600" size={28} />
              <p className="text-sm text-slate-400">No unused in-hand dockets</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-slate-300">
                      S.No
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-slate-300">
                      Docket number
                    </th>
                    <th className="px-4 py-2.5 w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredInHand.map((docket, index) => (
                    <tr key={docket.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-slate-500">{index + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-200">
                        {docket.docket_number}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleting(docket)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400"
                          title="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredUsed.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Package className="text-slate-600" size={28} />
            <p className="text-sm text-slate-400">
              No used dockets match these filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    S.No
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    Date & Time
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    Docket number
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    Weight
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    Amount
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-2.5 w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsed.map((docket, index) => (
                  <tr key={docket.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-2.5 font-mono whitespace-nowrap text-slate-400">
                      {formatDocketDateTime(docket)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-200">
                      {docket.docket_number}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                      {docket.chargeable_weight ?? "—"} kg
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                      {docket.amount != null ? fmt(docket.amount) : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          docket.delivery_status === "delivered"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {docket.delivery_status === "delivered"
                          ? "Delivered"
                          : "Undelivered"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(docket)}
                        className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                        title="Edit status"
                      >
                        <Pencil size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddDocketsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addDockets}
      />

      <EditDocketStatusModal
        open={Boolean(editing)}
        docket={editing}
        saving={statusSaving}
        onClose={() => {
          if (!statusSaving) setEditing(null);
        }}
        onSave={handleStatusSave}
      />

      <DeleteConfirmModal
        open={Boolean(deleting)}
        title="Remove docket"
        message="This unused in-hand docket number will be removed."
        itemName={deleting?.docket_number}
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) setDeleting(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
