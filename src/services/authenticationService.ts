import { request } from "@/lib/request";

const BASE = process.env.NEXT_PUBLIC_USERS_API_BASE_URL || "http://localhost:8000/api/v3";

export const login = (credentials: { username: string; password: string }) =>
  request({ url: `${BASE}/auth/login`, body: JSON.stringify(credentials), method: "POST" });

export const signup = (user: Record<string, unknown>) =>
  request({ url: `${BASE}/auth/signup`, body: JSON.stringify(user), method: "POST" });

export const getProfile = () =>
  request({ url: `${BASE}/auth/profile`, method: "GET" });

export const updateProfile = (data: Record<string, unknown>) =>
  request({ url: `${BASE}/auth/profile`, body: JSON.stringify(data), method: "PATCH" });

export const forgotPassword = (email: string) =>
  request({ url: `${BASE}/auth/forgotPassword`, body: JSON.stringify({ email }), method: "POST" });

export const resetPassword = (token: string, password: string) =>
  request({ url: `${BASE}/auth/resetPassword`, body: JSON.stringify({ token, new_password: password }), method: "POST" });

export const validateEmailToken = (token: string) =>
  request({ url: `${BASE}/auth/validateEmail`, body: JSON.stringify({ token }), method: "POST" });

export const resendEmailToken = (user: string) =>
  request({ url: `${BASE}/auth/resendValidationEmail`, body: JSON.stringify({ username_or_email: user }), method: "POST" });

export const getRoles = () =>
  request({ url: `${BASE}/auth/roles`, method: "GET" });

export const getUniversities = (): Promise<string[]> =>
  request({ url: `${BASE}/auth/universities`, method: "GET" });
