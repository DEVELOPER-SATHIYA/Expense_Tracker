import { useState } from "react";
import { Settings as LogOut } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAccounts } from "../hooks/useAccounts";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../context/AuthContext";

import AccountCard from "../components/settings/AccountCard";
import CategoryCard from "../components/settings/CategoryCard";
import AccountModal from "../components/settings/AccountModal";
import CategoryModal from "../components/settings/CategoryModal";
import DeleteConfirmModal from "../components/settings/DeleteConfirmModal";

import type { Account } from "../services/account.service";
import type { Category } from "../services/category.service";

export default function Settings() {
  const { user, logout } = useAuth();

  const {
    accounts,
    loading: accountsLoading,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts();

  const {
    categories,
    loading: categoriesLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [deleteType, setDeleteType] = useState<
    "account" | "category"
  >("account");

  const [categoryType, setCategoryType] = useState<
    "income" | "expense"
  >("expense");

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
  }

  return (
    <div className="safe-px mx-auto max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          Settings
        </h1>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-[#111827] p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">Logged in as</p>

          <p className="mt-1 break-all font-medium text-white">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-white hover:bg-red-700 md:w-auto"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
      <AccountCard
        accounts={accounts}
        onAdd={() => {
          setSelectedAccount(null);
          setAccountModalOpen(true);
        }}
        onEdit={(account) => {
          setSelectedAccount(account);
          setAccountModalOpen(true);
        }}
        onDelete={(account) => {
          setDeleteType("account");
          setSelectedAccount(account);
          setDeleteOpen(true);
        }}
      />

      {/* Categories */}

      <CategoryCard
        categories={categories}
        onAdd={(type) => {
          setSelectedCategory(null);
          setCategoryType(type);
          setCategoryModalOpen(true);
        }}
        onEdit={(category) => {
          setSelectedCategory(category);
          setCategoryModalOpen(true);
        }}
        onDelete={(category) => {
          setDeleteType("category");
          setSelectedCategory(category);
          setDeleteOpen(true);
        }}
      />

      {/* Account Modal */}

      <AccountModal
        open={accountModalOpen}
        account={selectedAccount}
        onClose={() => {
          setSelectedAccount(null);
          setAccountModalOpen(false);
        }}
        onSave={async (payload) => {
          if (selectedAccount) {
            await updateAccount(selectedAccount.id, payload);
          } else {
            await createAccount(payload);
          }

          setAccountModalOpen(false);
        }}
      />

      {/* Category Modal */}

      <CategoryModal
        open={categoryModalOpen}
        category={
          selectedCategory
            ? selectedCategory
            : null
        }
        onClose={() => {
          setSelectedCategory(null);
          setCategoryModalOpen(false);
        }}
        onSave={async (payload) => {
          if (selectedCategory) {
            await updateCategory(
              selectedCategory.id,
              payload
            );
          } else {
            await createCategory({
              ...payload,
              type: categoryType,
            });
          }

          setCategoryModalOpen(false);
        }}
      />

      {/* Delete */}

      <DeleteConfirmModal
        open={deleteOpen}
        title={
          deleteType === "account"
            ? "Delete Account"
            : "Delete Category"
        }
        itemName={
          deleteType === "account"
            ? selectedAccount?.name
            : selectedCategory?.name
        }
        message="This action cannot be undone."
        onClose={() => {
          setDeleteOpen(false);
          setSelectedAccount(null);
          setSelectedCategory(null);
        }}
        onConfirm={async () => {
          if (
            deleteType === "account" &&
            selectedAccount
          ) {
            await deleteAccount(selectedAccount.id);
          }

          if (
            deleteType === "category" &&
            selectedCategory
          ) {
            await deleteCategory(selectedCategory.id);
          }

          setDeleteOpen(false);
          setSelectedAccount(null);
          setSelectedCategory(null);
        }}
      />

      {(accountsLoading || categoriesLoading) && (
        <div className="text-center text-slate-400">
          Loading...
        </div>
      )}
    </div>
  );
}