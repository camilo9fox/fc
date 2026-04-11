import { useState, useEffect } from "react";
import { flashCardsApi, Category, CreateCategoryRequest } from "../api/flashcards";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await flashCardsApi.getCategories();
      setCategories(response.categories);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryRequest) => {
    try {
      const newCategory = await flashCardsApi.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error creating category");
    }
  };

  const updateCategory = async (id: string, data: Partial<CreateCategoryRequest>) => {
    try {
      const updatedCategory = await flashCardsApi.updateCategory(id, data);
      setCategories(prev =>
        prev.map(cat => cat.id === id ? updatedCategory : cat)
      );
      return updatedCategory;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error updating category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await flashCardsApi.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Error deleting category");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};