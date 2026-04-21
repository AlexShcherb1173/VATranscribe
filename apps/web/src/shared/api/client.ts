import axios from "axios";

import { env } from "@/shared/config/env";
import { clearAccessToken, getAccessToken } from "@/shared/auth/token";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAccessToken();

      const currentPath =
        window.location.pathname + window.location.search + window.location.hash;

      if (currentPath !== "/auth") {
        sessionStorage.setItem("vatranscribe_redirect_after_login", currentPath);
      }

      if (window.location.pathname !== "/auth") {
        window.location.assign("/auth");
      }
    }

    return Promise.reject(error);
  },
);