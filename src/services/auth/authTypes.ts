
import { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType?: 'solicitante' | 'freelancer';
}

export interface AuthResponse {
  data: any;
  error?: any;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  userType: 'solicitante' | 'freelancer' | null;
  loading: boolean;
  isAuthenticated: boolean;
}
