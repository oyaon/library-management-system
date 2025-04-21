import { createContext } from "react";
import type { AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export AuthProvider from AuthContext.tsx for use in App.tsx
export { AuthProvider } from './AuthContext.tsx';