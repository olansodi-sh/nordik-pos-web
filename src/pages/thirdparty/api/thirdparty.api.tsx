import { httpClient } from "@/services/http/httpClient";

export type DocType = "CC" | "NIT" | "CE" | "PASSPORT";
export type CustomerSource = "pos" | "ecommerce";

export interface Customer {
  id: string;
  name: string;
  docType: DocType | null;
  docNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  source: CustomerSource;
  defaultPriceListId: string | null;
  loyaltyPoints: number;
  balance: number;
  active: boolean;
}

export interface CreateCustomerPayload {
  name: string;
  docType?: DocType;
  docNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: CustomerSource;
  defaultPriceListId?: string;
}

export type UpdateCustomerPayload = Partial<Omit<CreateCustomerPayload, "source">>;

export interface Supplier {
  id: string;
  name: string;
  docType: DocType | null;
  docNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

export interface CreateSupplierPayload {
  name: string;
  docType?: DocType;
  docNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;

export class CustomersApi {
  static async list(): Promise<Customer[]> {
    const { data } = await httpClient.get<Customer[]>("/customers");
    return data;
  }

  static async create(payload: CreateCustomerPayload): Promise<Customer> {
    const { data } = await httpClient.post<Customer>("/customers", payload);
    return data;
  }

  static async update(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
    const { data } = await httpClient.patch<Customer>(`/customers/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/customers/${id}`);
  }
}

export class SuppliersApi {
  static async list(): Promise<Supplier[]> {
    const { data } = await httpClient.get<Supplier[]>("/suppliers");
    return data;
  }

  static async create(payload: CreateSupplierPayload): Promise<Supplier> {
    const { data } = await httpClient.post<Supplier>("/suppliers", payload);
    return data;
  }

  static async update(id: string, payload: UpdateSupplierPayload): Promise<Supplier> {
    const { data } = await httpClient.patch<Supplier>(`/suppliers/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/suppliers/${id}`);
  }
}
