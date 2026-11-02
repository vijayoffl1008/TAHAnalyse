/**
 * Axios client factory.
 *
 * ALL clients inject `Authorization: Bearer <token>` header.
 * Django backend accepts Bearer tokens (matching Angular auth interceptor).
 * Gin server has auth middleware disabled — requests succeed with or without token.
 *
 * On 401 from any backend: clear all local auth state and redirect to /login.
 */

import axios, { AxiosInstance } from "axios";
import { clearAuth, getAccessToken } from "../../lib/token";

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  // ── Request: inject Authorization header ───────────────────────────────────
  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  // ── Response: handle 401 globally ─────────────────────────────────────────
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        clearAuth();
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );

  return client;
}

// ── Django microservice clients ────────────────────────────────────────────────
export const faqApi = createClient(import.meta.env.VITE_BASE_URL ?? "");
export const contApi = createClient(import.meta.env.VITE_CONT_BASE_URL ?? "");
export const feedApi = createClient(import.meta.env.VITE_FEED_BASE_URL ?? "");
export const orderApi = createClient(import.meta.env.VITE_ORDER_BASE_URL ?? "");
export const reportApi = createClient(import.meta.env.VITE_REPORT_BASE_URL ?? "");

// ── Gin client (TAHAnalyseServer — auth disabled) ────────────────────────────
export const ginApi = createClient(import.meta.env.VITE_API_BASE_URL ?? "");

// ── Legacy alias ──────────────────────────────────────────────────────────────
export { faqApi as api };
