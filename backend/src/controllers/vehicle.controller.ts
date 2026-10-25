import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import { createVehicleSchema, updateVehicleSchema } from '../validations/vehicle.validation';

// POST /api/vehicles (Admin Only)
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  const parseResult = createVehicleSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues?.[0]?.message || 'Validation failed';
    res.status(400).json({ error: errorMsg });
    return;
  }

  const { make, model, category, price, quantity } = parseResult.data;

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
      [make, model, category, price, quantity]
    );

    res.status(201).json({
      id: result.insertId,
      make,
      model,
      category,
      price,
      quantity,
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/vehicles
export const getVehicles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, make, model, category, CAST(price AS DOUBLE) AS price, quantity, created_at, updated_at FROM vehicles ORDER BY id DESC'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/vehicles/search
export const searchVehicles = async (req: Request, res: Response): Promise<void> => {
  const { q, category } = req.query;

  try {
    let sql = 'SELECT id, make, model, category, CAST(price AS DOUBLE) AS price, quantity, created_at, updated_at FROM vehicles WHERE 1=1';
    const params: any[] = [];

    if (category && typeof category === 'string' && category.trim() !== '') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (q && typeof q === 'string' && q.trim() !== '') {
      sql += ' AND (make LIKE ? OR model LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += ' ORDER BY id DESC';

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Search vehicles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/vehicles/:id (Admin Only)
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const parseResult = updateVehicleSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues?.[0]?.message || 'Validation failed';
    res.status(400).json({ error: errorMsg });
    return;
  }

  const updates = parseResult.data;
  const fields = Object.keys(updates);
  if (fields.length === 0) {
    res.status(400).json({ error: 'No fields provided to update' });
    return;
  }

  try {
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE vehicles SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    res.status(200).json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/vehicles/:id (Admin Only)
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM vehicles WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};