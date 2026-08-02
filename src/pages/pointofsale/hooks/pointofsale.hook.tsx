import { useCallback, useEffect, useState } from "react";
import { CashSessionsApi, type CashSession } from "@/pages/pointofsale/api/pointofsale.api";

export function useCashSession() {
  const [session, setSession] = useState<CashSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setSession(await CashSessionsApi.findOpen());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { session, loading, refetch };
}
