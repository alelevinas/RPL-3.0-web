import { request } from "@/lib/request";
import type { Course, Student } from "@/types";
import extend from "lodash/extend";

const BASE = process.env.NEXT_PUBLIC_USERS_API_BASE_URL || "http://localhost:8000/api/v3";

export const create = (data: {
  name: string; university: string; subject_id: string; semester: string;
  semester_start_date: string; semester_end_date: string;
  course_admin_user_id: string; description: string; img_uri: string;
}) => request({ url: `${BASE}/courses`, body: JSON.stringify(data), method: "POST" });

export const edit = (id: string | number, data: Record<string, unknown>) =>
  request({ url: `${BASE}/courses/${id}`, body: JSON.stringify(data), method: "PUT" });

export const clone = (data: Record<string, unknown>) =>
  request({ url: `${BASE}/courses`, body: JSON.stringify(data), method: "POST" });

export const get = (courseId: number): Promise<Course> =>
  request({ url: `${BASE}/courses/${courseId}`, method: "GET" });

export const getAll = (): Promise<Course[]> =>
  request({ url: `${BASE}/courses`, method: "GET" });

export const getAllByUser = (userId: number): Promise<Course[]> =>
  request({ url: `${BASE}/users/${userId}/courses`, method: "GET" })
    .then((courses: Course[]) => courses.map((c) => extend(c, { enrolled: true })));

export const getPermissions = (courseId: number): Promise<string[]> =>
  request({ url: `${BASE}/courses/${courseId}/permissions`, method: "GET" });

export const enroll = (courseId: number) =>
  request({ url: `${BASE}/courses/${courseId}/enroll`, method: "POST" });

export const unenroll = (courseId: number) =>
  request({ url: `${BASE}/courses/${courseId}/unenroll`, method: "POST" });

export const getAllStudentsByCourseId = (courseId: number): Promise<Student[]> =>
  request({ url: `${BASE}/courses/${courseId}/users?role_name=student`, method: "GET" });

export const getAllStudentsAndTeachersByCourseId = (courseId: number): Promise<Student[]> =>
  request({ url: `${BASE}/courses/${courseId}/users?return_profile_pictures=true`, method: "GET" });

export const acceptStudent = (courseId: number, userId: number) =>
  request({ url: `${BASE}/courses/${courseId}/users/${userId}`, body: JSON.stringify({ accepted: true }), method: "PATCH" });

export const changeStudentRole = (courseId: number, userId: number, roleName: string) =>
  request({ url: `${BASE}/courses/${courseId}/users/${userId}`, body: JSON.stringify({ role: roleName }), method: "PATCH" });

export const deleteStudent = (courseId: number, userId: number) =>
  request({ url: `${BASE}/courses/${courseId}/users/${userId}`, method: "DELETE" });

export const getScoreboard = (courseId: number) =>
  request({ url: `${BASE}/courses/${courseId}/scoreboard`, method: "GET" });
