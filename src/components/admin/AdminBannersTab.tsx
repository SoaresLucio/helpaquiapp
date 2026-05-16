import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  cta_text: string | null;
  target_audience: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const AUDIENCES = [
  { value: 'both', label: 'Todos os usuários' },
  { value: 'solicitante', label: 'Solicitantes' },
  { value: 'freelancer', label: 'Freelancers' },
  { value: 'empresa', label: 'Empresas' },
];

const AdminBannersTab: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [audience, setAudience] = useState<string>('both');
  const [order, setOrder] = useState<number>(0);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promotional_banners')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) toast.error(error.message);
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setTitle(''); setImageUrl(''); setLinkUrl(''); setCtaText('');
    setAudience('both'); setOrder(0);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('banner-images').upload(path, file, {
        cacheControl: '3600', upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('banner-images').getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast.success('Imagem enviada');
    } catch (e: any) {
      toast.error(e?.message || 'Falha no upload');
    } finally {
      setUploading(false);
    }
  };

  const create = async () => {
    if (!title.trim() || !imageUrl.trim()) {
      toast.error('Título e imagem são obrigatórios');
      return;
    }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('promotional_banners').insert({
      title: title.trim(),
      image_url: imageUrl.trim(),
      link_url: linkUrl.trim() || null,
      cta_text: ctaText.trim() || null,
      target_audience: audience,
      display_order: order,
      is_active: true,
      created_by: u.user?.id,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Banner criado');
    reset();
    load();
  };

  const toggleActive = async (b: Banner) => {
    const { error } = await supabase
      .from('promotional_banners')
      .update({ is_active: !b.is_active })
      .eq('id', b.id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const remove = async (b: Banner) => {
    if (!confirm(`Excluir banner "${b.title}"?`)) return;
    const { error } = await supabase.from('promotional_banners').delete().eq('id', b.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Banner removido');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><ImageIcon className="h-6 w-6 text-primary" /> Banners Promocionais</h2>
        <p className="text-muted-foreground text-sm">Gerencie os banners exibidos no carrossel para cada tipo de usuário.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Novo banner</CardTitle>
          <CardDescription>Selecione "Todos os usuários" para que apareça para solicitantes, freelancers e empresas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Título *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </div>
            <div>
              <Label>Público-alvo *</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Imagem *</Label>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL da imagem ou faça upload" />
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <Button type="button" variant="outline" disabled={uploading} asChild>
                  <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                </Button>
              </label>
            </div>
            {imageUrl && (
              <img src={imageUrl} alt={title ? `Pré-visualização do banner: ${title}` : 'Pré-visualização do banner promocional'} className="mt-2 h-24 rounded object-cover" />
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>CTA (opcional)</Label>
              <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Saiba mais" />
            </div>
            <div>
              <Label>Link (opcional)</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/plans ou https://..." />
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value) || 0)} />
            </div>
          </div>

          <Button onClick={create} disabled={saving} className="bg-primary">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Criar banner
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Banners existentes ({banners.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : banners.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum banner cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {banners.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img src={b.image_url} alt={b.title} className="h-14 w-24 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{b.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary">{AUDIENCES.find(a => a.value === b.target_audience)?.label || b.target_audience}</Badge>
                      <Badge variant="outline">Ordem: {b.display_order}</Badge>
                      {b.link_url && <Badge variant="outline" className="truncate max-w-[200px]">{b.link_url}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b)} />
                      <span className="text-xs text-muted-foreground">{b.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remove(b)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBannersTab;
