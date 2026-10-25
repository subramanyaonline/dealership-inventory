import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { truncateTables, closeDb } from '../setup';
import { pool } from '../../src/config/db';
import { RowDataPacket } from 'mysql2';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new customer successfully and return 201', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'subramanya@dealership.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('subramanya@dealership.com');
      expect(response.body.user.role).toBe('CUSTOMER');
      expect(response.body.user).not.toHaveProperty('password');

      // Verify in MySQL that the password was hashed
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ?',
        ['subramanya@dealership.com']
      );
      expect(rows.length).toBe(1);
      expect(rows[0].password).not.toBe('Password123!');
    });

    it('should return 400 if email is already in use', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@dealership.com',
          password: 'Password123!',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@dealership.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already in use');
    });

    it('should return 400 if validation fails on invalid email or short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Seed a customer user for testing login
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'subramanya@dealership.com',
          password: 'Password123!',
        });
    });

    it('should login successfully with valid credentials and return a JWT', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'subramanya@dealership.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('subramanya@dealership.com');
      expect(response.body.user.role).toBe('CUSTOMER');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'subramanya@dealership.com',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ghost@dealership.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });
  });
});