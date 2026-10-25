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
    throw new Error(data.error || 'Something went wrong');
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: { email: string; password: string }) =>
    request<{ message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Vehicles
  getVehicles: () => request<any[]>('/vehicles'),

  searchVehicles: (query: string, category: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    return request<any[]>(`/vehicles/search?${params.toString()}`);
  },

  createVehicle: (body: any) =>
    request<any>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateVehicle: (id: number, body: any) =>
    request<any>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteVehicle: (id: number) =>
    request<any>(`/vehicles/${id}`, {
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