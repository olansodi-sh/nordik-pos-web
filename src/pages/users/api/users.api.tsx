import { httpClient } from "@/services/http/httpClient";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  code: string;
  description: string | null;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionCodes?: string[];
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roleId: string | null;
  role: Role | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId?: string;
}

export interface UpdateUserPayload {
  name?: string;
  roleId?: string;
  active?: boolean;
  password?: string;
}

export class UsersApi {
  static async list(): Promise<AppUser[]> {
    const { data } = await httpClient.get<AppUser[]>("/users");
    return data;
  }

  static async create(payload: CreateUserPayload): Promise<AppUser> {
    const { data } = await httpClient.post<AppUser>("/users", payload);
    return data;
  }

  static async update(id: string, payload: UpdateUserPayload): Promise<AppUser> {
    const { data } = await httpClient.patch<AppUser>(`/users/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/users/${id}`);
  }
}

export class RolesApi {
  static async list(): Promise<Role[]> {
    const { data } = await httpClient.get<Role[]>("/roles");
    return data;
  }

  static async permissions(): Promise<Permission[]> {
    const { data } = await httpClient.get<Permission[]>("/permissions");
    return data;
  }

  static async create(payload: CreateRolePayload): Promise<Role> {
    const { data } = await httpClient.post<Role>("/roles", payload);
    return data;
  }

  static async update(id: string, payload: UpdateRolePayload): Promise<Role> {
    const { data } = await httpClient.patch<Role>(`/roles/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/roles/${id}`);
  }
}
