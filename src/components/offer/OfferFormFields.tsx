
import React from 'react';
import { MapPin, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface OfferFormFieldsProps {
  title: string;
  description: string;
  location: string;
  rate: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRateChange: (value: string) => void;
}

const OfferFormFields: React.FC<OfferFormFieldsProps> = ({
  title,
  description,
  location,
  rate,
  onTitleChange,
  onDescriptionChange,
  onLocationChange,
  onRateChange
}) => {
  return (
    <>
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Título do serviço <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex: Eletricista especializado em residências"
          className="helpaqui-input"
          required
        />
      </div>
      
      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descrição <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descreva detalhadamente os serviços que você oferece..."
          className="helpaqui-input min-h-[100px]"
          required
        />
      </div>
      
      {/* Localização */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">
          Área de atendimento
        </label>
        <div className="relative">
          <Input
            id="location"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Ex: Bairros Oeste de São Paulo"
            className="helpaqui-input pl-10"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* Valor/Taxa */}
      <div>
        <label htmlFor="rate" className="block text-sm font-medium mb-1">
          Valor/Hora ou Taxa <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="rate"
            value={rate}
            onChange={(e) => onRateChange(e.target.value)}
            placeholder="Ex: R$ 80/hora ou A combinar"
            className="helpaqui-input pl-10"
            required
          />
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </>
  );
};

export default OfferFormFields;
