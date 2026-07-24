import { useEffect, useState } from "react";

import { categoryService } from "../services/category.service";

import type {
  Category,
  CreateCategoryPayload,
} from "../services/category.service";

export function useCategories() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);

      const data =
        await categoryService.getCategories();

      setCategories(data);

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    categories,

    loading,

    error,

    refresh: load,

    createCategory: async (
      payload: CreateCategoryPayload
    ) => {
      await categoryService.createCategory(payload);

      await load();
    },

    updateCategory: async (
      id: string,
      payload: Partial<CreateCategoryPayload>
    ) => {
      await categoryService.updateCategory(id, payload);

      await load();
    },

    deleteCategory: async (id: string) => {
      await categoryService.deleteCategory(id);

      await load();
    },
  };
}