import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { accountService } from "../services/account.service";

import type {
  Account,
  CreateAccountPayload,
} from "../services/account.service";

export function useAccounts() {
  const { user, loading: authLoading } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const data = await accountService.getAccounts();

      setAccounts(data);

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAccounts([]);
      setLoading(false);
      setError(null);
      return;
    }

    loadAccounts();
  }, [user, authLoading]);

  const createAccount = async (
    payload: CreateAccountPayload
  ) => {
    await accountService.createAccount(payload);

    await loadAccounts();
  };

  const updateAccount = async (
    id: string,
    payload: Partial<CreateAccountPayload>
  ) => {
    await accountService.updateAccount(id, payload);

    await loadAccounts();
  };

  const deleteAccount = async (id: string) => {
    await accountService.deleteAccount(id);

    await loadAccounts();
  };

  return {
    accounts,

    loading,

    error,

    refresh: loadAccounts,

    createAccount,

    updateAccount,

    deleteAccount,
  };
}