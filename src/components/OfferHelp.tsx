
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOfferForm } from '@/hooks/useOfferForm';
import OfferFormFields from '@/components/offer/OfferFormFields';
import CategorySelector from '@/components/offer/CategorySelector';
import PhotoManager from '@/components/offer/PhotoManager';
import FreelancerTermsDialog from '@/components/terms/FreelancerTermsDialog';

const OfferHelp: React.FC = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    categories,
    location,
    setLocation,
    rate,
    setRate,
    customCategory,
    setCustomCategory,
    addingCustom,
    setAddingCustom,
    photos,
    setPhotos,
    isSubmitting,
    handleSubmit,
    toggleCategory,
    handleAddCustomCategory
  } = useOfferForm();

  const handleAddPhoto = (url: string) => {
    setPhotos([...photos, url]);
  };
  
  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const [showTerms, setShowTerms] = useState(false);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTerms(true);
  };

  const onAcceptTerms = () => {
    setShowTerms(false);
    handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
  };

  return (
    <div className="helpaqui-card p-5">
      <h2 className="text-xl font-semibold mb-4 text-secondary">Oferecer um Help</h2>
      
      <form onSubmit={onFormSubmit}>
        <div className="space-y-4">
          <OfferFormFields
            title={title}
            description={description}
            location={location}
            rate={rate}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onLocationChange={setLocation}
            onRateChange={setRate}
          />
          
          <CategorySelector
            categories={categories}
            customCategory={customCategory}
            addingCustom={addingCustom}
            onToggleCategory={toggleCategory}
            onCustomCategoryChange={setCustomCategory}
            onAddCustomCategory={handleAddCustomCategory}
            onSetAddingCustom={setAddingCustom}
          />
          
          <PhotoManager
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />
          
          <Button 
            type="submit" 
            className="helpaqui-button-green w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Oferta de Help'}
          </Button>
        </div>
      </form>
      <FreelancerTermsDialog open={showTerms} onOpenChange={setShowTerms} onAccept={onAcceptTerms} />
    </div>
  );
};

export default OfferHelp;
