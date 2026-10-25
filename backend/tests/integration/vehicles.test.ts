import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { truncateTables, closeDb } from '../setup';
import { pool } from '../../src/config/db';
import jwt from 'jsonwebtoken';

describe('Vehicles Endpoints', () => {
  let adminToken: string;
  let customerToken: string;

  beforeEach(async () => {
    await truncateTables();

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_dealership';

    // Seed admin user
    const [adminResult]: any = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['subramanya@dealership.com', 'hashed_pass', 'ADMIN']
    );
    adminToken = jwt.sign(
      { id: adminResult.insertId, email: 'subramanya@dealership.com', role: 'ADMIN' },
      secret,
      { expiresIn: '1h' }
    );

    // Seed customer user
    const [customerResult]: any = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      ['customer@dealership.com', 'hashed_pass', 'CUSTOMER']
    );
    customerToken = jwt.sign(
      { id: customerResult.insertId, email: 'customer@dealership.com', role: 'CUSTOMER' },
      secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('POST /api/vehicles', () => {
    it('should allow ADMIN to create a vehicle', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Toyota',
          model: 'Camry',
          category: 'Sedan',
          price: 25000,
          quantity: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.make).toBe('Toyota');
      expect(response.body.quantity).toBe(5);
    });

    it('should return 403 when CUSTOMER tries to create a vehicle', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          make: 'Honda',
          model: 'Civic',
          category: 'Sedan',
          price: 22000,
          quantity: 3,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return a list of vehicles for authenticated users', async () => {
      await pool.query(
        'INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
        ['Tesla', 'Model 3', 'Electric', 40000, 2]
      );

      const response = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].model).toBe('Model 3');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/vehicles');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      await pool.query(
        'INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
        [
          'Ford', 'F-150', 'Truck', 35000, 4,
          'Ford', 'Mustang', 'Coupe', 45000, 2,
        ]
      );
    });

    it('should filter vehicles by category and query term', async () => {
      const response = await request(app)
        .get('/api/vehicles/search?q=Mustang&category=Coupe')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].model).toBe('Mustang');
    });
  });
});