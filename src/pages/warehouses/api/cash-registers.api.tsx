import { httpClient } from "@/services/http/httpClient";

export interface CashRegister {
  id: string;
  warehouseId: string;
  name: string;
  active: boolean;
}

export interface CreateCashRegisterPayload {
  warehouseId: string;
  name: string;
}

export interface UpdateCashRegisterPayload {
  name?: string;
  active?: boolean;
}

export class CashRegistersApi {
  static async list(warehouseId?: string): Promise<CashRegister[]> {
    const { data } = await httpClient.get<CashRegister[]>("/cash-registers", {
      params: { warehouseId },
    });
    return data;
  }

  static async create(payload: CreateCashRegisterPayload): Promise<CashRegister> {
    const { data } = await httpClient.post<CashRegister>("/cash-registers", payload);
    return data;
  }

  static async update(id: string, payload: UpdateCashRegisterPayload): Promise<CashRegister> {
    const { data } = await httpClient.patch<CashRegister>(`/cash-registers/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/cash-registers/${id}`);
  }
}
