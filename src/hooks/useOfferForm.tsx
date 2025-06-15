
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
    
    console.log('🚀 Iniciando submissão de oferta de Help...');
    console.log('👤 Usuário logado:', user);
    
    if (!user) {
      console.error('❌ Usuário não logado');
      toast({
        title: "Erro",
        description: "Você precisa estar logado para oferecer serviços.",
        variant: "destructive",
      });
      return;
    }
    
    // Validação básica
    if (!title || !description || categories.length === 0 || !rate) {
      console.error('❌ Campos obrigatórios não preenchidos:', { title, description, categories, rate });
      toast({
        title: "Atenção",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🔄 Criando oferta de Help...');
      console.log('👤 Usuário:', user.id);
      console.log('📝 Dados da oferta:', { title, description, categories, location, rate, photos });
      
      // Separar categorias padrão das personalizadas
      const standardCategories = categories.filter(cat => 
        serviceCategories.some(c => c.id === cat)
      );
      const customCategories = categories.filter(cat => 
        !serviceCategories.some(c => c.id === cat)
      );
      
      console.log('📂 Categorias separadas:', { standardCategories, customCategories });
      
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

      console.log('📤 Dados finais para inserção:', offerData);

      // Primeiro vamos testar se conseguimos acessar a tabela
      const { data: testQuery, error: testError } = await supabase
        .from('freelancer_service_offers')
        .select('count(*)')
        .single();
      
      console.log('🧪 Teste de acesso à tabela:', { testQuery, testError });

      const { data, error } = await supabase
        .from('freelancer_service_offers')
        .insert([offerData])
        .select();

      if (error) {
        console.error('❌ Erro ao inserir oferta:', error);
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Oferta criada com sucesso:', data);

      toast({
        title: "Oferta publicada! 🎉",
        description: "Sua oferta de Help foi publicada e já está visível para os solicitantes!",
      });
      
      // Resetar o formulário
      resetForm();
      
      // Trigger a custom event to notify other components
      console.log('📢 Disparando evento customizado...');
      window.dispatchEvent(new CustomEvent('newOfferCreated', { detail: data[0] }));
      
      // Force page reload para garantir que as ofertas apareçam
      console.log('🔄 Forçando reload da página em 2 segundos...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('💥 Erro ao salvar oferta:', error);
      toast({
        title: "Erro",
        description: `Erro ao publicar oferta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
