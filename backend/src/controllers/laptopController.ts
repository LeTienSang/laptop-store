import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { IAuthedRequest, ILaptop, ILaptopFilterQuery, ILaptopRequestBody } from '../types';
import { sendError, sendSuccess } from '../utils/response';
import { Response } from 'express';
import { vnAccentSql, removeVnAccents } from '../utils/searchUtils';

interface ILaptopRow extends RowDataPacket {
  id: number;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  price: number;
  stock: number;
  brand_id: number;
  image: string;
  description: string;
  brand_name: string;
  created_at: string;
  
}

interface ICountRow extends RowDataPacket {
  total: number;
}

const mapLaptop = (row: ILaptopRow): any => ({
  id: row.id,
  name: row.name,
  cpu: row.cpu,
  ram: row.ram,
  storage: row.storage,
  gpu: row.gpu,
  price: Number(row.price),
  stock: Number(row.stock),
  brand_id: row.brand_id,
  image: row.image,
  description: row.description,
  brandName: row.brand_name,
  createdAt: row.created_at,
});

const buildLaptopFilters = (query: ILaptopFilterQuery): { where: string; params: Array<string | number> } => {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (query.keyword) {
    const term = removeVnAccents(query.keyword.trim());
    conditions.push(`${vnAccentSql('l.name')} LIKE ?`);
    params.push(`%${term}%`);
  }
  if (query.brandId) {
    conditions.push('l.brand_id = ?');
    params.push(Number(query.brandId));
  }
  if (query.minPrice) {
    conditions.push('l.price >= ?');
    params.push(Number(query.minPrice));
  }
  if (query.maxPrice) {
    conditions.push('l.price <= ?');
    params.push(Number(query.maxPrice));
  }
  if (query.cpu) {
    conditions.push('l.cpu LIKE ?');
    params.push(`%${query.cpu.trim()}%`);
  }
  if (query.ram) {
    conditions.push('l.ram LIKE ?');
    params.push(`%${query.ram.trim()}%`);
  }
  if (query.gpu) {
    conditions.push('l.gpu LIKE ?');
    params.push(`%${query.gpu.trim()}%`);
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
};

export const getLaptops = async (
  req: IAuthedRequest<Record<string, string | string[]>, unknown, unknown, ILaptopFilterQuery>,
  res: Response
): Promise<Response> => {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit as string) || 12, 1);
  const offset = (page - 1) * limit;
  const { where, params } = buildLaptopFilters(req.query);

  const baseQuery = `
    FROM laptop l
    INNER JOIN brand b ON b.id = l.brand_id
    ${where}
  `;

  const [countRows] = await pool.query<ICountRow[]>(`SELECT COUNT(*) AS total ${baseQuery}`, params);
  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await pool.query<ILaptopRow[]>(
    `SELECT l.id, l.name, l.cpu, l.ram, l.storage, l.gpu, l.price, l.stock, l.brand_id, l.image, l.description, b.name AS brand_name, l.created_at ${baseQuery} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return sendSuccess(
    res,
    {
      items: rows.map(mapLaptop),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    'Laptops fetched successfully'
  );
};

export const getLaptopById = async (req: IAuthedRequest<{ id: string }>, res: Response): Promise<Response> => {
  const laptopId = Number(req.params.id);
  if (Number.isNaN(laptopId)) {
    return sendError(res, 'Invalid laptop id', 400);
  }

  const [rows] = await pool.query<ILaptopRow[]>(
    `SELECT l.id, l.name, l.cpu, l.ram, l.storage, l.gpu, l.price, l.stock, l.brand_id, l.image, l.description, b.name AS brand_name, l.created_at
     FROM laptop l
     INNER JOIN brand b ON b.id = l.brand_id
     WHERE l.id = ?`,
    [laptopId]
  );

  if (rows.length === 0) {
    return sendError(res, 'Laptop not found', 404);
  }

  return sendSuccess(res, mapLaptop(rows[0]), 'Laptop fetched successfully');
};

export const createLaptop = async (req: IAuthedRequest<Record<string, never>, unknown, ILaptopRequestBody>, res: Response): Promise<Response> => {
  const { name, cpu, ram, storage, gpu, price, stock, brandId, image, description } = req.body;

  if (!name || price === undefined || stock === undefined || !brandId) {
    return sendError(res, 'Name, price, stock and brandId are required', 400);
  }

  if (typeof stock !== 'number' || stock < 0) {
    return sendError(res, 'Stock must be a non-negative integer', 400);
  }

  if (typeof price !== 'number' || price < 0) {
    return sendError(res, 'Price must be a non-negative number', 400);
  }

  const [brandRows] = await pool.query<RowDataPacket[]>('SELECT id FROM brand WHERE id = ?', [brandId]);
  if (brandRows.length === 0) {
    return sendError(res, 'Brand not found', 404);
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO laptop (name, cpu, ram, storage, gpu, price, stock, brand_id, image, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      name.trim(),
      cpu?.trim() || '',
      ram?.trim() || '',
      storage?.trim() || '',
      gpu?.trim() || '',
      price,
      stock,
      brandId,
      image?.trim() || null,
      description?.trim() || null
    ]
  );

  const [rows] = await pool.query<ILaptopRow[]>(
    `SELECT l.id, l.name, l.cpu, l.ram, l.storage, l.gpu, l.price, l.stock, l.brand_id, l.image, l.description, b.name AS brand_name, l.created_at
     FROM laptop l
     INNER JOIN brand b ON b.id = l.brand_id
     WHERE l.id = ?`,
    [result.insertId]
  );

  return sendSuccess(res, rows.length > 0 ? mapLaptop(rows[0]) : null, 'Laptop created successfully', 201);
};

export const updateLaptop = async (
  req: IAuthedRequest<{ id: string }, unknown, ILaptopRequestBody>,
  res: Response
): Promise<Response> => {
  const laptopId = Number(req.params.id);
  if (Number.isNaN(laptopId)) {
    return sendError(res, 'Invalid laptop id', 400);
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];
  const body = req.body;

  const pushField = (fieldName: string, value: string | number | null | undefined): void => {
    if (value === undefined) {
      return;
    }
    fields.push(`${fieldName} = ?`);
    values.push(value);
  };

  pushField('name', body.name?.trim());
  pushField('cpu', body.cpu?.trim());
  pushField('ram', body.ram?.trim());
  pushField('storage', body.storage?.trim());
  pushField('gpu', body.gpu?.trim());
  if (body.price !== undefined) {
    if (typeof body.price !== 'number' || body.price < 0) return sendError(res, 'Price must be non-negative', 400);
    pushField('price', Number(body.price));
  }
  if (body.stock !== undefined) {
    if (typeof body.stock !== 'number' || body.stock < 0) return sendError(res, 'Stock must be a non-negative integer', 400);
    pushField('stock', Number(body.stock));
  }
  if (body.brandId !== undefined) {
    const [brandRows] = await pool.query<RowDataPacket[]>('SELECT id FROM brand WHERE id = ?', [body.brandId]);
    if (brandRows.length === 0) {
      return sendError(res, 'Brand not found', 404);
    }
    pushField('brand_id', Number(body.brandId));
  }
  if (body.image !== undefined) {
    pushField('image', body.image?.trim() || null);
  }
  pushField('description', body.description?.trim());

  if (fields.length === 0) {
    return sendError(res, 'No fields to update', 400);
  }

  values.push(laptopId);
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE laptop SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    return sendError(res, 'Laptop not found', 404);
  }

  const [rows] = await pool.query<ILaptopRow[]>(
    `SELECT l.id, l.name, l.cpu, l.ram, l.storage, l.gpu, l.price, l.stock, l.brand_id, l.image, l.description, b.name AS brand_name, l.created_at
     FROM laptop l
     INNER JOIN brand b ON b.id = l.brand_id
     WHERE l.id = ?`,
    [laptopId]
  );

  return sendSuccess(res, rows.length > 0 ? mapLaptop(rows[0]) : null, 'Laptop updated successfully');
};

export const deleteLaptop = async (req: IAuthedRequest<{ id: string }>, res: Response): Promise<Response> => {
  const laptopId = Number(req.params.id);
  if (Number.isNaN(laptopId)) {
    return sendError(res, 'Invalid laptop id', 400);
  }

  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM laptop WHERE id = ?', [laptopId]);
  if (result.affectedRows === 0) {
    return sendError(res, 'Laptop not found', 404);
  }

  return sendSuccess(res, null, 'Laptop deleted successfully');
};

export const getNewLaptops = async (_req: any, res: Response): Promise<Response> => {
  const [rows] = await pool.query<ILaptopRow[]>(
    `SELECT l.id, l.name, l.cpu, l.ram, l.storage, l.gpu, l.price, l.stock, l.brand_id, l.image, l.description, b.name AS brand_name, l.created_at
     FROM laptop l
     INNER JOIN brand b ON b.id = l.brand_id
     ORDER BY l.created_at DESC
     LIMIT 8`
  );

  return res.json(rows.map(mapLaptop));
};

