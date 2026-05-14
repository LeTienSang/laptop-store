import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { IAuthedRequest, IUser } from '../types';
import { sendError, sendSuccess } from '../utils/response';
import { Response } from 'express';
import { vnAccentSql, removeVnAccents } from '../utils/searchUtils';

interface IUserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  created_at: string;
}

interface IUserCreateBody {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

const mapUser = (row: IUserRow): IUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: (row.role || '').toUpperCase() as IUser['role'],
  createdAt: row.created_at,
});

export const getUsers = async (req: IAuthedRequest<Record<string, never>, unknown, unknown, { keyword?: string, role?: string }>, res: Response): Promise<Response> => {
  const { keyword, role } = req.query;
  const conditions: string[] = [];
  const params: string[] = [];

  if (keyword) {
    const term = removeVnAccents(keyword.trim());
    conditions.push(`(${vnAccentSql('name')} LIKE ? OR email LIKE ?)`);
    const termParam = `%${term}%`;
    params.push(termParam, termParam);
  }

  if (role && role !== 'all') {
    conditions.push('role = ?');
    params.push(role.toUpperCase());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT id, name, email, role, created_at FROM \`user\` ${whereClause} ORDER BY created_at DESC`;

  const [rows] = await pool.query<IUserRow[]>(query, params);
  return sendSuccess(res, rows.map(mapUser), 'Users fetched successfully');
};

export const getUserById = async (req: IAuthedRequest<{ id: string }>, res: Response): Promise<Response> => {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    return sendError(res, 'Invalid user id', 400);
  }

  const [rows] = await pool.query<IUserRow[]>('SELECT id, name, email, role, created_at FROM `user` WHERE id = ?', [userId]);
  if (rows.length === 0) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, mapUser(rows[0]), 'User fetched successfully');
};

export const createUser = async (req: IAuthedRequest<Record<string, never>, unknown, IUserCreateBody>, res: Response): Promise<Response> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 'Name, email and password are required', 400);
  }

  if (password.length < 6) {
    return sendError(res, 'Password must be at least 6 characters', 400);
  }

  const userRole = (role || 'CUSTOMER').toUpperCase();
  if (userRole !== 'ADMIN' && userRole !== 'CUSTOMER') {
    return sendError(res, 'Role must be ADMIN or CUSTOMER', 400);
  }

  const [existingUsers] = await pool.query<IUserRow[]>('SELECT id FROM `user` WHERE email = ?', [email.toLowerCase()]);
  if (existingUsers.length > 0) {
    return sendError(res, 'Email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO `user` (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
    [name.trim(), email.trim().toLowerCase(), hashedPassword, userRole]
  );

  const [createdRows] = await pool.query<IUserRow[]>(
    'SELECT id, name, email, role, created_at FROM `user` WHERE id = ?',
    [result.insertId]
  );

  return sendSuccess(res, createdRows.length > 0 ? mapUser(createdRows[0]) : null, 'User created successfully', 201);
};

export const updateUser = async (req: IAuthedRequest<{ id: string }, unknown, IUserCreateBody>, res: Response): Promise<Response> => {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    return sendError(res, 'Invalid user id', 400);
  }

  const fields: string[] = [];
  const values: Array<string | number> = [];
  const body = req.body;

  if (body.name !== undefined) {
    fields.push('name = ?');
    values.push(body.name.trim());
  }

  if (body.email !== undefined) {
    const [existingUsers] = await pool.query<IUserRow[]>('SELECT id FROM `user` WHERE email = ? AND id != ?', [body.email.toLowerCase(), userId]);
    if (existingUsers.length > 0) {
      return sendError(res, 'Email already exists', 409);
    }
    fields.push('email = ?');
    values.push(body.email.trim().toLowerCase());
  }

  if (body.password !== undefined) {
    if (body.password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    fields.push('password = ?');
    values.push(hashedPassword);
  }

  if (body.role !== undefined) {
    const userRole = body.role.toUpperCase();
    if (userRole !== 'ADMIN' && userRole !== 'CUSTOMER') {
      return sendError(res, 'Role must be ADMIN or CUSTOMER', 400);
    }
    fields.push('role = ?');
    values.push(userRole);
  }

  if (fields.length === 0) {
    return sendError(res, 'No fields to update', 400);
  }

  values.push(userId);
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE \`user\` SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    return sendError(res, 'User not found', 404);
  }

  const [updatedRows] = await pool.query<IUserRow[]>(
    'SELECT id, name, email, role, created_at FROM `user` WHERE id = ?',
    [userId]
  );

  return sendSuccess(res, updatedRows.length > 0 ? mapUser(updatedRows[0]) : null, 'User updated successfully');
};

export const deleteUser = async (req: IAuthedRequest<{ id: string }>, res: Response): Promise<Response> => {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    return sendError(res, 'Invalid user id', 400);
  }

  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM `user` WHERE id = ?', [userId]);
  if (result.affectedRows === 0) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, null, 'User deleted successfully');
};
export const changePassword = async (req: IAuthedRequest<{ id: string }, unknown, { password?: string }>, res: Response): Promise<Response> => {
  const userId = Number(req.params.id);
  const { password } = req.body;

  if (Number.isNaN(userId)) {
    return sendError(res, 'Invalid user id', 400);
  }

  if (!password || password.length < 6) {
    return sendError(res, 'Password must be at least 6 characters', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE `user` SET password = ? WHERE id = ?',
    [hashedPassword, userId]
  );

  if (result.affectedRows === 0) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, null, 'Password updated successfully');
};
