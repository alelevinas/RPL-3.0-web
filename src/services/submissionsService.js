// @flow
import type { SubmissionResult } from "../types";

const { request } = require("../utils/Request");

const activities_api = {
  base_url: process.env.ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3",
};

exports.createSubmission = (courseId: number, activityId: number, code: { [string]: string }) => {
  const formData = new FormData();

  Object.keys(code).forEach(filename => {
    formData.append("submission_files", new File([code[filename]], filename));
    formData.append("description", "La descriptionnnnnn");
  });

  return request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/submissions`,
    body: formData,
    method: "POST",
    headers: new Headers(),
  });
};

exports.getSubmissionResult = (courseId: number, submissionId: number): Promise<SubmissionResult> =>
  request({
    url: `${activities_api.base_url}/submissions/${submissionId}/result`,
    method: "GET",
  }).then(submission => {
    return fetch(
      `${activities_api.base_url}/courses/${courseId}/extractedRPLFileForStudent/${submission.submission_rplfile_id}`
    ).then(response => {
      return response.json().then(code => {
        const completeSubmission = submission;
        completeSubmission.submited_code = code;
        return completeSubmission;
      });
    });
  });

exports.getAllSubmissions = (
  courseId: number,
  activityId: number
): Promise<Array<SubmissionResult>> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/submissions`,
    method: "GET",
  });

exports.getAllSubmissionsFromStudent = (
  courseId: number,
  activityId: number,
  studentId: number
): Promise<Array<SubmissionResult>> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/students/${studentId}/submissions`,
    method: "GET",
  });

exports.getStats = (courseId: number): Promise<> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/submissions/stats`,
    method: "GET",
  });

exports.getFinalSolution = (courseId: number, activityId: number): Promise<SubmissionResult> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/finalSubmission`,
    method: "GET",
  });

exports.getFinalSolutionWithFileForStudent = (
  courseId: number,
  activityId: number
): Promise<SubmissionResult> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/finalSubmission`,
    method: "GET",
  }).then(submission => {
    return fetch(
      `${activities_api.base_url}/courses/${courseId}/extractedRPLFileForStudent/${submission.submission_rplfile_id}`
    ).then(response => {
      return response.json().then(code => {
        const completeSubmission = submission;
        completeSubmission.submited_code = code;
        return completeSubmission;
      });
    });
  });

exports.getAllFinalSolutionsFilesForStudent = (
  courseId: number,
  activityId: number,
  exceptFileId: ?number
): Promise<Array<{ [string]: string }>> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/allFinalSubmissions`,
    method: "GET",
  }).then(response => {
    const filesQuery =
      exceptFileId !== null
        ? response.submission_rplfile_ids.filter(id => id !== exceptFileId)
        : response.submission_rplfile_ids;
    if (filesQuery.length === 0) {
      return Promise.resolve([]);
    }
    return request({
      url: `${activities_api.base_url}/courses/${courseId}/extractedRPLFilesForStudent/${filesQuery}`,
      method: "GET",
    });
  });

exports.putSolutionAsFinal = (
  courseId: number,
  activityId: number,
  submissionId: number
): Promise<SubmissionResult> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/submissions/${submissionId}/final`,
    method: "PUT",
  });
