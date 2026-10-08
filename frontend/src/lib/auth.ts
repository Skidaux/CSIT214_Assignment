export type AuthUser = {
  id: number;
  username: string;
  accountType?: "individual" | "business";
  isEmployee?: boolean;
};

export type RegisterDetails = {
  username: string;
  password: string;
  accountType: "individual" | "business";
  isEmployee: boolean;
};

export type AuthResult = {
  success: boolean;
  message?: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (details: RegisterDetails) => Promise<AuthResult>;
  logout: () => void;
};

export const AUTH_STORAGE_KEY = "coastlink-council-user";

export function getStoredUser(): AuthUser | null {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}
