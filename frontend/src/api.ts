import { User, Vehicle } from './types';

const BASE_URL = 'http://localhost:5000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Something went wrong');
  }

  return data as T;
}

export interface CreateVehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateVehicleInput {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export const api = {
  // Auth
  register: (body: { email: string; password: string }) =>
    request<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Vehicles
  getVehicles: () => request<Vehicle[]>('/vehicles'),

  searchVehicles: (query: string, category: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    return request<Vehicle[]>(`/vehicles/search?${params.toString()}`);
  },

  createVehicle: (body: CreateVehicleInput) =>
    request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateVehicle: (id: number, body: UpdateVehicleInput) =>
    request<{ message: string }>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteVehicle: (id: number) =>
    request<{ message: string }>(`/vehicles/${id}`, {
      method: 'DELETE',
    }),

  purchaseVehicle: (id: number) =>
    request<{ message: string; remainingQuantity: number }>(`/vehicles/${id}/purchase`, {
      method: 'POST',
    }),

  restockVehicle: (id: number, amount: number) =>
    request<{ message: string; newQuantity: number }>(`/vehicles/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
};