import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import {
  StockApi,
  WarehousesApi,
  type Stock,
  type StockMovement,
  type StockMovementFilters,
  type Warehouse,
} from "@/pages/warehouses/api/warehouses.api";
import { CashRegistersApi, type CashRegister } from "@/pages/warehouses/api/cash-registers.api";

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

export function useCashRegisters(warehouseId?: string) {
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRegisters(await CashRegistersApi.list(warehouseId));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { registers, loading, error, refetch };
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

export function useStockMovements(filters: StockMovementFilters, enabled: boolean) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setMovements([]);
      return;
    }
    setLoading(true);
    try {
      setMovements(await StockApi.movements(filters));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    filters.warehouseId,
    filters.productId,
    filters.variantId,
    filters.type,
    filters.from,
    filters.to,
  ]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { movements, loading, refetch };
}
