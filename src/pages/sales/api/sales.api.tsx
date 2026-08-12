import { httpClient } from "@/services/http/httpClient";

export type SalesChannel = "pos" | "ecommerce";
export type SaleStatus = "confirmed" | "partial" | "paid" | "cancelled";

export interface Sale {
  id: string;
  number: string;
  channel: SalesChannel;
  customerId: string | null;
  priceListId: string | null;
  warehouseId: string;
  userId: string;
  cashSessionId: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: SaleStatus;
  date: string;
  label: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: string | null;
}

export interface SaleLine {
  id: string;
  saleId: string;
  variantId: string | null;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface CreateSaleLinePayload {
  variantId?: string;
  productId?: string;
  quantity: number;
  unitPrice?: number;
  discount?: number;
}

export interface CreateSalePayload {
  channel?: SalesChannel;
  customerId?: string;
  priceListId?: string;
  warehouseId: string;
  cashSessionId?: string;
  label?: string;
  customFields?: Record<string, unknown>;
  lines: CreateSaleLinePayload[];
}

export type PaymentMethod = "cash" | "card" | "transfer" | "voucher" | "credit" | "online_gateway";

export interface CreatePaymentPayload {
  customerId?: string;
  method: PaymentMethod;
  amount: number;
  cashSessionId?: string;
  allocations: { saleId: string; amount: number }[];
}

export interface Payment {
  id: string;
  customerId: string | null;
  method: PaymentMethod;
  amount: number;
  date: string;
}

export class SalesApi {
  static async list(): Promise<Sale[]> {
    const { data } = await httpClient.get<Sale[]>("/sales");
    return data;
  }

  static async findOne(id: string): Promise<Sale> {
    const { data } = await httpClient.get<Sale>(`/sales/${id}`);
    return data;
  }

  static async lines(id: string): Promise<SaleLine[]> {
    const { data } = await httpClient.get<SaleLine[]>(`/sales/${id}/lines`);
    return data;
  }

  static async create(payload: CreateSalePayload): Promise<Sale> {
    const { data } = await httpClient.post<Sale>("/sales", payload);
    return data;
  }

  static async addLines(id: string, lines: CreateSaleLinePayload[]): Promise<Sale> {
    const { data } = await httpClient.post<Sale>(`/sales/${id}/lines`, { lines });
    return data;
  }

  static async void(id: string, reason: string): Promise<Sale> {
    const { data } = await httpClient.post<Sale>(`/sales/${id}/void`, { reason });
    return data;
  }
}

export class PaymentsApi {
  static async create(payload: CreatePaymentPayload): Promise<Payment> {
    const { data } = await httpClient.post<Payment>("/payments", payload);
    return data;
  }
}
