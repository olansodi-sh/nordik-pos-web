import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import { SalesApi, type Sale, type SaleLine } from "@/pages/sales/api/sales.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSales(await SalesApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { sales, loading, error, refetch };
}

export function useSaleLines(saleId: string | null) {
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!saleId) {
      setLines([]);
      return;
    }
    setLoading(true);
    try {
      setLines(await SalesApi.lines(saleId));
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { lines, loading, refetch };
}
