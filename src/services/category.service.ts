import { supabase } from "../lib/supabase";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: "income" | "expense";
}

class CategoryService {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;

    return data;
  }

  async getIncomeCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("type", "income")
      .order("name");

    if (error) throw error;

    return data;
  }

  async getExpenseCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("type", "expense")
      .order("name");

    if (error) throw error;

    return data;
  }

  async getCategory(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async createCategory(payload: CreateCategoryPayload) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("categories")
      .insert({
        ...payload,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateCategory(
    id: string,
    payload: Partial<CreateCategoryPayload>
  ) {
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const categoryService = new CategoryService();