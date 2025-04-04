
export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export type Professional = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  ratingCount: number;
  categories: string[];
  description: string;
  price: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: string;
  available: boolean;
  portfolio: string[];
};

export type ServiceRequest = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  budget: string;
  date: string;
  status: 'open' | 'assigned' | 'completed';
  photos: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  type: 'client' | 'professional';
  rating: number;
  reviews: Review[];
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

export type Message = {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp: string;
  read: boolean;
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Limpeza',
    icon: 'cleaning',
    description: 'Serviços de limpeza residencial e comercial'
  },
  {
    id: '2',
    name: 'Construção',
    icon: 'construction',
    description: 'Construção e reforma'
  },
  {
    id: '3',
    name: 'Reparos',
    icon: 'repairs',
    description: 'Reparos residenciais (eletricista, encanador)'
  },
  {
    id: '4',
    name: 'Motoboy',
    icon: 'delivery',
    description: 'Motoboy e serviços de entrega'
  },
  {
    id: '5',
    name: 'Escritório',
    icon: 'office',
    description: 'Serviços de escritório (secretariado, organização)'
  },
  {
    id: '6',
    name: 'Outros',
    icon: 'others',
    description: 'Montagem de móveis, aulas particulares, design'
  }
];

export const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'João Silva',
    avatar: '/placeholder.svg',
    rating: 4.8,
    ratingCount: 125,
    categories: ['1'],
    description: 'Especialista em limpeza residencial com 5 anos de experiência',
    price: 'R$50-70/h',
    location: {
      lat: -23.5505,
      lng: -46.6333
    },
    distance: '1.2 km',
    available: true,
    portfolio: ['/placeholder.svg', '/placeholder.svg']
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    avatar: '/placeholder.svg',
    rating: 4.9,
    ratingCount: 210,
    categories: ['3'],
    description: 'Eletricista residencial e comercial com certificação',
    price: 'R$80-100/h',
    location: {
      lat: -23.5535,
      lng: -46.6453
    },
    distance: '2.5 km',
    available: true,
    portfolio: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
  },
  {
    id: '3',
    name: 'Pedro Santos',
    avatar: '/placeholder.svg',
    rating: 4.7,
    ratingCount: 98,
    categories: ['4'],
    description: 'Motoboy com moto própria, entrega rápida e segura',
    price: 'R$15-25/entrega',
    location: {
      lat: -23.5585,
      lng: -46.6383
    },
    distance: '3.1 km',
    available: false,
    portfolio: ['/placeholder.svg']
  },
  {
    id: '4',
    name: 'Ana Souza',
    avatar: '/placeholder.svg',
    rating: 4.9,
    ratingCount: 156,
    categories: ['2'],
    description: 'Pedreiro especializado em reformas e acabamentos',
    price: 'R$100-150/dia',
    location: {
      lat: -23.5555,
      lng: -46.6403
    },
    distance: '1.8 km',
    available: true,
    portfolio: ['/placeholder.svg', '/placeholder.svg']
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Roberto Almeida',
    email: 'roberto@example.com',
    phone: '(11) 98765-4321',
    avatar: '/placeholder.svg',
    type: 'client',
    rating: 4.5,
    reviews: [
      {
        id: '101',
        userId: '2',
        userName: 'Maria Oliveira',
        rating: 5,
        comment: 'Ótimo cliente, muito educado e pagamento pontual',
        date: '2023-03-15'
      }
    ]
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@example.com',
    phone: '(11) 91234-5678',
    avatar: '/placeholder.svg',
    type: 'professional',
    rating: 4.9,
    reviews: [
      {
        id: '102',
        userId: '1',
        userName: 'Roberto Almeida',
        rating: 5,
        comment: 'Excelente profissional, muito pontual e trabalho de qualidade',
        date: '2023-03-16'
      }
    ]
  }
];

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: '1',
    clientId: '1',
    title: 'Limpeza completa de apartamento',
    description: 'Preciso de uma limpeza completa em um apartamento de 80m² com 2 quartos e 1 banheiro',
    category: '1',
    location: {
      address: 'Rua Augusta, 1500, São Paulo, SP',
      lat: -23.5505,
      lng: -46.6333
    },
    budget: 'R$150-200',
    date: '2023-04-10',
    status: 'open',
    photos: ['/placeholder.svg']
  },
  {
    id: '2',
    clientId: '1',
    title: 'Reparo em tomada elétrica',
    description: 'Tomada da cozinha não está funcionando, preciso de um eletricista para verificar',
    category: '3',
    location: {
      address: 'Av. Paulista, 1000, São Paulo, SP',
      lat: -23.5656,
      lng: -46.6565
    },
    budget: 'R$80-120',
    date: '2023-04-12',
    status: 'assigned',
    photos: ['/placeholder.svg', '/placeholder.svg']
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    sender: '1',
    receiver: '2',
    text: 'Olá, gostaria de contratar seu serviço de eletricista',
    timestamp: '2023-04-05T14:30:00',
    read: true
  },
  {
    id: '2',
    sender: '2',
    receiver: '1',
    text: 'Olá! Estou disponível. Qual é o problema com a instalação elétrica?',
    timestamp: '2023-04-05T14:35:00',
    read: true
  },
  {
    id: '3',
    sender: '1',
    receiver: '2',
    text: 'Tenho uma tomada que não está funcionando na cozinha',
    timestamp: '2023-04-05T14:37:00',
    read: true
  },
  {
    id: '4',
    sender: '2',
    receiver: '1',
    text: 'Entendi. Posso visitar amanhã às 14h para verificar. O valor da visita é R$80.',
    timestamp: '2023-04-05T14:40:00',
    read: false
  }
];

export const currentUser = mockUsers[0]; // Cliente logado como padrão
