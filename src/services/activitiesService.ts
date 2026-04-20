import { request } from "@/lib/request";
import type { Activity, Category, FilesMetadata, FileDisplayMode } from "@/types";
import { FILE_DISPLAY_MODE } from "@/types";

const BASE = process.env.NEXT_PUBLIC_ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3";

type ActivityCreateData = {
  name: string;
  description?: string;
  language: string;
  points: number;
  category_id: number;
  compilation_flags?: string;
  active?: boolean;
};

type ActivityUpdateData = Partial<ActivityCreateData> & { is_io_tested?: boolean; activity_unit_tests_content?: string };

function toBaseLanguage(lang: string): string {
  return lang.split("_")[0];
}

function buildActivityFormData(data: ActivityCreateData | ActivityUpdateData, files?: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || val === null) continue;
    fd.append(key, key === "language" ? toBaseLanguage(String(val)) : String(val));
  }
  if (files) {
    for (const [filename, content] of Object.entries(files)) {
      fd.append("starting_files", new File([content], filename, { type: "text/plain" }));
    }
  }
  return fd;
}

export const create = (courseId: number, data: ActivityCreateData, files: Record<string, string>): Promise<Activity> =>
  request({ url: `${BASE}/courses/${courseId}/activities`, formData: buildActivityFormData(data, files), method: "POST" });

export const edit = (courseId: number, activityId: number, data: ActivityUpdateData, files?: Record<string, string>): Promise<Activity> =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}`, formData: buildActivityFormData(data, files), method: "PATCH" });

export const get = (courseId: number, activityId: number): Promise<Activity> =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}`, method: "GET" });

export const getAll = (courseId: number): Promise<Activity[]> =>
  request({ url: `${BASE}/courses/${courseId}/activities`, method: "GET" });

export const deleteActivity = (courseId: number, activityId: number) =>
  request({ url: `${BASE}/courses/${courseId}/activities/${activityId}`, method: "DELETE" });

export const getCategories = (courseId: number): Promise<Category[]> =>
  request({ url: `${BASE}/courses/${courseId}/activityCategories`, method: "GET" });

export const createCategory = (courseId: number, data: { name: string; description?: string }): Promise<Category> =>
  request({ url: `${BASE}/courses/${courseId}/activityCategories`, body: JSON.stringify(data), method: "POST" });

export const editCategory = (courseId: number, categoryId: number, data: { name: string; description?: string; active?: boolean }) =>
  request({ url: `${BASE}/courses/${courseId}/activityCategories/${categoryId}`, body: JSON.stringify(data), method: "PUT" });

export const deleteCategory = (courseId: number, categoryId: number) =>
  request({ url: `${BASE}/courses/${courseId}/activityCategories/${categoryId}`, method: "DELETE" });

export const getStartingFiles = (courseId: number, rplFileId: number): Promise<Record<string, string>> =>
  request({ url: `${BASE}/courses/${courseId}/extractedRPLFile/${rplFileId}`, method: "GET" });

export function parseStartingFiles(raw: Record<string, string>): { files: Record<string, string>; filesMetadata: FilesMetadata } {
  const { files_metadata: rawMeta, ...files } = raw;
  const parsed: Record<string, { display: string }> = rawMeta ? JSON.parse(rawMeta) : {};
  const filesMetadata: FilesMetadata = {};
  for (const name of Object.keys(files)) {
    filesMetadata[name] = { display: (parsed[name]?.display as FileDisplayMode) ?? FILE_DISPLAY_MODE.READ_WRITE };
  }
  return { files, filesMetadata };
}

export const getStartingFilesForStudent = (courseId: number, rplFileId: number): Promise<Record<string, string>> =>
  request({ url: `${BASE}/courses/${courseId}/extractedRPLFileForStudent/${rplFileId}`, method: "GET" });

export const saveFilePermissions = (
  courseId: number,
  activityId: number,
  files: Record<string, string>,
  metadata: Record<string, { display: string }>,
): Promise<Activity> => {
  const filesWithMeta = { ...files, files_metadata: JSON.stringify(metadata) };
  return edit(courseId, activityId, {}, filesWithMeta);
};
