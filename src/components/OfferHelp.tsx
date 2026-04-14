
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOfferForm } from '@/hooks/useOfferForm';
import OfferFormFields from '@/components/offer/OfferFormFields';
import CategorySelector from '@/components/offer/CategorySelector';
import PhotoManager from '@/components/offer/PhotoManager';

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

  return (
    <div className="helpaqui-card p-5">
      <h2 className="text-xl font-semibold mb-4 text-helpaqui-green">Oferecer um Help</h2>
      
      <form onSubmit={handleSubmit}>
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
    </div>
  );
};

export default OfferHelp;
