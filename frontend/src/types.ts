export interface User {
  id: number;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}