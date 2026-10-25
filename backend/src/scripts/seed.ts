import { pool } from '../config/db';

interface SeedVehicle {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

const vehicles: SeedVehicle[] = [
  // Electric
  { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 38990.00, quantity: 4 },
  { make: 'Tesla', model: 'Model Y', category: 'Electric', price: 44990.00, quantity: 3 },
  { make: 'Hyundai', model: 'Ioniq 5', category: 'Electric', price: 41800.00, quantity: 2 },
  { make: 'Rivian', model: 'R1T', category: 'Electric', price: 71700.00, quantity: 1 },
  { make: 'Polestar', model: 'Polestar 2', category: 'Electric', price: 49900.00, quantity: 0 }, // Out of stock

  // SUVs
  { make: 'Toyota', model: 'RAV4 Hybrid', category: 'SUV', price: 31725.00, quantity: 6 },
  { make: 'Mazda', model: 'CX-5', category: 'SUV', price: 29300.00, quantity: 5 },
  { make: 'Honda', model: 'CR-V', category: 'SUV', price: 30850.00, quantity: 3 },
  { make: 'Subaru', model: 'Outback', category: 'SUV', price: 28895.00, quantity: 4 },
  { make: 'Jeep', model: 'Grand Cherokee', category: 'SUV', price: 40130.00, quantity: 1 },

  // Sedans
  { make: 'Honda', model: 'Accord', category: 'Sedan', price: 27895.00, quantity: 5 },
  { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 26320.00, quantity: 7 },
  { make: 'Hyundai', model: 'Elantra', category: 'Sedan', price: 21625.00, quantity: 4 },
  { make: 'BMW', model: '330i', category: 'Sedan', price: 44500.00, quantity: 2 },
  { make: 'Audi', model: 'A4', category: 'Sedan', price: 41900.00, quantity: 0 }, // Out of stock

  // Trucks
  { make: 'Ford', model: 'F-150 Lightning', category: 'Truck', price: 55974.00, quantity: 2 },
  { make: 'Chevrolet', model: 'Silverado 1500', category: 'Truck', price: 44000.00, quantity: 0 }, // Out of stock
  { make: 'Toyota', model: 'Tacoma TRD', category: 'Truck', price: 38500.00, quantity: 3 },
  { make: 'RAM', model: '1500 Rebel', category: 'Truck', price: 58895.00, quantity: 2 },

  // Coupes
  { make: 'Porsche', model: '911 Carrera', category: 'Coupe', price: 114400.00, quantity: 1 },
  { make: 'BMW', model: 'M4 Competition', category: 'Coupe', price: 82200.00, quantity: 2 },
  { make: 'Ford', model: 'Mustang GT', category: 'Coupe', price: 42495.00, quantity: 3 },
  { make: 'Chevrolet', model: 'Corvette Stingray', category: 'Coupe', price: 68300.00, quantity: 1 },
  { make: 'Lexus', model: 'LC 500', category: 'Coupe', price: 99800.00, quantity: 0 } // Out of stock
];

async function seed() {
  console.log('⏳ Starting vehicle database seed...');

  try {
    // Clear previous seed data to ensure idempotency
    await pool.query('DELETE FROM vehicles');
    console.log('🧹 Cleaned existing vehicles table.');

    for (const v of vehicles) {
      await pool.query(
        'INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [v.make, v.model, v.category, v.price, v.quantity]
      );
    }

    console.log(`✅ Successfully seeded ${vehicles.length} vehicles.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();