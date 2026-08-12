import { httpClient } from "@/services/http/httpClient";

export type CreditNoteType = "partial" | "total";

export interface CreditNote {
  id: string;
  number: string;
  saleId: string;
  customerId: string | null;
  type: CreditNoteType;
  amount: number;
  reason: string | null;
  restock: boolean;
  voucherId: string | null;
}

export interface RestockLineInput {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface CreateCreditNotePayload {
  saleId: string;
  customerId?: string;
  type: CreditNoteType;
  amount: number;
  reason?: string;
  restock?: boolean;
  restockLines?: RestockLineInput[];
  generateVoucher?: boolean;
}

export class CreditNotesApi {
  static async list(): Promise<CreditNote[]> {
    const { data } = await httpClient.get<CreditNote[]>("/credit-notes");
    return data;
  }

  static async create(payload: CreateCreditNotePayload): Promise<CreditNote> {
    const { data } = await httpClient.post<CreditNote>("/credit-notes", payload);
    return data;
  }
}
