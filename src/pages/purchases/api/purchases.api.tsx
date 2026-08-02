import { httpClient } from "@/services/http/httpClient";

export type PurchaseOrderStatus = "draft" | "sent" | "received" | "cancelled";

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  warehouseId: string;
  status: PurchaseOrderStatus;
  total: number;
  date: string;
}

export interface PurchaseLineInput {
  variantId?: string;
  productId?: string;
  description?: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseLine {
  id: string;
  variantId: string | null;
  productId: string | null;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  warehouseId: string;
  date?: string;
  lines: PurchaseLineInput[];
}

export type PurchaseInvoiceDocumentType = "invoice" | "support_document";

export interface PurchaseInvoice {
  id: string;
  number: string;
  documentType: PurchaseInvoiceDocumentType;
  supplierId: string;
  warehouseId: string;
  purchaseOrderId: string | null;
  supplierDocNumber: string | null;
  total: number;
  date: string;
}

export interface CreatePurchaseInvoicePayload {
  documentType: PurchaseInvoiceDocumentType;
  supplierId: string;
  warehouseId: string;
  purchaseOrderId?: string;
  supplierDocNumber?: string;
  date?: string;
  lines: PurchaseLineInput[];
}

export interface DebitNote {
  id: string;
  number: string;
  supplierId: string;
  purchaseInvoiceId: string | null;
  amount: number;
  reason: string | null;
  date: string;
}

export interface CreateDebitNotePayload {
  supplierId: string;
  purchaseInvoiceId?: string;
  amount: number;
  reason?: string;
  date?: string;
}

export class PurchaseOrdersApi {
  static async list(): Promise<PurchaseOrder[]> {
    const { data } = await httpClient.get<PurchaseOrder[]>("/purchase-orders");
    return data;
  }

  static async lines(id: string): Promise<PurchaseLine[]> {
    const { data } = await httpClient.get<PurchaseLine[]>(`/purchase-orders/${id}/lines`);
    return data;
  }

  static async create(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
    const { data } = await httpClient.post<PurchaseOrder>("/purchase-orders", payload);
    return data;
  }

  static async updateStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
    const { data } = await httpClient.patch<PurchaseOrder>(`/purchase-orders/${id}/status`, { status });
    return data;
  }
}

export class PurchaseInvoicesApi {
  static async list(): Promise<PurchaseInvoice[]> {
    const { data } = await httpClient.get<PurchaseInvoice[]>("/purchase-invoices");
    return data;
  }

  static async lines(id: string): Promise<PurchaseLine[]> {
    const { data } = await httpClient.get<PurchaseLine[]>(`/purchase-invoices/${id}/lines`);
    return data;
  }

  static async create(payload: CreatePurchaseInvoicePayload): Promise<PurchaseInvoice> {
    const { data } = await httpClient.post<PurchaseInvoice>("/purchase-invoices", payload);
    return data;
  }
}

export class DebitNotesApi {
  static async list(): Promise<DebitNote[]> {
    const { data } = await httpClient.get<DebitNote[]>("/debit-notes");
    return data;
  }

  static async create(payload: CreateDebitNotePayload): Promise<DebitNote> {
    const { data } = await httpClient.post<DebitNote>("/debit-notes", payload);
    return data;
  }
}
