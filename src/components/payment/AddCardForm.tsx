
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';

interface AddCardFormProps {
  onAddCard: (cardData: { cardNumber: string; cardName: string; expiry: string; cvv: string; }) => Promise<boolean>;
  isProcessing: boolean;
}

const AddCardForm: React.FC<AddCardFormProps> = ({ onAddCard, isProcessing }) => {
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveCard: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await onAddCard({
      cardNumber: newCard.cardNumber,
      cardName: newCard.cardName,
      expiry: newCard.expiry,
      cvv: newCard.cvv
    });
    
    if (success) {
      setNewCard({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        saveCard: true
      });
      
      // Close dialog
      document.querySelector<HTMLButtonElement>('[data-id="close-add-card-dialog"]')?.click();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="card-number">Número do cartão</Label>
          <Input 
            id="card-number" 
            placeholder="0000 0000 0000 0000"
            value={newCard.cardNumber}
            onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="card-name">Nome no cartão</Label>
          <Input 
            id="card-name" 
            placeholder="Como aparece no cartão"
            value={newCard.cardName}
            onChange={(e) => setNewCard({...newCard, cardName: e.target.value})}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="card-expiry">Data de validade</Label>
            <Input 
              id="card-expiry" 
              placeholder="MM/AA"
              value={newCard.expiry}
              onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-cvv">Código de segurança (CVV)</Label>
            <Input 
              id="card-cvv" 
              placeholder="123"
              type="password"
              maxLength={4}
              value={newCard.cvv}
              onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="save-card" 
            checked={newCard.saveCard}
            onCheckedChange={(checked) => setNewCard({...newCard, saveCard: checked})}
          />
          <Label htmlFor="save-card">Salvar este cartão para pagamentos futuros</Label>
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button data-id="close-add-card-dialog" type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>Adicionar cartão</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddCardForm;
