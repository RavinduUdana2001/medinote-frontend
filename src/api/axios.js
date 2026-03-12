import axios from "axios";
import { getToken, clearSession } from "../utils/authStorage";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hasResponse = !!error?.response;

    let message =
      error?.response?.data?.message ||
      error?.message ||
      "Request failed. Please try again.";

    if (!hasResponse) {
      // Network or SSL issues (e.g., bad https/http mismatch)
      const base = API_BASE;
      if (String(base).startsWith("https://")) {
        message =
          "Cannot connect securely to the API. Check SSL/HTTPS settings or use http:// for local development.";
      } else {
        message =
          "Cannot reach the API server. Check that the backend is running and the API URL is correct.";
      }
    }

    if (status === 401) {
      clearSession();
      if (window.location.pathname.startsWith("/app")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);
