import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import { StockApi, WarehousesApi, type Stock, type Warehouse } from "@/pages/warehouses/api/warehouses.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setWarehouses(await WarehousesApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { warehouses, loading, error, refetch };
}

export function useStock(warehouseId: string | null) {
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!warehouseId) {
      setStock([]);
      return;
    }
    setLoading(true);
    try {
      setStock(await StockApi.list(warehouseId));
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { stock, loading, refetch };
}
