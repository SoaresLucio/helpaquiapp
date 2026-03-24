
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface JobFormData {
  title: string;
  description: string;
  job_type: string;
  location: string;
  salary_range: string;
  requirements: string;
  benefits: string;
}

export const emptyJobForm: JobFormData = {
  title: '', description: '', job_type: 'CLT', location: '',
  salary_range: '', requirements: '', benefits: '',
};

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: JobFormData;
  setFormData: React.Dispatch<React.SetStateAction<JobFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  isEditing: boolean;
}

const JobFormDialog: React.FC<JobFormDialogProps> = ({
  open, onOpenChange, formData, setFormData, onSubmit, saving, isEditing
}) => {
  const update = (field: keyof JobFormData, value: string) =>
    setFormData(p => ({ ...p, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Vaga' : 'Nova Vaga de Emprego'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título da Vaga *</Label>
            <Input value={formData.title} onChange={e => update('title', e.target.value)} placeholder="Ex: Desenvolvedor Full Stack" required />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={formData.description} onChange={e => update('description', e.target.value)} placeholder="Descreva a vaga em detalhes..." rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Vaga</Label>
              <Select value={formData.job_type} onValueChange={v => update('job_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLT">CLT</SelectItem>
                  <SelectItem value="temporario">Temporário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <Input value={formData.location} onChange={e => update('location', e.target.value)} placeholder="São Paulo, SP" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Faixa Salarial</Label>
            <Input value={formData.salary_range} onChange={e => update('salary_range', e.target.value)} placeholder="R$ 3.000 - R$ 5.000" />
          </div>
          <div className="space-y-2">
            <Label>Requisitos</Label>
            <Textarea value={formData.requirements} onChange={e => update('requirements', e.target.value)} placeholder="Liste os requisitos da vaga..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Benefícios</Label>
            <Textarea value={formData.benefits} onChange={e => update('benefits', e.target.value)} placeholder="VR, VT, Plano de Saúde..." rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Vaga'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobFormDialog;
