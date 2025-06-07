
import { getUserType } from './authService';
import { getCurrentSubscription } from './subscriptionService';

export interface RedirectResult {
  success: boolean;
  redirectPath: string;
  userType: 'solicitante' | 'freelancer' | null;
  hasActiveSubscription: boolean;
  error?: string;
}

export const determineRedirectPath = async (): Promise<RedirectResult> => {
  try {
    const userType = await getUserType();
    
    if (!userType) {
      return {
        success: false,
        redirectPath: '/login',
        userType: null,
        hasActiveSubscription: false,
        error: 'Tipo de usuário não encontrado'
      };
    }

    // Verificar se o usuário tem uma assinatura ativa
    const currentSubscription = await getCurrentSubscription();
    const hasActiveSubscription = currentSubscription?.status === 'active';

    let redirectPath: string;
    
    if (hasActiveSubscription) {
      // Se tem assinatura ativa, vai para a página inicial do tipo de usuário
      if (userType === 'solicitante') {
        redirectPath = '/';
      } else if (userType === 'freelancer') {
        redirectPath = '/';
      } else {
        redirectPath = '/login';
      }
    } else {
      // Se não tem assinatura ativa, vai para a página de planos
      if (userType === 'solicitante') {
        redirectPath = '/solicitante-plans';
      } else if (userType === 'freelancer') {
        redirectPath = '/freelancer-plans';
      } else {
        redirectPath = '/login';
      }
    }

    console.log('Redirect determined:', { userType, redirectPath, hasActiveSubscription });

    return {
      success: true,
      redirectPath,
      userType,
      hasActiveSubscription
    };
  } catch (error) {
    console.error('Error determining redirect path:', error);
    return {
      success: false,
      redirectPath: '/login',
      userType: null,
      hasActiveSubscription: false,
      error: 'Erro ao determinar redirecionamento'
    };
  }
};

export const handlePostLoginRedirect = async (): Promise<string> => {
  const result = await determineRedirectPath();
  return result.redirectPath;
};
