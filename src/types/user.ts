
export interface RealUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  type: 'client' | 'professional';
  rating?: number;
  isVerified?: boolean;
}
