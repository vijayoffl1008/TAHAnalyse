import { AxiosInstance, Method } from "axios";
import { faqApi } from "./clients";

export interface ApiRequestConfig<T> {
  method?: Method;
  url: string;
  data?: T;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  /**
   * Which Axios client to use.
   * Defaults to faqApi (Django primary).
   * Pass ginApi for Gin backend calls.
   */
  client?: AxiosInstance;
}

export const apiRequest = async <TResponse = unknown, TPayload = unknown>({
  method = "get",
  url,
  data,
  params,
  headers,
  client = faqApi,
}: ApiRequestConfig<TPayload>): Promise<TResponse> => {
  const res = await client({ method, url, data, params, headers });
  return res.data as TResponse;
};
