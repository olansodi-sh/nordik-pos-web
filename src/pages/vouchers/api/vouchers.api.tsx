import { httpClient } from "@/services/http/httpClient";

export type VoucherStatus = "active" | "redeemed" | "expired";

export interface Voucher {
  id: string;
  code: string;
  customerId: string | null;
  amount: number;
  balance: number;
  status: VoucherStatus;
  reason: string | null;
  expiresAt: string | null;
}

export interface CreateVoucherPayload {
  customerId?: string;
  amount: number;
  reason?: string;
  expiresAt?: string;
}

export class VouchersApi {
  static async list(): Promise<Voucher[]> {
    const { data } = await httpClient.get<Voucher[]>("/vouchers");
    return data;
  }

  static async findByCode(code: string): Promise<Voucher> {
    const { data } = await httpClient.get<Voucher>(`/vouchers/by-code/${encodeURIComponent(code)}`);
    return data;
  }

  static async create(payload: CreateVoucherPayload): Promise<Voucher> {
    const { data } = await httpClient.post<Voucher>("/vouchers", payload);
    return data;
  }

  static async redeem(id: string, amount: number): Promise<Voucher> {
    const { data } = await httpClient.post<Voucher>(`/vouchers/${id}/redeem`, { amount });
    return data;
  }
}
