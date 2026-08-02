import { httpClient } from "@/services/http/httpClient";

export interface PriceList {
  id: string;
  name: string;
  isDefault: boolean;
  active: boolean;
}

export interface CreatePriceListPayload {
  name: string;
}

export interface PriceListItem {
  id: string;
  priceListId: string;
  variantId: string | null;
  productId: string | null;
  price: number;
}

export interface SetPriceListItemPayload {
  variantId?: string;
  productId?: string;
  price: number;
}

export type PromotionType = "percentage" | "fixed_amount" | "buy_x_get_y";
export type PromotionScope = "all" | "category" | "product" | "variant";
export type PromotionTargetType = "category" | "product" | "variant";

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  scope: PromotionScope;
  value: number | null;
  conditions: { buyQty: number; getQty: number } | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
}

export interface PromotionTarget {
  promotionId: string;
  targetType: PromotionTargetType;
  targetId: string;
}

export interface CreatePromotionPayload {
  name: string;
  type: PromotionType;
  scope?: PromotionScope;
  value?: number;
  conditions?: { buyQty: number; getQty: number };
  startDate?: string;
  endDate?: string;
  targets?: { targetType: PromotionTargetType; targetId: string }[];
}

export class PriceListsApi {
  static async list(): Promise<PriceList[]> {
    const { data } = await httpClient.get<PriceList[]>("/price-lists");
    return data;
  }

  static async items(id: string): Promise<PriceListItem[]> {
    const { data } = await httpClient.get<PriceListItem[]>(`/price-lists/${id}/items`);
    return data;
  }

  static async create(payload: CreatePriceListPayload): Promise<PriceList> {
    const { data } = await httpClient.post<PriceList>("/price-lists", payload);
    return data;
  }

  static async setItem(id: string, payload: SetPriceListItemPayload): Promise<PriceListItem> {
    const { data } = await httpClient.post<PriceListItem>(`/price-lists/${id}/items`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/price-lists/${id}`);
  }
}

export class PromotionsApi {
  static async list(): Promise<Promotion[]> {
    const { data } = await httpClient.get<Promotion[]>("/promotions");
    return data;
  }

  static async targets(id: string): Promise<PromotionTarget[]> {
    const { data } = await httpClient.get<PromotionTarget[]>(`/promotions/${id}/targets`);
    return data;
  }

  static async create(payload: CreatePromotionPayload): Promise<Promotion> {
    const { data } = await httpClient.post<Promotion>("/promotions", payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/promotions/${id}`);
  }
}
