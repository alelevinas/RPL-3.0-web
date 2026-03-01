import { request } from "@/lib/request";
import type { Student } from "@/types";

const BASE = process.env.NEXT_PUBLIC_USERS_API_BASE_URL || "http://localhost:8000/api/v3";

export const getAll = (): Promise<Student[]> =>
  request({ url: `${BASE}/users`, method: "GET" });

export const get = (userId: number): Promise<Student> =>
  request({ url: `${BASE}/users/${userId}`, method: "GET" });

export const deleteUser = (userId: number) =>
  request({ url: `${BASE}/users/${userId}`, method: "DELETE" });
