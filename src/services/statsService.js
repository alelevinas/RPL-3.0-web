// @flow
const { request } = require("../utils/Request");

const activities_api = {
  base_url: process.env.ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3",
};

exports.getMySubmissionsStats = (courseId: number): Promise<any> =>
  request({
    url: `${activities_api.base_url}/stats/courses/${courseId}/submissions/me`,
    method: "GET",
  });

exports.getMyActivitiesStats = (courseId: number): Promise<any> =>
  request({
    url: `${activities_api.base_url}/stats/courses/${courseId}/activities/me`,
    method: "GET",
  });

exports.getSubmissionStatsByDate = (courseId: number): Promise<Object> =>
  request({
    url: `${activities_api.base_url}/stats/courses/${courseId}/submissions?group_by=date`,
    method: "GET",
  });

exports.getSubmissionStatsByActivity = (
  courseId: number,
  categoryId: ?number,
  studentId: ?number
): Promise<any> => {
  const categoryIdParam = (categoryId && `&category_id=${categoryId}`) || "";
  const studentIdParam = (studentId && `&user_id=${studentId}`) || "";
  return request({
    url: `${activities_api.base_url}/stats/courses/${courseId}/submissions?group_by=activity${studentIdParam}${categoryIdParam}`,
    method: "GET",
  });
};

exports.getSubmissionStatsByStudent = (courseId: number, date: ?string): Promise<Object> =>
  request({
    url: `${activities_api.base_url}/stats/courses/${courseId}/submissions?group_by=user${
      date ? `&date=${date}` : ""
    }`,
    method: "GET",
  });

exports.getActivityStatsByStudent = (courseId: number, activityId: number): Promise<Object> =>
  request({
    url: `${activities_api.base_url}/stats/courses/${courseId}/submissions?group_by=user&activity_id=${activityId}`,
    method: "GET",
  });
