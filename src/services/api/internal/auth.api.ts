import { apiRequest } from "../helper";
import { User } from "../../../types/user";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ForgotPasswordRequest {
  username: string;
}

export interface ResetPasswordRequest {
  code: string;
  new_password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  user: {
    id: number;
    full_name: string;
    email: string;
    name: string;
    role: string;
    force_pwd_change: boolean
  };
}

export const loginAPI = (payload: LoginRequest) =>
  apiRequest<LoginResponse, LoginRequest>({
    method: "post",
    url: "/login",
    data: payload,
  });

export const registerAPI = (payload: RegisterRequest) =>
  apiRequest<RegisterResponse, RegisterRequest>({
    method: "post",
    url: "/register",
    data: payload,
  });
