/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import axios from 'axios';

const endpoint = "/api/v1/pam";
const host = (process.env.SPINAL_API_URL || "").replace(`/\/$/`, el => "");
const baseURL = host.match(new RegExp(endpoint)) ? host : host + endpoint;

export const HTTP = axios.create({ baseURL });
HTTP.interceptors.request.use((request: any) => {
  const t = localStorage.getItem('token');
  if (t) request.headers.common.Authorization = `Bearer ${t}`;
  return request;
});

// export const BOS_HTTP_REQUEST = axios.create({
  // baseURL: `${host}/api/v1/building`,
// });

// if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
//   baseURL = "http://localhost:8064/api/v1/pam";
// } else {
//   baseURL = "https://api-pam-spinalcom.spinalcom.com/apiv1/pam";
// }

// const instance = axios.create({
//   baseURL: baseURL
// });

// request header
// instance.interceptors.request.use(
//   config => {
//     // Do something before request is sent
//     const apiToken = localStorage.getItem("tokenKey");
//     config.headers = { Authorization: "Bearer " + apiToken };
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   }
// );
// export const ClientId = "yAPTCc1Qy4";
// export const ClientSecret = "bfVewarx9s8OOVpPmmtyr2hqmWrEU5";
// export const HTTP1 = axios.create({
// baseURL: baseURL
// });
