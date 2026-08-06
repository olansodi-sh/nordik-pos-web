import { httpClient } from "@/services/http/httpClient";

export interface Business {
  id: string;
  name: string;
  taxId: string | null;
  active: boolean;
}

export interface UpdateBusinessPayload {
  name?: string;
  taxId?: string;
  active?: boolean;
}

export interface CreateBusinessAdminPayload {
  name: string;
  email: string;
  password: string;
}

export interface CreateBusinessPayload {
  name: string;
  taxId?: string;
  admins: CreateBusinessAdminPayload[];
}

export class BusinessApi {
  static async me(): Promise<Business> {
    const { data } = await httpClient.get<Business>("/businesses/me");
    return data;
  }

  static async update(payload: UpdateBusinessPayload): Promise<Business> {
    const { data } = await httpClient.patch<Business>("/businesses/me", payload);
    return data;
  }

  // Los siguientes solo funcionan si el usuario autenticado es superadministrador.
  static async list(): Promise<Business[]> {
    const { data } = await httpClient.get<Business[]>("/businesses");
    return data;
  }

  static async create(payload: CreateBusinessPayload): Promise<Business> {
    const { data } = await httpClient.post<Business>("/businesses", payload);
    return data;
  }

  static async updateById(id: string, payload: UpdateBusinessPayload): Promise<Business> {
    const { data } = await httpClient.patch<Business>(`/businesses/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/businesses/${id}`);
  }
}
