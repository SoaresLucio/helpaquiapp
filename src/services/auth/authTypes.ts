
import { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType?: 'solicitante' | 'freelancer' | 'empresa';
}

export interface AuthResponse {
  data: any;
  error?: any;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
  loading: boolean;
  isAuthenticated: boolean;
}
