import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { loginAPI, logoutAPI, getProfileAPI } from "../services/api/internal/auth.api";
import { getAPIError } from "../services/api/apiError";
import {
  setAccessToken,
  clearAuth,
  setSocketConn,
  getSocketConn,
  SocketConn,
} from "../lib/token";
import { isSuccess } from "../lib/error-codes";
import { User, UserRole } from "../types/user";
import { toast } from "sonner";

// ── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "tahanalyzer_user";

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount and validate token with backend
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) {
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedUser) as User;
      // Optimistically set user so app renders immediately
      setUser(parsed);
    } catch {
      localStorage.removeItem(USER_KEY);
    }

    // Validate token with Django backend (GET account/profile/)
    getProfileAPI()
      .then(() => {
        // Token is valid — nothing to do, user is already set
      })
      .catch(() => {
        // Token invalid or expired — clear everything
        clearAuth();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await loginAPI({ username, password });

      if (!isSuccess(res.response_code)) {
        toast.error("Login failed. Please check your credentials.");
        setIsLoading(false);
        return false;
      }

      // Map Django response → User type
      const userData: User = {
        id:        res.user._id,
        full_name: res.user.full_name,
        email:     res.user.email,
        phone:     res.user.phone,
        role:      res.admin ? "admin" : "user",
      };

      // Persist
      setAccessToken(res.token);
      setSocketConn(res.socket_conn);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);

      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error(getAPIError(err));
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Notify Django to invalidate the session
      await logoutAPI();
    } catch {
      // Proceed with local logout even if API call fails
    } finally {
      clearAuth();           // clears access_token + socket_conn + tahanalyzer_user
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

// Re-export UserRole so ProtectedRoute can import it from here
export type { UserRole };
