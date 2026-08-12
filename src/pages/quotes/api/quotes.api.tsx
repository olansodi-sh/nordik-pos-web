import { httpClient } from "@/services/http/httpClient";
import type { Sale } from "@/pages/sales/api/sales.api";

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "converted";

export interface Quote {
  id: string;
  number: string;
  customerId: string | null;
  status: QuoteStatus;
  validUntil: string | null;
  subtotal: number;
  discount: number;
  total: number;
  saleId: string | null;
}

export interface QuoteLine {
  id: string;
  quoteId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface CreateQuoteLinePayload {
  productId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreateQuotePayload {
  customerId?: string;
  validUntil?: string;
  lines: CreateQuoteLinePayload[];
}

export interface ConvertQuotePayload {
  warehouseId: string;
  cashSessionId?: string;
}

export class QuotesApi {
  static async list(): Promise<Quote[]> {
    const { data } = await httpClient.get<Quote[]>("/quotes");
    return data;
  }

  static async lines(id: string): Promise<QuoteLine[]> {
    const { data } = await httpClient.get<QuoteLine[]>(`/quotes/${id}/lines`);
    return data;
  }

  static async create(payload: CreateQuotePayload): Promise<Quote> {
    const { data } = await httpClient.post<Quote>("/quotes", payload);
    return data;
  }

  static async updateStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const { data } = await httpClient.patch<Quote>(`/quotes/${id}/status`, { status });
    return data;
  }

  static async convert(id: string, payload: ConvertQuotePayload): Promise<Sale> {
    const { data } = await httpClient.post<Sale>(`/quotes/${id}/convert`, payload);
    return data;
  }
}
