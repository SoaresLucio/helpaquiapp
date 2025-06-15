
import { useState, useEffect } from 'react';

interface ProfileData {
  first_name?: string;
  last_name?: string;
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
  type?: 'professional' | 'client';
  isVerified?: boolean;
}

type VerificationStatus = 'verified' | 'pending' | 'incomplete';

export const useVerificationStatus = (profileData: ProfileData, bankData: BankData, user: User) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('incomplete');

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

  return verificationStatus;
};
