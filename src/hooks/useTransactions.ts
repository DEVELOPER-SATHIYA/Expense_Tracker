import { useEffect, useState } from "react";
import { useAccount } from "../context/AccountContext";

import { transactionService } from "../services/transaction.service";
import { docketService } from "../services/docket.service";

import type {
  Transaction,
  CreateTransactionPayload,
} from "../services/transaction.service";
import type { DocketAssignment } from "../services/docket.service";

export function useTransactions() {
  const { currentAccount } = useAccount();

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!currentAccount) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await transactionService.getTransactions(
        currentAccount.id
      );

      setTransactions(data);

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

  const createTransaction = async (
    payload: Omit<CreateTransactionPayload, "account_id">,
    dockets?: DocketAssignment[]
  ) => {
    if (!currentAccount)
      throw new Error("No account selected");

    const created = await transactionService.createTransaction({
      ...payload,
      account_id: currentAccount.id,
    });

    if (!created?.id) {
      throw new Error("Failed to create transaction.");
    }

    if (dockets && dockets.length > 0) {
      try {
        await docketService.syncTransactionDockets(
          currentAccount.id,
          created.id,
          dockets,
          payload.amount
        );
      } catch (err) {
        await transactionService.deleteTransaction(created.id);
        throw err;
      }
    }

    await load();
  };

  const createTransactions = async (
    payloads: Omit<CreateTransactionPayload, "account_id">[]
  ) => {
    if (!currentAccount)
      throw new Error("No account selected");

    await transactionService.createTransactions(
      payloads.map((payload) => ({
        ...payload,
        account_id: currentAccount.id,
      }))
    );

    await load();
  };

  const updateTransaction = async (
    id: string,
    payload: Partial<CreateTransactionPayload>,
    dockets?: DocketAssignment[]
  ) => {
    if (!currentAccount)
      throw new Error("No account selected");

    await transactionService.updateTransaction(id, payload);

    if (dockets !== undefined) {
      await docketService.syncTransactionDockets(
        currentAccount.id,
        id,
        dockets,
        payload.amount ?? 0
      );
    }

    await load();
  };

  const deleteTransaction = async (id: string) => {
    await transactionService.deleteTransaction(id);

    await load();
  };

  const dashboardSummary = async () => {
    if (!currentAccount) {
      return {
        income: 0,
        expense: 0,
        balance: 0,
        totalTransactions: 0,
      };
    }

    return transactionService.getDashboardSummary(
      currentAccount.id
    );
  };

  return {
    transactions,
    loading,
    error,
    refresh: load,
    createTransaction,
    createTransactions,
    updateTransaction,
    deleteTransaction,
    dashboardSummary,
  };
}