import { useEffect, useState } from "react";
import { useAccount } from "../context/AccountContext";

import { transactionService } from "../services/transaction.service";

import type {
  Transaction,
  CreateTransactionPayload,
} from "../services/transaction.service";

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
      console.log("currentAccount.id-----------------------", currentAccount.id);
      const data = await transactionService.getTransactions(
        currentAccount.id
      );
      console.log("data-----------------------", data);

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
    payload: Omit<CreateTransactionPayload, "account_id">
  ) => {
    if (!currentAccount)
      throw new Error("No account selected");

    await transactionService.createTransaction({
      ...payload,
      account_id: currentAccount.id,
    });

    await load();
  };

  const updateTransaction = async (
    id: string,
    payload: Partial<CreateTransactionPayload>
  ) => {
    await transactionService.updateTransaction(id, payload);

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
    updateTransaction,
    deleteTransaction,
    dashboardSummary,
  };
}