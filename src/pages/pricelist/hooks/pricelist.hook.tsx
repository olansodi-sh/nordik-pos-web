import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import {
  PriceListsApi,
  PromotionsApi,
  type PriceList,
  type PriceListItem,
  type Promotion,
} from "@/pages/pricelist/api/pricelist.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function usePriceLists() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPriceLists(await PriceListsApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { priceLists, loading, error, refetch };
}

export function usePriceListItems(priceListId: string | null) {
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!priceListId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await PriceListsApi.items(priceListId));
    } finally {
      setLoading(false);
    }
  }, [priceListId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, loading, refetch };
}

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPromotions(await PromotionsApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { promotions, loading, error, refetch };
}
