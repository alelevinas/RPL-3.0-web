import { request } from "@/lib/request";
import type { IOTest } from "@/types";

const BASE = process.env.NEXT_PUBLIC_ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3";

export const getIOTests = (courseId: number, activityId: number): Promise<IOTest[]> =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/io_tests`, method: "GET" });

export const createIOTest = (courseId: number, activityId: number, data: { name: string; test_in: string; test_out: string }) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/io_tests`, body: JSON.stringify(data), method: "POST" });

export const editIOTest = (courseId: number, activityId: number, testId: number, data: { name: string; test_in: string; test_out: string }) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/io_tests/${testId}`, body: JSON.stringify(data), method: "PUT" });

export const deleteIOTest = (courseId: number, activityId: number, testId: number) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/io_tests/${testId}`, method: "DELETE" });

export const getUnitTests = (courseId: number, activityId: number) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/unit_tests`, method: "GET" });

export const updateUnitTests = (courseId: number, activityId: number, content: string) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/unit_tests`, body: JSON.stringify({ content }), method: "PUT" });
