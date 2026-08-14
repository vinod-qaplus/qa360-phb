import axios from "axios";
import { navigateTo } from "../utils/navigationRef";
//const baseURL = /** @type {any} */ (import.meta).env?.VITE_API_URL;
const baseURL = import.meta.env?.VITE_API_URL;
console.log("API Base URL:", baseURL);

export const api = axios.create({
  baseURL,
});

// ==========================================
// 1. REQUEST INTERCEPTOR (Attaches the Token)
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      //config.headers.Authorisation = `Bearer ${token}`;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: If backend returns 401 Unauthorized, wipe local token and force logout
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("token");
    //   navigateTo("/"); // Boot them back to the login page
    // }

    const message =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message ||
      "Something went wrong";

    console.error("API Error->:", message);
    // Only navigate to global error if it's not a standard 401/403 auth check
    if (error.response?.status !== 401) {
      navigateTo("/error", {
        state: {
          message,
          status: error.response?.status,
          details: error.response?.data,
        },
      });
    }

    return Promise.reject(new Error(message));
  },
);
