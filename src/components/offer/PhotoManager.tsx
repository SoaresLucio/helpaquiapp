
import React from 'react';
import { Plus } from 'lucide-react';

interface PhotoManagerProps {
  photos: string[];
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Fotos de trabalhos anteriores
      </label>
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
            <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemovePhoto(index)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-1"
              aria-label="Remover foto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={onAddPhoto}
          className="w-20 h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-md hover:border-helpaqui-green"
          aria-label="Adicionar foto"
        >
          <Plus className="h-6 w-6 text-gray-400" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Adicione fotos de trabalhos anteriores para destacar suas habilidades
      </p>
    </div>
  );
};

export default PhotoManager;
