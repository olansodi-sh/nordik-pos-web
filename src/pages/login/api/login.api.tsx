import { httpClient } from "@/services/http/httpClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  userId: string;
  businessId: string;
  email: string;
  name: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    businessId: string;
  };
}

export class LoginApi {
  static async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>("/auth/login", payload);
    return data;
  }

  static async me(): Promise<AuthenticatedUser> {
    const { data } = await httpClient.get<AuthenticatedUser>("/auth/me");
    return data;
  }
}
