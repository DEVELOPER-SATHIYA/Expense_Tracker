import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import { useAccounts } from "../hooks/useAccounts";

import type { Account } from "../services/account.service";

interface AccountContextType {
  accounts: Account[];

  currentAccount: Account | null;

  loading: boolean;

  switchAccount: (account: Account) => void;

  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

const STORAGE_KEY = "active_account";

export function AccountProvider({ children }: Props) {
  const {
    accounts,
    loading,
    refresh,
  } = useAccounts();

  /**
   * Active Account State
   */
  const [currentAccount, setCurrentAccount] =
    useState<Account | null>(null);

  /**
   * Restore previously selected account
   */
  useEffect(() => {
    if (loading) return;

    if (accounts.length === 0) {
      setCurrentAccount(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const storedId = localStorage.getItem(STORAGE_KEY);

    if (storedId) {
      const storedAccount = accounts.find(
        (account) => account.id === storedId
      );

      if (storedAccount) {
        setCurrentAccount(storedAccount);
        return;
      }
    }

    // Default account (Personal)
    setCurrentAccount(accounts[0]);

    localStorage.setItem(
      STORAGE_KEY,
      accounts[0].id
    );
  }, [accounts, loading]);

  /**
   * Switch Active Account
   */
  const switchAccount = (account: Account) => {
    setCurrentAccount(account);

    localStorage.setItem(
      STORAGE_KEY,
      account.id
    );
  };

  /**
   * Refresh Accounts
   */
  const refreshAccounts = async () => {
    await refresh();
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        currentAccount,
        loading,
        switchAccount,
        refreshAccounts,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error(
      "useAccount must be used inside AccountProvider"
    );
  }

  return context;
}