import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { truncateTables, closeDb } from '../setup';
import { pool } from '../../src/config/db';
import jwt from 'jsonwebtoken';

describe('Inventory Endpoints', () => {
  let adminToken: string;
  let customerToken: string;
  let vehicleId: number;

  beforeEach(async () => {
    await truncateTables();

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_dealership';

    const [adminResult]: any = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['subramanya@dealership.com', 'hashed_pass', 'ADMIN']
    );
    adminToken = jwt.sign(
      { id: adminResult.insertId, email: 'subramanya@dealership.com', role: 'ADMIN' },
      secret,
      { expiresIn: '1h' }
    );

    const [customerResult]: any = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['customer@dealership.com', 'hashed_pass', 'CUSTOMER']
    );
    customerToken = jwt.sign(
      { id: customerResult.insertId, email: 'customer@dealership.com', role: 'CUSTOMER' },
      secret,
      { expiresIn: '1h' }
    );

    // Seed vehicle with quantity 1
    const [vehResult]: any = await pool.query(
      'INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
      ['Honda', 'Civic', 'Sedan', 22000, 1]
    );
    vehicleId = vehResult.insertId;
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should allow customer to purchase a vehicle and decrement stock', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Purchase successful');
      expect(response.body.remainingQuantity).toBe(0);

      // Verify in DB
      const [rows]: any = await pool.query('SELECT quantity FROM vehicles WHERE id = ?', [vehicleId]);
      expect(rows[0].quantity).toBe(0);
    });

    it('should return 400 when attempting to purchase an out-of-stock vehicle', async () => {
      // First purchase drains stock to 0
      await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`);

      // Second purchase should fail
      const response = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Vehicle is out of stock');
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should allow ADMIN to restock a vehicle', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Vehicle restocked successfully');
      expect(response.body.newQuantity).toBe(6);

      const [rows]: any = await pool.query('SELECT quantity FROM vehicles WHERE id = ?', [vehicleId]);
      expect(rows[0].quantity).toBe(6);
    });

    it('should forbid CUSTOMER from restocking', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 5 });

      expect(response.status).toBe(403);
    });
  });
});