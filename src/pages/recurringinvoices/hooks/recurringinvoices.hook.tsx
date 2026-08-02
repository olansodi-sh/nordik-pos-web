import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import { RecurringInvoicesApi, type RecurringInvoice } from "@/pages/recurringinvoices/api/recurringinvoices.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useRecurringInvoices() {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRecurringInvoices(await RecurringInvoicesApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { recurringInvoices, loading, error, refetch };
}
