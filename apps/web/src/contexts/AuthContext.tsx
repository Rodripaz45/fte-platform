"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authStorage, authApi, UserInfo } from "@/lib/api";

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  updateUser: (userInfo?: UserInfo) => Promise<UserInfo>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token e info de usuario guardados
    const storedToken = authStorage.getToken();
    const storedUser = authStorage.getUserInfo();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, userInfo: UserInfo) => {
    authStorage.setToken(newToken);
    authStorage.setUserInfo(userInfo);
    setToken(newToken);
    setUser(userInfo);
  };

  const logout = () => {
    authStorage.removeToken();
    setToken(null);
    setUser(null);
  };

  const updateUser = async (userInfo?: UserInfo) => {
    try {
      // Si no se proporciona userInfo, obtenerlo del backend
      const updatedUserInfo = userInfo || await authApi.getCurrentUser();
      authStorage.setUserInfo(updatedUserInfo);
      setUser(updatedUserInfo);
      return updatedUserInfo;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
