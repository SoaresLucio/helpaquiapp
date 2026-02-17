
import React, { useRef } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PhotoManagerProps {
  photos: string[];
  onAddPhoto: (url: string) => void;
  onRemovePhoto: (index: number) => void;
  maxPhotos?: number;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 5
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Apenas imagens JPG, PNG, WebP e GIF são permitidas.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro", description: "Faça login primeiro.", variant: "destructive" });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars') // Reusing avatars bucket for offer photos
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      onAddPhoto(urlData.publicUrl);
      
      toast({
        title: "Foto adicionada!",
        description: "A foto foi enviada com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a foto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Fotos de trabalhos anteriores
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-border">
            <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemovePhoto(index)}
              className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-md p-1"
              aria-label="Remover foto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 flex items-center justify-center border border-dashed border-muted-foreground/40 rounded-md hover:border-primary transition-colors"
            aria-label="Adicionar foto"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            ) : (
              <Plus className="h-6 w-6 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Adicione até {maxPhotos} fotos (JPG, PNG, WebP - máx. 5MB cada)
      </p>
    </div>
  );
};

export default PhotoManager;
