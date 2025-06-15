
import { useMemo } from 'react';

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

interface User {
  id?: string;
  name: string;
  email?: string;
  avatar: string; 
  type?: 'professional' | 'client';
  isVerified?: boolean;
  phone?: string;
  coverPhoto?: string;
}

export type VerificationStatus = 'unverified' | 'partial' | 'verified';

export const useVerificationStatus = (
  profileData: ProfileData, 
  bankData: BankData, 
  user: User
): VerificationStatus => {
  return useMemo(() => {
    // Check basic profile completeness
    const hasBasicProfile = !!(
      profileData.first_name && 
      profileData.last_name && 
      user.email
    );

    // Check if user is already verified (from Supabase auth)
    const hasEmailVerification = !!user.isVerified;

    // Check bank details completeness (for freelancers)
    const hasBankDetails = !!(
      bankData.bank_name && 
      bankData.account_number && 
      bankData.document
    );

    // For professional users, require bank details
    if (user.type === 'professional') {
      if (hasBasicProfile && hasEmailVerification && hasBankDetails) {
        return 'verified';
      } else if (hasBasicProfile || hasEmailVerification || hasBankDetails) {
        return 'partial';
      }
      return 'unverified';
    }

    // For client users, bank details not required
    if (hasBasicProfile && hasEmailVerification) {
      return 'verified';
    } else if (hasBasicProfile || hasEmailVerification) {
      return 'partial';
    }

    return 'unverified';
  }, [profileData, bankData, user]);
};
