import { Method } from "axios";
import { api } from "./axios";

export interface ApiRequest<T> {
  method?: Method;
  url: string;
  data?: T;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export const apiRequest = async <TResponse = any, TPayload = any>({
  method = "get",
  url,
  data,
  params,
  headers,
}: ApiRequest<TPayload>): Promise<TResponse> => {
  const res = await api({
    method,
    url,
    data,
    params,
    headers,
  });

  return res.data;
};
