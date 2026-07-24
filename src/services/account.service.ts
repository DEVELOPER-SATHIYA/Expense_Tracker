import { supabase } from "../lib/supabase";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: "personal" | "business";
  created_at: string;
  updated_at: string;
}

export interface CreateAccountPayload {
  name: string;
  type: "personal" | "business";
}

class AccountService {
  async getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data;
  }

  async getAccount(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async createAccount(payload: CreateAccountPayload) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("accounts")
      .insert({
        ...payload,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateAccount(
    id: string,
    payload: Partial<CreateAccountPayload>
  ) {
    const { data, error } = await supabase
      .from("accounts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteAccount(id: string) {
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const accountService = new AccountService();


