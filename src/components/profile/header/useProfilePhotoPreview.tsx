
import { useState } from 'react';

export const useProfilePhotoPreview = (
  onProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onCoverPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
) => {
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  
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

  return {
    previewProfile,
    previewCover,
    handleProfilePhotoChange,
    handleCoverPhotoChange
  };
};
