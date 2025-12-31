export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  labels: string[];
  teams: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  has_argus_access?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: (redirectTo?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  retryAuth: () => void;
}

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignInResponse {
  success: boolean;
  error?: string;
}
