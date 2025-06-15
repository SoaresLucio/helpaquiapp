
import { supabase } from '@/integrations/supabase/client';

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  securityScore: number;
}

export const validateDataAccess = async (
  userId: string, 
  resourceType: string, 
  resourceId?: string
): Promise<SecurityValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let securityScore = 100;

  try {
    // Verify user authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.id !== userId) {
      errors.push('Acesso não autorizado: usuário não autenticado');
      securityScore = 0;
      return { isValid: false, errors, warnings, securityScore };
    }

    // Check if user profile exists and is complete
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      errors.push('Perfil não encontrado');
      securityScore -= 50;
    } else {
      // Verify profile completeness
      if (!profile.first_name || !profile.last_name) {
        warnings.push('Perfil incompleto');
        securityScore -= 10;
      }

      if (!profile.verified) {
        warnings.push('Conta não verificada');
        securityScore -= 15;
      }
    }

    // Specific validations based on resource type
    switch (resourceType) {
      case 'bank_details':
        // Verify this is the user's own banking data
        if (resourceId) {
          const { data: bankData } = await supabase
            .from('bank_details')
            .select('user_id')
            .eq('id', resourceId)
            .maybeSingle();

          if (!bankData || bankData.user_id !== userId) {
            errors.push('Acesso negado aos dados bancários');
            securityScore = 0;
          }
        }
        break;

      case 'freelancer_profile':
        // Verify user type and profile ownership
        if (profile && profile.user_type !== 'freelancer') {
          warnings.push('Acesso a perfil de freelancer sem tipo correto');
          securityScore -= 20;
        }
        break;

      case 'service_request':
        // Additional validation for service requests can be added here
        break;
    }

    // Log the validation attempt
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_action: 'data_access_validation',
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_success: errors.length === 0,
      p_metadata: {
        security_score: securityScore,
        warnings_count: warnings.length,
        errors_count: errors.length
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      securityScore
    };

  } catch (error) {
    console.error('Security validation error:', error);
    return {
      isValid: false,
      errors: ['Erro interno de validação de segurança'],
      warnings: [],
      securityScore: 0
    };
  }
};

export const sanitizeUserInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 1000); // Limit length
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de arquivo não permitido' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'Arquivo muito grande (máximo 5MB)' };
  }

  return { isValid: true };
};
