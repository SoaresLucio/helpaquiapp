
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DocumentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>Tipo de documento de identidade</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="rg" id="radio-rg" />
          <Label htmlFor="radio-rg">RG</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cnh" id="radio-cnh" />
          <Label htmlFor="radio-cnh">CNH</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default DocumentTypeSelector;
