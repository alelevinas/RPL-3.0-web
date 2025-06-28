// @flow

const { request } = require("../utils/Request");

const users_api = {
  base_url: process.env.USERS_API_BASE_URL || "http://localhost:8000/api/v3"
};

exports.findUsers = (query: string) => {
    if (!query) {
        return request({
            url: `${users_api.base_url}/users`,
            method: "GET",
        });
    }
    return request({
        url: `${users_api.base_url}/users?query=${query}`,
        method: "GET",
    });
};
    