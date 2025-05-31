
import React, { useState, useEffect } from 'react';
import { Camera, BadgeCheck, Mail, User as UserIcon, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Define the User interface that matches what we're using
interface User {
  id?: string;
  name: string;
  email?: string;
  avatar: string; 
  type?: 'professional' | 'client';
  isVerified?: boolean;
  phone?: string; // Made optional to match RealUserProfile
  // Add coverPhoto property to the User type
  coverPhoto?: string;
}

interface ProfileHeaderProps {
  user: User;
  onProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
}

interface BankData {
  bank_name?: string;
  account_number?: string;
  account_type?: string;
  branch?: string;
  document?: string;
}

type VerificationStatus = 'verified' | 'pending' | 'incomplete';

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  onProfilePhotoUpload,
  onCoverPhotoUpload
}) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [bankData, setBankData] = useState<BankData>({});
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('incomplete');
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  
  // Fetch profile data from Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!authUser?.id) return;

      try {
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, phone, address')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profile) {
          setProfileData(profile);
        }

        // Fetch bank data
        const { data: bank, error: bankError } = await supabase
          .from('bank_details')
          .select('bank_name, account_number, account_type, branch, document')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (bankError) {
          console.error('Error fetching bank data:', bankError);
        } else if (bank) {
          setBankData(bank);
        }

      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProfileData();
  }, [authUser?.id]);

  // Calculate verification status based on profile completeness
  useEffect(() => {
    const calculateVerificationStatus = () => {
      // Check if basic profile info is complete
      const hasBasicInfo = profileData.first_name && 
                          profileData.last_name && 
                          profileData.phone && 
                          profileData.address;

      // Check if bank details are complete (mainly for freelancers)
      const hasBankInfo = bankData.bank_name && 
                         bankData.account_number && 
                         bankData.account_type && 
                         bankData.branch && 
                         bankData.document;

      // For freelancers, require both profile and bank info
      // For clients, only require profile info
      const isFreelancer = user.type === 'professional';
      const requiredInfoComplete = isFreelancer 
        ? hasBasicInfo && hasBankInfo 
        : hasBasicInfo;

      if (!hasBasicInfo && (!isFreelancer || !hasBankInfo)) {
        setVerificationStatus('incomplete');
      } else if (requiredInfoComplete && user.isVerified) {
        setVerificationStatus('verified');
      } else if (requiredInfoComplete && !user.isVerified) {
        setVerificationStatus('pending');
      } else {
        setVerificationStatus('incomplete');
      }
    };

    calculateVerificationStatus();
  }, [profileData, bankData, user.type, user.isVerified]);

  // Enhanced profile photo handler with preview
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewProfile(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Call the parent handler
      onProfilePhotoUpload(e);
    }
  };
  
  // Enhanced cover photo handler with preview
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Call the parent handler
      onCoverPhotoUpload(e);
    }
  };
  
  // Function to handle background style for cover
  const getCoverStyle = () => {
    if (previewCover) {
      return { backgroundImage: `url(${previewCover})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (user.coverPhoto) {
      return { backgroundImage: `url(${user.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else {
      return { background: 'linear-gradient(to right, var(--helpaqui-blue), var(--helpaqui-green))' };
    }
  };

  // Get display name from Supabase data or fallback
  const getDisplayName = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`;
    }
    return user.name;
  };

  // Get avatar URL from Supabase data or fallback
  const getAvatarUrl = () => {
    return previewProfile || profileData.avatar_url || user.avatar;
  };

  // Get verification status component
  const getVerificationStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            <BadgeCheck className="h-3 w-3 mr-1" />
            Perfil Verificado
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Você será notificado assim que seu perfil for aprovado.
          </Badge>
        );
      case 'incomplete':
        return (
          <Badge variant="outline" className="text-red-500 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Seu perfil está incompleto. Envie suas informações pessoais e bancárias para utilizar todos os recursos do HelpAqui.
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <div className="relative h-48" style={getCoverStyle()}>
        <label htmlFor="cover-upload" className="absolute bottom-2 right-2 bg-black/20 p-2 rounded-full cursor-pointer hover:bg-black/30 transition-colors">
          <Camera className="h-5 w-5 text-white" />
          <input id="cover-upload" type="file" accept="image/*" className="sr-only" onChange={handleCoverPhotoChange} />
        </label>
      </div>
      
      <div className="px-4 relative">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md -mt-12 mx-auto">
          <img 
            src={getAvatarUrl()} 
            alt={getDisplayName()}
            className="w-full h-full object-cover" 
          />
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-helpaqui-blue p-1 rounded-full cursor-pointer">
            <Camera className="h-3 w-3 text-white" />
            <input id="profile-upload" type="file" accept="image/*" className="sr-only" onChange={handleProfilePhotoChange} />
          </label>
        </div>
        
        <div className="text-center my-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold">{getDisplayName()}</h2>
            {verificationStatus === 'verified' && (
              <BadgeCheck className="h-5 w-5 text-blue-500" />
            )}
          </div>
          
          {user.email && (
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2">
            <UserIcon className="h-4 w-4" />
            <Badge variant={user.type === 'professional' ? 'default' : 'secondary'}>
              {user.type === 'professional' ? "Freelancer" : "Solicitante"}
            </Badge>
          </div>
          
          {/* Verification status badge */}
          <div className="flex justify-center">
            {getVerificationStatusBadge()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
