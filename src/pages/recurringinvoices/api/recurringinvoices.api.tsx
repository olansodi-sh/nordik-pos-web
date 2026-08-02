import { httpClient } from "@/services/http/httpClient";

export type RecurringInvoiceFrequency = "weekly" | "monthly";

export interface RecurringInvoiceLine {
  variantId?: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
}

export interface RecurringInvoice {
  id: string;
  name: string;
  customerId: string | null;
  warehouseId: string;
  frequency: RecurringInvoiceFrequency;
  nextRun: string;
  active: boolean;
  lines: RecurringInvoiceLine[];
}

export interface CreateRecurringInvoicePayload {
  name: string;
  customerId?: string;
  warehouseId: string;
  frequency: RecurringInvoiceFrequency;
  nextRun: string;
  lines: RecurringInvoiceLine[];
}

export type UpdateRecurringInvoicePayload = Partial<CreateRecurringInvoicePayload> & {
  active?: boolean;
};

export class RecurringInvoicesApi {
  static async list(): Promise<RecurringInvoice[]> {
    const { data } = await httpClient.get<RecurringInvoice[]>("/recurring-invoices");
    return data;
  }

  static async create(payload: CreateRecurringInvoicePayload): Promise<RecurringInvoice> {
    const { data } = await httpClient.post<RecurringInvoice>("/recurring-invoices", payload);
    return data;
  }

  static async update(id: string, payload: UpdateRecurringInvoicePayload): Promise<RecurringInvoice> {
    const { data } = await httpClient.patch<RecurringInvoice>(`/recurring-invoices/${id}`, payload);
    return data;
  }

  static async advance(id: string): Promise<RecurringInvoice> {
    const { data } = await httpClient.post<RecurringInvoice>(`/recurring-invoices/${id}/advance`, {});
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/recurring-invoices/${id}`);
  }
}
