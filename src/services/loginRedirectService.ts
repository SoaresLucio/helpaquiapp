
import { getUserType } from './authService';

export interface RedirectResult {
  success: boolean;
  redirectPath: string;
  userType: 'solicitante' | 'freelancer' | null;
  error?: string;
}

export const determineRedirectPath = async (): Promise<RedirectResult> => {
  try {
    const userType = await getUserType();
    
    if (!userType) {
      return {
        success: false,
        redirectPath: '/user-type-selection',
        userType: null,
        error: 'Tipo de usuário não encontrado'
      };
    }

    // Determinar o caminho baseado no tipo de usuário
    let redirectPath: string;
    
    if (userType === 'solicitante') {
      redirectPath = '/solicitante-plans';
    } else if (userType === 'freelancer') {
      redirectPath = '/freelancer-plans';
    } else {
      redirectPath = '/user-type-selection';
    }

    console.log('Redirect determined:', { userType, redirectPath });

    return {
      success: true,
      redirectPath,
      userType
    };
  } catch (error) {
    console.error('Error determining redirect path:', error);
    return {
      success: false,
      redirectPath: '/',
      userType: null,
      error: 'Erro ao determinar redirecionamento'
    };
  }
};

export const handlePostLoginRedirect = async (): Promise<string> => {
  const result = await determineRedirectPath();
  return result.redirectPath;
};
