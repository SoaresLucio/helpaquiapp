
export const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'urgente':
      return 'destructive';
    case 'alta':
      return 'destructive';
    case 'normal':
      return 'default';
    case 'baixa':
      return 'secondary';
    default:
      return 'default';
  }
};

export const getUrgencyLabel = (urgency: string) => {
  switch (urgency) {
    case 'urgente':
      return 'Urgente';
    case 'alta':
      return 'Alta';
    case 'normal':
      return 'Normal';
    case 'baixa':
      return 'Baixa';
    default:
      return 'Normal';
  }
};
