// @flow
import type { Student } from "../types";

const { request } = require("../utils/Request");

const users_api = {
  base_url: process.env.USERS_API_BASE_URL || "http://localhost:8000/api/v3",
};

exports.login = credentials =>
  request({
    url: `${users_api.base_url}/auth/login`,
    body: JSON.stringify(credentials),
    method: "POST",
  });


exports.signup = user =>
  request({
    url: `${users_api.base_url}/auth/signup`,
    body: JSON.stringify(user),
    method: "POST",
  });

exports.getProfile = () =>
  request({
    url: `${users_api.base_url}/auth/profile`,
    method: "GET",
  });

exports.updateProfile = profileData =>
  request({
    url: `${users_api.base_url}/auth/profile`,
    body: JSON.stringify(profileData),
    method: "PATCH",
  });

exports.forgotPassword = (email: string): Promise<string> =>
  request({
    url: `${users_api.base_url}/auth/forgotPassword`,
    body: JSON.stringify({ email }),
    method: "POST",
  });

exports.resetPassword = (token: string, password: string): Promise<Student> =>
  request({
    url: `${users_api.base_url}/auth/resetPassword`,
    body: JSON.stringify({ token: token, new_password: password }),
    method: "POST",
  });

exports.validateEmailToken = (token: string): Promise<Student> =>
  request({
    url: `${users_api.base_url}/auth/validateEmail`,
    body: JSON.stringify({ token: token }),
    method: "POST",
  });

exports.resendEmailToken = (user: string): Promise<Student> =>
  request({
    url: `${users_api.base_url}/auth/resendValidationEmail`,
    body: JSON.stringify({ username_or_email: user }),
    method: "POST",
  });

exports.getRoles = (): Promise<any> =>
  request({
    url: `${users_api.base_url}/auth/roles`,
    method: "GET",
  });

exports.getUniversities = (): Promise<Array<any>> =>
  request({
    url: `${users_api.base_url}/auth/universities`,
    method: "GET",
  });
