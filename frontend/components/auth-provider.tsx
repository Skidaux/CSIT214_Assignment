import { useState, type ReactNode } from "react";

import { AuthContext } from "@/src/lib/auth-context";
import {
  AUTH_STORAGE_KEY,
  getStoredUser,
  type AuthResult,
  type AuthUser,
  type RegisterDetails,
} from "@/src/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthResponse = {
  code: number | string;
  id?: number;
  username?: string;
  type?: "individual" | "business";
  is_employee?: boolean;
  isEmployee?: boolean;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  function saveUser(authUser: AuthUser) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }

  async function login(username: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok || data.code !== 200 || !data.id || !data.username) {
        return { success: false, message: "Invalid username or password." };
      }

      saveUser({
        id: data.id,
        username: data.username,
        isEmployee: data.is_employee ?? data.isEmployee,
      });
      return { success: true };
    } catch {
      return {
        success: false,
        message: "Unable to reach the server. Please try again.",
      };
    }
  }

  async function register(details: RegisterDetails): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: details.username,
          password: details.password,
          type: details.accountType,
          is_employee: details.isEmployee,
        }),
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok || data.code !== 200 || !data.id || !data.username) {
        return {
          success: false,
          message: "That username is unavailable. Please choose another.",
        };
      }

      saveUser({
        id: data.id,
        username: data.username,
        accountType: data.type ?? details.accountType,
        isEmployee: data.isEmployee ?? details.isEmployee,
      });
      return { success: true };
    } catch {
      return {
        success: false,
        message: "Unable to reach the server. Please try again.",
      };
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: user !== null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
