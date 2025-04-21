export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register?: (email: string, password: string, name?: string) => Promise<User>;
  loading?: boolean;
  error?: string | null;
  hasRole?: (role: string) => boolean;
  isAdmin?: () => boolean;
}