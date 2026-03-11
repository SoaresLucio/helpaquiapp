
export type UserType = 'solicitante' | 'freelancer' | 'empresa';

export const VALID_USER_TYPES: UserType[] = ['solicitante', 'freelancer', 'empresa'];

export const isValidUserType = (type: string | null | undefined): type is UserType => {
  return !!type && VALID_USER_TYPES.includes(type as UserType);
};

export const getUserTypeLabel = (type: UserType | null): string => {
  switch (type) {
    case 'solicitante': return 'Solicitante';
    case 'freelancer': return 'Freelancer';
    case 'empresa': return 'Empresa';
    default: return '';
  }
};
