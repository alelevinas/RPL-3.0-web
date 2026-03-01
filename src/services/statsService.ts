import { request } from "@/lib/request";

const ACTIVITIES_BASE = process.env.NEXT_PUBLIC_ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3";

export const getStudentStats = (courseId: number) =>
  request({ url: `${ACTIVITIES_BASE}/courses/${courseId}/stats`, method: "GET" });

export const getTeacherStats = (courseId: number) =>
  request({ url: `${ACTIVITIES_BASE}/courses/${courseId}/stats/teacher`, method: "GET" });
