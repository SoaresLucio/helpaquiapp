
import { useState, useCallback } from 'react';

interface UseProfilePhotoPreviewProps {
  onProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useProfilePhotoPreview = ({
  onProfilePhotoUpload,
  onCoverPhotoUpload
}: UseProfilePhotoPreviewProps) => {
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  
  const createPreview = useCallback((file: File, setPreview: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);
  
  const handleProfilePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      createPreview(file, setPreviewProfile);
      onProfilePhotoUpload(e);
    }
  }, [createPreview, onProfilePhotoUpload]);
  
  const handleCoverPhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      createPreview(file, setPreviewCover);
      onCoverPhotoUpload(e);
    }
  }, [createPreview, onCoverPhotoUpload]);

  return {
    previewProfile,
    previewCover,
    handleProfilePhotoChange,
    handleCoverPhotoChange
  };
};
