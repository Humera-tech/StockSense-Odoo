import type { SignupPayload, TokenResponse, User } from "../types/auth";
import { api } from "./api";

export const authService = {
  login: (email: string, password: string) =>
    api<TokenResponse>("/auth/login", { method: "POST", body: { email, password } }),
  signup: (payload: SignupPayload) => api<User>("/auth/signup", { method: "POST", body: payload }),
  me: () => api<User>("/auth/me"),
  forgot: (email: string) =>
    api<{ message: string; dev_otp: string | null }>("/auth/forgot", { method: "POST", body: { email } }),
  reset: (payload: { email: string; otp: string; password: string; confirm_password: string }) =>
    api<{ message: string }>("/auth/reset", { method: "POST", body: payload }),
};
