
export interface FreelancerProfile {
  id: string;
  user_id: string;
  category: string;
  description?: string;
  portfolio_photos?: any[];
  observations?: string;
  hourly_rate?: number;
  available: boolean;
  created_at: string;
  updated_at: string;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    verified?: boolean;
    phone?: string;
    email?: string;
  };
}

export interface FreelancerOffer {
  id: string;
  freelancer_id: string;
  service_request_id: string;
  offered_value: number;
  message?: string;
  availability?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
