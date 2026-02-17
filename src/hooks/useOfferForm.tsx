
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { serviceCategories } from '@/data/mockData';

export const useOfferForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [rate, setRate] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategories([]);
    setLocation('');
    setRate('');
    setPhotos([]);
    setCustomCategory('');
    setAddingCustom(false);
  };

  const toggleCategory = (categoryId: string) => {
    if (categories.includes(categoryId)) {
      setCategories(categories.filter(id => id !== categoryId));
    } else {
      setCategories([...categories, categoryId]);
    }
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory)) {
      setCategories([...categories, customCategory]);
      setCustomCategory('');
      setAddingCustom(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para oferecer serviços.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title || !description || categories.length === 0 || !rate) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const standardCategories = categories.filter(cat => 
        serviceCategories.some(c => c.id === cat)
      );
      const customCategories = categories.filter(cat => 
        !serviceCategories.some(c => c.id === cat)
      );
      
      const offerData = {
        freelancer_id: user.id,
        title,
        description,
        categories: standardCategories,
        custom_categories: customCategories,
        location: location || null,
        rate,
        photos,
        is_active: true
      };

      const { data, error } = await supabase
        .from('freelancer_service_offers')
        .insert([offerData])
        .select();

      if (error) throw error;

      toast({
        title: "Oferta publicada! 🎉",
        description: "Sua oferta de Help foi publicada e já está visível para os solicitantes!",
      });
      
      resetForm();
      window.dispatchEvent(new CustomEvent('newOfferCreated', { detail: data[0] }));
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao publicar oferta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Form state
    title,
    setTitle,
    description,
    setDescription,
    categories,
    setCategories,
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
    
    // Actions
    handleSubmit,
    toggleCategory,
    handleAddCustomCategory,
    resetForm
  };
};
