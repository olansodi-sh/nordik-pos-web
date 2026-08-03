import { httpClient } from "@/services/http/httpClient";

export interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  userId: string | null;
  date: string;
}

export interface CreateExpensePayload {
  category: string;
  description?: string;
  amount: number;
  date?: string;
}

export interface ExpensesSummary {
  total: number;
  byCategory: { category: string; total: number }[];
}

export class ExpensesApi {
  static async list(from?: string, to?: string): Promise<Expense[]> {
    const { data } = await httpClient.get<Expense[]>("/expenses", { params: { from, to } });
    return data;
  }

  static async summary(from?: string, to?: string): Promise<ExpensesSummary> {
    const { data } = await httpClient.get<ExpensesSummary>("/expenses/summary", { params: { from, to } });
    return data;
  }

  static async create(payload: CreateExpensePayload): Promise<Expense> {
    const { data } = await httpClient.post<Expense>("/expenses", payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/expenses/${id}`);
  }
}
