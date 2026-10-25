import { z } from 'zod';

export const createVehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than zero'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
});

export const updateVehicleSchema = createVehicleSchema.partial();