
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecureProfileData {
  profile: any;
  hasAccess: boolean;
  securityLevel: 'low' | 'medium' | 'high';
}

export const useSecureProfileAccess = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<SecureProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecureProfile = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        // First, verify the user has access to their own profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Profile access error:', error);
          
          // Log security event for failed access
          await supabase.rpc('log_security_event', {
            p_user_id: user.id,
            p_action: 'profile_access_denied',
            p_resource_type: 'profile',
            p_success: false,
            p_error_message: error.message
          });

          toast({
            title: "Acesso Negado",
            description: "Erro ao acessar dados do perfil",
            variant: "destructive"
          });

          setProfileData({
            profile: null,
            hasAccess: false,
            securityLevel: 'low'
          });
          return;
        }

        // Determine security level based on profile completeness and verification
        let securityLevel: 'low' | 'medium' | 'high' = 'low';
        
        if (profile) {
          const hasBasicInfo = profile.first_name && profile.last_name && profile.phone;
          const isVerified = profile.verified;
          const hasEmailConfirmed = user.email_confirmed_at;

          if (isVerified && hasBasicInfo && hasEmailConfirmed) {
            securityLevel = 'high';
          } else if (hasBasicInfo && hasEmailConfirmed) {
            securityLevel = 'medium';
          }
        }

        // Log successful access
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_action: 'profile_access_granted',
          p_resource_type: 'profile',
          p_success: true,
          p_metadata: {
            security_level: securityLevel,
            profile_exists: !!profile
          }
        });

        setProfileData({
          profile,
          hasAccess: true,
          securityLevel
        });

      } catch (error) {
        console.error('Secure profile access error:', error);
        setProfileData({
          profile: null,
          hasAccess: false,
          securityLevel: 'low'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSecureProfile();
  }, [user, isAuthenticated]);

  return { profileData, loading };
};
