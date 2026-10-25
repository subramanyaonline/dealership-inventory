import { pool } from '../src/config/db';

export const truncateTables = async () => {
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE users');
  await pool.query('TRUNCATE TABLE vehicles');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
};

export const closeDb = async () => {
  await pool.end();
};