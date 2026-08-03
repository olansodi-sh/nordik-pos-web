import { httpClient } from "@/services/http/httpClient";

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  active: boolean;
}

export interface CreateWarehousePayload {
  name: string;
  location?: string;
}

export interface Stock {
  id: string;
  variantId: string | null;
  productId: string | null;
  warehouseId: string;
  quantity: number;
}

export type StockAdjustMode = "set" | "add";

export interface AdjustStockPayload {
  warehouseId: string;
  variantId?: string;
  productId?: string;
  quantity: number;
  mode: StockAdjustMode;
}

export type StockMovementType =
  | "initial"
  | "sale"
  | "sale_void"
  | "purchase"
  | "credit_note_restock"
  | "adjustment_set"
  | "adjustment_add"
  | "count";

export interface StockMovement {
  id: string;
  variantId: string | null;
  productId: string | null;
  warehouseId: string;
  quantityDelta: number;
  quantityAfter: number;
  type: StockMovementType;
  reason: string | null;
  refType: string | null;
  refId: string | null;
  userId: string | null;
  date: string;
}

export interface StockMovementFilters {
  warehouseId?: string;
  variantId?: string;
  productId?: string;
  type?: StockMovementType;
  from?: string;
  to?: string;
}

export interface ApplyStockCountPayload {
  warehouseId: string;
  variantId?: string;
  productId?: string;
  countedQuantity: number;
  reason?: string;
}

export class WarehousesApi {
  static async list(): Promise<Warehouse[]> {
    const { data } = await httpClient.get<Warehouse[]>("/warehouses");
    return data;
  }

  static async create(payload: CreateWarehousePayload): Promise<Warehouse> {
    const { data } = await httpClient.post<Warehouse>("/warehouses", payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/warehouses/${id}`);
  }
}

export class StockApi {
  static async list(warehouseId: string): Promise<Stock[]> {
    const { data } = await httpClient.get<Stock[]>("/stock", { params: { warehouseId } });
    return data;
  }

  static async adjust(payload: AdjustStockPayload): Promise<Stock> {
    const { data } = await httpClient.post<Stock>("/stock/adjust", payload);
    return data;
  }

  static async movements(filters: StockMovementFilters): Promise<StockMovement[]> {
    const { data } = await httpClient.get<StockMovement[]>("/stock/movements", { params: filters });
    return data;
  }

  static async applyCount(payload: ApplyStockCountPayload): Promise<Stock> {
    const { data } = await httpClient.post<Stock>("/stock/count", payload);
    return data;
  }
}
