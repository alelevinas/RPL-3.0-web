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
  request({ url: `${BASE}/courses/${courseId}/submissions/${submissionId}/result`, method: "GET" });

export const reprocessAll = () =>
  request({ url: `${BASE}/submissions/reprocessAll`, method: "POST" });

export function watchStatus(
  courseId: number,
  submissionId: number,
  onStatus: (status: string) => void,
  onResult: (result: SubmissionResult) => void,
  onError: () => void,
): AbortController {
  const controller = new AbortController();
  const stored = typeof window !== "undefined" ? localStorage.getItem("rpl_token") : null;
  const token = stored ? JSON.parse(stored) : null;
  const url = `${BASE}/courses/${courseId}/submissions/${submissionId}/stream`;

  (async () => {
    try {
      const res = await fetch(url, {
        headers: token?.accessToken
          ? { Authorization: `${token.tokenType} ${token.accessToken}` }
          : {},
        signal: controller.signal,
      });

      if (!res.ok || !res.body) { onError(); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          let eventType = "message";
          let data = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            else if (line.startsWith("data: ")) data = line.slice(6).trim();
          }
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (eventType === "status") onStatus(parsed.status);
              else if (eventType === "result") onResult(parsed as SubmissionResult);
              else if (eventType === "timeout" || eventType === "error") onError();
            } catch { /* malformed SSE data */ }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") onError();
    }
  })();

  return controller;
}

export const getAllFinalSubmissions = (courseId: number, activityId: number): Promise<SubmissionResult[]> =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}/final_submissions`, method: "GET" });

export const markAsFinal = (courseId: number, activityId: number, submissionId: number) =>
  request({
    url: `${BASE}/courses/${courseId}/activities/${activityId}/submissions/${submissionId}/final`,
    method: "PUT",
  });
