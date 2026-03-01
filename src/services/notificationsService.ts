import { request } from "@/lib/request";
import type { Notification } from "@/types";

const BASE = process.env.NEXT_PUBLIC_USERS_API_BASE_URL || "http://localhost:8000/api/v3";

export const getAll = (): Promise<Notification[]> =>
  request({ url: `${BASE}/notifications`, method: "GET" });

export const markAsRead = (notificationId: number) =>
  request({ url: `${BASE}/notifications/${notificationId}/read`, method: "PUT" });
