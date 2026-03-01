import { request } from "@/lib/request";
import type { Activity, Category } from "@/types";

const BASE = process.env.NEXT_PUBLIC_ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3";

export const create = (courseId: number, data: Record<string, unknown>) =>
  request({ url: `${BASE}/courses/${courseId}/activities`, body: JSON.stringify(data), method: "POST" });

export const edit = (courseId: number, activityId: number, data: Record<string, unknown>) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}`, body: JSON.stringify(data), method: "PUT" });

export const get = (courseId: number, activityId: number): Promise<Activity> =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}`, method: "GET" });

export const getAll = (courseId: number): Promise<Activity[]> =>
  request({ url: `${BASE}/courses/${courseId}/activities`, method: "GET" });

export const deleteActivity = (courseId: number, activityId: number) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}`, method: "DELETE" });

export const getCategories = (courseId: number): Promise<Category[]> =>
  request({ url: `${BASE}/courses/${courseId}/activity_categories`, method: "GET" });

export const createCategory = (courseId: number, data: { name: string; description?: string }) =>
  request({ url: `${BASE}/courses/${courseId}/activity_categories`, body: JSON.stringify(data), method: "POST" });

export const editCategory = (courseId: number, categoryId: number, data: { name: string; description?: string; active?: boolean }) =>
  request({ url: `${BASE}/courses/${courseId}/activity_categories/${categoryId}`, body: JSON.stringify(data), method: "PUT" });

export const deleteCategory = (courseId: number, categoryId: number) =>
  request({ url: `${BASE}/courses/${courseId}/activity_categories/${categoryId}`, method: "DELETE" });

export const getStartingFiles = (courseId: number, activityId: number) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/starting_files`, method: "GET" });

export const uploadStartingFiles = (courseId: number, activityId: number, files: Record<string, string>) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/starting_files`, body: JSON.stringify(files), method: "PUT" });
