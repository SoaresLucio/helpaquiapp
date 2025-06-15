
export const formatBudget = (min: number, max: number) => {
  if (min && max) {
    return `R$ ${(min / 100).toLocaleString()} - R$ ${(max / 100).toLocaleString()}`;
  } else if (min) {
    return `A partir de R$ ${(min / 100).toLocaleString()}`;
  } else if (max) {
    return `Até R$ ${(max / 100).toLocaleString()}`;
  }
  return 'A negociar';
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getClientName = (clientProfile?: { first_name: string; last_name: string }) => {
  if (clientProfile) {
    const { first_name, last_name } = clientProfile;
    return `${first_name} ${last_name}`.trim() || 'Cliente';
  }
  return 'Cliente';
};
