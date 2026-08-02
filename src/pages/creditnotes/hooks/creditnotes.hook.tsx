import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import { CreditNotesApi, type CreditNote } from "@/pages/creditnotes/api/creditnotes.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useCreditNotes() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCreditNotes(await CreditNotesApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { creditNotes, loading, error, refetch };
}
