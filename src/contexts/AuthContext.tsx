import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { loginAPI } from "../services/api/internal/auth.api";
import { getAPIError } from "../services/api/apiError";
import { setAccessToken } from "../lib/token";
import { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('tahanalyzer_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('tahanalyzer_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const res = await loginAPI({
        username: email,
        password,
      });
      if (res.user) {
        const { ...userWithoutPassword } = res.user;
        setAccessToken(res.token);
        setUser(userWithoutPassword);
        localStorage.setItem('tahanalyzer_user', JSON.stringify(userWithoutPassword));
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      alert(getAPIError(err));
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tahanalyzer_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};