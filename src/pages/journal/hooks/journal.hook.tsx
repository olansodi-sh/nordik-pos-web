import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import { CashSessionsApi, type CashMovement, type CashSession } from "@/pages/pointofsale/api/pointofsale.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useCashSessionsHistory() {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await CashSessionsApi.list();
      setSessions([...data].sort((a, b) => b.openedAt.localeCompare(a.openedAt)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { sessions, loading, error, refetch };
}

export function useSessionMovements(sessionId: string | null) {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!sessionId) {
      setMovements([]);
      return;
    }
    setLoading(true);
    try {
      setMovements(await CashSessionsApi.movements(sessionId));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { movements, loading, refetch };
}
