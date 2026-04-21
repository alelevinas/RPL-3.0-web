import { request } from "@/lib/request";

const ACTIVITIES_BASE = process.env.NEXT_PUBLIC_ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3";

export const getMyActivitiesStats = (courseId: number) =>
  request({ url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/activities/me`, method: "GET" });

export const getMySubmissionsStats = (courseId: number) =>
  request({ url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/submissions/me`, method: "GET" });

export const getSubmissionStatsByDate = (courseId: number) =>
  request({ url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/submissions?group_by=date`, method: "GET" });

export const getSubmissionStatsByStudent = (courseId: number, date?: string) =>
  request({
    url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/submissions?group_by=user${date ? `&date=${date}` : ""}`,
    method: "GET",
  });

export const getSubmissionStatsByActivity = (courseId: number, categoryId?: number, studentId?: number) => {
  const params = [
    categoryId ? `&category_id=${categoryId}` : "",
    studentId ? `&user_id=${studentId}` : "",
  ].join("");
  return request({
    url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/submissions?group_by=activity${params}`,
    method: "GET",
  });
};

export const getActivityStatsByStudent = (courseId: number, activityId: number) =>
  request({
    url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/submissions?group_by=user&activity_id=${activityId}`,
    method: "GET",
  });
