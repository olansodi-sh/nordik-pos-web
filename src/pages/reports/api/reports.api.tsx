import { httpClient } from "@/services/http/httpClient";

export interface SalesSummary {
  count: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface TopCustomerRow {
  customerId: string;
  orderCount: number;
  totalSpent: number;
}

export interface InventoryValuationRow {
  warehouseId: string;
  totalUnits: number;
  totalValue: number;
}

export interface DateRange {
  from?: string;
  to?: string;
}

export class ReportsApi {
  static async salesSummary(range: DateRange): Promise<SalesSummary> {
    const { data } = await httpClient.get<SalesSummary>("/reports/sales-summary", { params: range });
    return data;
  }

  static async topCustomers(range: DateRange, limit?: number): Promise<TopCustomerRow[]> {
    const { data } = await httpClient.get<TopCustomerRow[]>("/reports/top-customers", {
      params: { ...range, limit },
    });
    return data;
  }

  static async inventoryValuation(): Promise<InventoryValuationRow[]> {
    const { data } = await httpClient.get<InventoryValuationRow[]>("/reports/inventory-valuation");
    return data;
  }
}

export interface LoyaltySettings {
  businessId: string;
  pointsPerAmount: number;
  amountUnit: number;
  enabled: boolean;
}

export interface UpdateLoyaltySettingsPayload {
  pointsPerAmount?: number;
  amountUnit?: number;
  enabled?: boolean;
}

export type LoyaltyTransactionType = "earned" | "redeemed" | "adjustment" | "expired";

export interface LoyaltyPointTransaction {
  id: string;
  customerId: string;
  saleId: string | null;
  points: number;
  type: LoyaltyTransactionType;
  description: string | null;
  date: string;
}

export interface AdjustLoyaltyPointsPayload {
  customerId: string;
  points: number;
  description?: string;
}

export class LoyaltyApi {
  static async getSettings(): Promise<LoyaltySettings> {
    const { data } = await httpClient.get<LoyaltySettings>("/loyalty/settings");
    return data;
  }

  static async updateSettings(payload: UpdateLoyaltySettingsPayload): Promise<LoyaltySettings> {
    const { data } = await httpClient.patch<LoyaltySettings>("/loyalty/settings", payload);
    return data;
  }

  static async transactionsByCustomer(customerId: string): Promise<LoyaltyPointTransaction[]> {
    const { data } = await httpClient.get<LoyaltyPointTransaction[]>(
      `/loyalty/customers/${customerId}/transactions`,
    );
    return data;
  }

  static async adjust(payload: AdjustLoyaltyPointsPayload): Promise<LoyaltyPointTransaction> {
    const { data } = await httpClient.post<LoyaltyPointTransaction>("/loyalty/adjust", payload);
    return data;
  }
}
