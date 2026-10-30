import { AxiosError } from "axios";

export interface APIErrorResponse {
  message?: string;
  error?: string;
}

export const getAPIError = (error: unknown): string => {
  const err = error as AxiosError<APIErrorResponse>;

  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong"
  );
};
