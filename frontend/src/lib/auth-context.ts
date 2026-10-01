import { createContext } from "react";

import type { AuthContextValue } from "@/src/lib/auth";

export const AuthContext = createContext<AuthContextValue | null>(null);
