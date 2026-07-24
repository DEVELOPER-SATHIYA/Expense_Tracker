import { supabase } from "../lib/supabase";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;

  amount: number;

  type: "income" | "expense";

  payment_method: string | null;

  notes: string | null;

  transaction_date: string;

  created_at: string;

  updated_at: string;
}

export interface CreateTransactionPayload {
  account_id: string;
  category_id: string;

  amount: number;

  type: "income" | "expense";

  payment_method?: string;

  notes?: string;

  transaction_date: string;
}

class TransactionService {
  async getTransactions(accountId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
      *,
      accounts(name,type),
      categories(name,type)
  `)
      .eq("account_id", accountId)
      .order("transaction_date", {
        ascending: false,
      });

    if (error) throw error;

    return data as Transaction[];
  }

  async getTransaction(id: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        accounts(name,type),
        categories(name,type)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async createTransaction(
    payload: CreateTransactionPayload
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...payload,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateTransaction(
    id: string,
    payload: Partial<CreateTransactionPayload>
  ) {
    const { data, error } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getTransactionsByAccount(accountId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("account_id", accountId)
      .order("transaction_date", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  }

  async getTransactionsByCategory(
    accountId: string,
    categoryId: string
) {
   const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .eq("category_id", categoryId);

    if (error) throw error;

    return data;
  }

  async getTransactionsByType(
    accountId: string,
    type: "income" | "expense"
  ) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("account_id", accountId)
      .eq("type", type)

    if (error) throw error;

    return data;
  }


  async getTransactionsBetweenDates(
    start: string,
    end: string,
    accountId: string,
  ) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("transaction_date", start)
      .lte("transaction_date", end)
      .eq("account_id", accountId)
      .order("transaction_date", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  }

  async getDashboardSummary(accountId: string) {
    const transactions =
      await this.getTransactions(accountId);

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expense,
      balance: income - expense,
      totalTransactions: transactions.length,
    };
  }
}

export const transactionService =
  new TransactionService();