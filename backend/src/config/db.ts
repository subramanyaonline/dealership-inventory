import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: isTest
    ? (process.env.DB_NAME_TEST || 'dealership_test')
    : (process.env.DB_NAME || 'dealership_dev'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});