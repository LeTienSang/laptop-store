import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { IAuthedRequest, IBrand, IBrandRequestBody } from '../types';
import { sendError, sendSuccess } from '../utils/response';
import { Response } from 'express';

interface IBrandRow extends RowDataPacket {
  id: number;
  name: string;
  created_at: string;
}

const mapBrand = (row: IBrandRow): IBrand => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
});

export const getBrands = async (_req: IAuthedRequest, res: Response): Promise<Response> => {
  const [rows] = await pool.query<IBrandRow[]>('SELECT id, name, created_at FROM brand ORDER BY name ASC');
  return sendSuccess(res, rows.map(mapBrand), 'Brands fetched successfully');
};

export const getBrandById = async (req: IAuthedRequest<{ id: string }>, res: Response): Promise<Response> => {
  const brandId = Number(req.params.id);
  if (Number.isNaN(brandId)) {
    return sendError(res, 'Invalid brand id', 400);
  }

  const [rows] = await pool.query<IBrandRow[]>('SELECT id, name, created_at FROM brand WHERE id = ?', [brandId]);
  if (rows.length === 0) {
    return sendError(res, 'Brand not found', 404);
  }

  return sendSuccess(res, mapBrand(rows[0]), 'Brand fetched successfully');
};

export const createBrand = async (req: IAuthedRequest<Record<string, never>, unknown, IBrandRequestBody>, res: Response): Promise<Response> => {
  const { name } = req.body;
  if (!name) {
    return sendError(res, 'Brand name is required', 400);
  }

  const [result] = await pool.execute<ResultSetHeader>('INSERT INTO brand (name, created_at) VALUES (?, NOW())', [name.trim()]);
  const [rows] = await pool.query<IBrandRow[]>('SELECT id, name, created_at FROM brand WHERE id = ?', [result.insertId]);

  return sendSuccess(res, rows.length > 0 ? mapBrand(rows[0]) : null, 'Brand created successfully', 201);
};

export const updateBrand = async (req: IAuthedRequest<{ id: string }, unknown, IBrandRequestBody>, res: Response): Promise<Response> => {
  const brandId = Number(req.params.id);
  const { name } = req.body;

  if (Number.isNaN(brandId)) {
    return sendError(res, 'Invalid brand id', 400);
  }

  if (!name) {
    return sendError(res, 'Brand name is required', 400);
  }

  const [result] = await pool.execute<ResultSetHeader>('UPDATE brand SET name = ? WHERE id = ?', [name.trim(), brandId]);
  if (result.affectedRows === 0) {
    return sendError(res, 'Brand not found', 404);
  }

  const [rows] = await pool.query<IBrandRow[]>('SELECT id, name, created_at FROM brand WHERE id = ?', [brandId]);
  return sendSuccess(res, rows.length > 0 ? mapBrand(rows[0]) : null, 'Brand updated successfully');
};

export const deleteBrand = async (req: IAuthedRequest<{ id: string }>, res: Response): Promise<Response> => {
  const brandId = Number(req.params.id);
  if (Number.isNaN(brandId)) {
    return sendError(res, 'Invalid brand id', 400);
  }

  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM brand WHERE id = ?', [brandId]);
  if (result.affectedRows === 0) {
    return sendError(res, 'Brand not found', 404);
  }

  return sendSuccess(res, null, 'Brand deleted successfully');
};
