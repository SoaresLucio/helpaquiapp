
export const USER_TYPES = {
  SOLICITANTE: 'solicitante' as const,
  FREELANCER: 'freelancer' as const
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active' as const,
  EXPIRED: 'expired' as const,
  CANCELLED: 'cancelled' as const
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  USER_TYPE: '/user-type',
  CHAT: '/chat',
  MY_OFFERS: '/my-offers',
  MY_REQUESTS: '/my-requests',
  SUBSCRIPTION_HISTORY: '/subscription-history',
  FREELANCER_PLANS: '/freelancer-plans',
  SOLICITANTE_PLANS: '/solicitante-plans'
} as const;

export const COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  GRAY: '#6B7280'
} as const;
