import { httpClient } from "@/services/http/httpClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  userId: string;
  businessId?: string;
  membershipId?: string;
  email: string;
  name: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface MembershipOption {
  businessId: string;
  businessName: string;
}

export interface FullLoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    businessId: string;
  };
}

export interface TenantSelectionRequiredResponse {
  accessToken: string;
  requiresTenantSelection: true;
  memberships: MembershipOption[];
}

export type LoginResponse = FullLoginResponse | TenantSelectionRequiredResponse;

export class LoginApi {
  static async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>("/auth/login", payload);
    return data;
  }

  static async selectTenant(businessId: string): Promise<FullLoginResponse> {
    const { data } = await httpClient.post<FullLoginResponse>("/auth/select-tenant", { businessId });
    return data;
  }

  static async me(): Promise<AuthenticatedUser> {
    const { data } = await httpClient.get<AuthenticatedUser>("/auth/me");
    return data;
  }

  static async myMenuAccess(): Promise<Record<string, boolean>> {
    const { data } = await httpClient.get<Record<string, boolean>>("/menu/my-access");
    return data;
  }

  static async myMemberships(): Promise<MembershipOption[]> {
    const { data } = await httpClient.get<MembershipOption[]>("/auth/my-memberships");
    return data;
  }
}
