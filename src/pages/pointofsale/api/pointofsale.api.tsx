import { httpClient } from "@/services/http/httpClient";

export type CashSessionStatus = "open" | "closed";

export interface CashSession {
  id: string;
  userId: string;
  warehouseId: string | null;
  openingAmount: number;
  countedAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  status: CashSessionStatus;
  openedAt: string;
  closedAt: string | null;
}

export interface OpenCashSessionPayload {
  warehouseId?: string;
  openingAmount: number;
}

export interface CloseCashSessionPayload {
  countedAmount: number;
}

export type CashMovementType = "in" | "out";

export interface CashMovement {
  id: string;
  sessionId: string;
  type: CashMovementType;
  amount: number;
  concept: string;
}

export interface CreateCashMovementPayload {
  type: CashMovementType;
  amount: number;
  concept: string;
}

export class CashSessionsApi {
  static async list(): Promise<CashSession[]> {
    const { data } = await httpClient.get<CashSession[]>("/cash-sessions");
    return data;
  }

  static async findOpen(): Promise<CashSession | null> {
    const { data } = await httpClient.get<CashSession | null>("/cash-sessions/open");
    return data;
  }

  static async movements(sessionId: string): Promise<CashMovement[]> {
    const { data } = await httpClient.get<CashMovement[]>(`/cash-sessions/${sessionId}/movements`);
    return data;
  }

  static async open(payload: OpenCashSessionPayload): Promise<CashSession> {
    const { data } = await httpClient.post<CashSession>("/cash-sessions/open", payload);
    return data;
  }

  static async close(id: string, payload: CloseCashSessionPayload): Promise<CashSession> {
    const { data } = await httpClient.post<CashSession>(`/cash-sessions/${id}/close`, payload);
    return data;
  }

  static async addMovement(id: string, payload: CreateCashMovementPayload): Promise<CashMovement> {
    const { data } = await httpClient.post<CashMovement>(`/cash-sessions/${id}/movements`, payload);
    return data;
  }
}
