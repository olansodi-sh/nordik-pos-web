import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import { ExpensesApi, type Expense, type ExpensesSummary } from "@/pages/expenses/api/expenses.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useExpenses(from?: string, to?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setExpenses(await ExpensesApi.list(from, to));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { expenses, loading, error, refetch };
}

export function useExpensesSummary(from?: string, to?: string) {
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await ExpensesApi.summary(from, to));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { summary, loading, refetch };
}
