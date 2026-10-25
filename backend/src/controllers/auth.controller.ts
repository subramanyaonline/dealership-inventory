import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import { registerSchema } from '../validations/auth.validation';

export const register = async (req: Request, res: Response): Promise<void> => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues?.[0]?.message || 'Validation failed';
    res.status(400).json({ error: errorMessage });
    return;
  }

  const { email, password } = parseResult.data;

  try {
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'CUSTOMER']
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        email,
        role: 'CUSTOMER',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};