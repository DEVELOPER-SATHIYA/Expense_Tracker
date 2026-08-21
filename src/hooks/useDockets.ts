import { useEffect, useMemo, useState } from "react";
import { useAccount } from "../context/AccountContext";
import { docketService } from "../services/docket.service";
import type {
  DeliveryStatus,
  Docket,
  DocketAssignment,
} from "../services/docket.service";

export function useDockets() {
  const { currentAccount } = useAccount();
  const [dockets, setDockets] = useState<Docket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!currentAccount) {
      setDockets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await docketService.getDockets(currentAccount.id);
      setDockets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentAccount]);

  const inHand = useMemo(
    () => dockets.filter((docket) => docket.status === "in_hand"),
    [dockets]
  );

  const used = useMemo(
    () => dockets.filter((docket) => docket.status === "used"),
    [dockets]
  );

  const addDockets = async (numbers: string[]) => {
    if (!currentAccount) throw new Error("No account selected");
    const result = await docketService.addDockets(currentAccount.id, numbers);
    await load();
    return result;
  };

  const deleteDocket = async (id: string) => {
    await docketService.deleteDocket(id);
    await load();
  };

  const updateDeliveryStatus = async (
    id: string,
    status: DeliveryStatus
  ) => {
    await docketService.updateDeliveryStatus(id, status);
    await load();
  };

  const syncTransactionDockets = async (
    transactionId: string,
    assignments: DocketAssignment[],
    amount: number
  ) => {
    if (!currentAccount) throw new Error("No account selected");
    await docketService.syncTransactionDockets(
      currentAccount.id,
      transactionId,
      assignments,
      amount
    );
    await load();
  };

  return {
    dockets,
    inHand,
    used,
    loading,
    error,
    refresh: load,
    addDockets,
    deleteDocket,
    updateDeliveryStatus,
    syncTransactionDockets,
  };
}
