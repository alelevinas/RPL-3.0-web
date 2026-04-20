import { request } from "@/lib/request";
import type { SubmissionResult } from "@/types";

const BASE = process.env.NEXT_PUBLIC_ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3";

export const submit = (courseId: number, activityId: number, files: Record<string, string>) => {
  const fd = new FormData();
  for (const [filename, content] of Object.entries(files)) {
    fd.append("submission_files", new File([content], filename, { type: "text/plain" }));
  }
  return request({
    url: `${BASE}/courses/${courseId}/activities/${activityId}/submissions`,
    formData: fd,
    method: "POST",
  });
};

export const getAll = (courseId: number, activityId: number): Promise<SubmissionResult[]> =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/submissions`, method: "GET" });

export const get = (courseId: number, activityId: number, submissionId: number): Promise<SubmissionResult> =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/submissions/${submissionId}`, method: "GET" });

export const reprocessAll = () =>
  request({ url: `${BASE}/submissions/reprocessAll`, method: "POST" });

export const getAllFinalSubmissions = (courseId: number, activityId: number): Promise<SubmissionResult[]> =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/final_submissions`, method: "GET" });

export const markAsFinal = (courseId: number, activityId: number, submissionId: number) =>
  request({
    url: `${BASE}/courses/${courseId}/activities/${activityId}/submissions/${submissionId}/final`,
    method: "PUT",
  });
