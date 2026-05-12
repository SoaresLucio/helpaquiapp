import React, { useState, useRef } from 'react';
import { MapPin, Calendar, DollarSign, Plus, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceCategories } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SolicitanteTermsAlert from '@/components/terms/SolicitanteTermsAlert';

const ServiceRequest: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', location: '', budget: '', date: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || photos.length >= 5) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) { toast({ title: 'Formato inválido', description: 'Apenas JPG, PNG, WebP e GIF.', variant: 'destructive' }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Muito grande', description: 'Máximo 5MB por foto.', variant: 'destructive' }); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const ext = file.name.split('.').pop();
      const path = `${user.id}/request-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600' });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
      setPhotos(prev => [...prev, urlData.publicUrl]);
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload da foto.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => setPhotos(photos.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (!termsAccepted) {
      toast({ title: 'Termos obrigatórios', description: 'Você precisa aceitar o aviso de segurança.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: 'Erro', description: 'Usuário não autenticado', variant: 'destructive' }); return; }

      // Block check
      const { data: canCreate } = await supabase.rpc('can_create_request');
      if (canCreate === false) {
        toast({
          title: 'Conta em análise ética',
          description: 'Você atingiu o limite de cancelamentos. Entre em contato com o suporte.',
          variant: 'destructive',
        });
        return;
      }

      let budgetMin: number | null = null;
      let budgetMax: number | null = null;
      if (formData.budget) {
        const m = formData.budget.match(/\d+/g);
        if (m) { budgetMin = parseInt(m[0]); budgetMax = m.length > 1 ? parseInt(m[1]) : budgetMin; }
      }

      const { error } = await supabase.from('service_requests').insert({
        client_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_address: formData.location,
        budget_min: budgetMin,
        budget_max: budgetMax,
        urgency: formData.date ? 'scheduled' : 'normal',
        status: 'open',
      });
      if (error) throw error;

      toast({
        title: 'Pedido publicado',
        description: 'Seu pedido foi publicado. O pagamento só será cobrado ao aceitar um orçamento.',
      });
      setFormData({ title: '', description: '', category: '', location: '', budget: '', date: '' });
      setPhotos([]);
      setTermsAccepted(false);
      navigate('/my-requests');
    } catch (err) {
      console.error('Error creating request:', err);
      toast({ title: 'Erro', description: 'Erro ao publicar solicitação', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="helpaqui-card p-5">
      <h2 className="text-xl font-semibold mb-4 text-helpaqui-blue">Pedir um HELP</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Título <span className="text-red-500">*</span></label>
          <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Ex: Preciso de um eletricista" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição <span className="text-red-500">*</span></label>
          <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Descreva o serviço..." className="min-h-[100px]" required />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">Categoria <span className="text-red-500">*</span></label>
          <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
            <SelectContent>
              {serviceCategories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">Localização <span className="text-red-500">*</span></label>
            <div className="relative">
              <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="Digite seu endereço" className="pl-10" required />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium mb-1">Orçamento</label>
            <div className="relative">
              <Input id="budget" value={formData.budget} onChange={(e) => handleInputChange('budget', e.target.value)} placeholder="Ex: R$50-100" className="pl-10" />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">Data Desejada</label>
          <div className="relative">
            <Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className="pl-10" />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Fotos</label>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAddPhoto} className="hidden" />
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-border">
                <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => handleRemovePhoto(index)} className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-md p-1">×</button>
              </div>
            ))}
            {photos.length < 5 && (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-20 h-20 flex items-center justify-center border border-dashed border-muted-foreground/40 rounded-md hover:border-primary">
                {uploading ? <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" /> : <Plus className="h-6 w-6 text-muted-foreground" />}
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Adicione até 5 fotos (JPG, PNG, WebP - máx. 5MB cada)</p>
        </div>

        {/* Info callout: how repasse works */}
        <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800/50 p-3 flex gap-2">
          <Info className="h-5 w-5 text-blue-700 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Como funciona o repasse:</strong> publicar é gratuito. O pagamento será processado apenas após você aceitar um orçamento de um freelancer.
          </p>
        </div>

        {/* Terms */}
        <SolicitanteTermsAlert accepted={termsAccepted} onChange={setTermsAccepted} />

        <Button type="submit" className="helpaqui-button-primary w-full" disabled={!termsAccepted || submitting}>
          {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Publicando...</> : 'Publicar Help'}
        </Button>
      </form>
    </div>
  );
};

export default ServiceRequest;
