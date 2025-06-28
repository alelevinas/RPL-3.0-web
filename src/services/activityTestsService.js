// @flow
import type { Activity, IOTest } from "../types";

const { request } = require("../utils/Request");

const activities_api = {
  base_url: process.env.ACTIVITIES_API_BASE_URL || "http://localhost:8001/api/v3",
};

exports.createIOTest = (
  courseId: number,
  activityId: number,
  testName: string,
  textIn: string,
  textOut: string
): Promise<IOTest> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/iotests`,
    body: JSON.stringify({ name: testName, test_in: textIn, test_out: textOut }),
    method: "POST",
  });

exports.updateIOTest = (
  courseId: number,
  activityId: number,
  ioTestId: number,
  testName: string,
  textIn: string,
  textOut: string
): Promise<IOTest> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/iotests/${ioTestId}`,
    body: JSON.stringify({ name: testName, test_in: textIn, test_out: textOut }),
    method: "PUT",
  });

exports.deleteIOTest = (
  courseId: number,
  activityId: number,
  ioTestId: number
): Promise<Activity> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/iotests/${ioTestId}`,
    method: "DELETE",
  });

exports.createUnitTest = (
  courseId: number,
  activityId: number,
  unitTestCode: string
): Promise<Activity> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/unittests`,
    body: JSON.stringify({ unit_tests_code: unitTestCode }),
    method: "POST",
  });

exports.updateUnitTest = (
  courseId: number,
  activityId: number,
  unitTestCode: string
): Promise<Activity> =>
  request({
    url: `${activities_api.base_url}/courses/${courseId}/activities/${activityId}/unittests`,
    body: JSON.stringify({ unit_tests_code: unitTestCode }),
    method: "PUT",
  });
