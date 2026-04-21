import { apiClient } from "@/shared/api/client";
import type {
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from "@/features/auth/model/types";

export async function registerUser(
  payload: RegisterRequest,
): Promise<CurrentUser> {
  const response = await apiClient.post<CurrentUser>("/auth/register", payload);
  return response.data;
}

export async function loginUser(
  payload: LoginRequest,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/login", payload);
  return response.data;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiClient.get<CurrentUser>("/auth/me");
  return response.data;
}