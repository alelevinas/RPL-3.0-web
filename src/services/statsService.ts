import { request } from "@/lib/request";

const ACTIVITIES_BASE = process.env.NEXT_PUBLIC_ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3";

export const getStudentStats = async (courseId: number) => {
  const [activities, submissions] = await Promise.all([
    request({ url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/activities/me`, method: "GET" }),
    request({ url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/submissions/me`, method: "GET" }),
  ]);
  return {
    completed_activities: activities.amount_of_activities_solved ?? 0,
    total_activities:
      (activities.amount_of_activities_solved ?? 0) +
      (activities.amount_of_activities_started ?? 0) +
      (activities.amount_of_activities_not_started ?? 0),
    total_submissions: submissions.total_submissions ?? 0,
    total_points: activities.points_obtained ?? 0,
  };
};

export const getTeacherStats = async (courseId: number) => {
  const data = await request({ url: `${ACTIVITIES_BASE}/stats/courses/${courseId}/submissions`, method: "GET" });
  const stats: { total_submissions?: number; total_submitters?: number }[] = data.submissions_stats ?? [];
  return {
    total_students: stats[0]?.total_submitters ?? 0,
    total_activities: (data.metadata ?? []).length,
    total_submissions: stats.reduce((sum: number, s: { total_submissions?: number }) => sum + (s.total_submissions ?? 0), 0),
  };
};
