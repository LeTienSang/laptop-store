import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import {
  IAuthedRequest,
  IAuthRequestBody,
  IAuthUser,
  ILoginRequestBody,
  IJwtPayload,
  IUser,
} from '../types';
import { sendError, sendSuccess } from '../utils/response';
import { Response } from 'express';

interface IUserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const signToken = (user: IAuthUser): string => {
  const payload: IJwtPayload = { userId: user.id, role: user.role };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

export const register = async (req: IAuthedRequest<Record<string, never>, unknown, IAuthRequestBody>, res: Response): Promise<Response> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 'Name, email and password are required', 400);
  }

  if (password.length < 6) {
    return sendError(res, 'Password must be at least 6 characters', 400);
  }

  const [existingUsers] = await pool.query<IUserRow[]>('SELECT id FROM `user` WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    return sendError(res, 'Email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO `user` (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
    [name.trim(), email.trim().toLowerCase(), hashedPassword, 'CUSTOMER']
  );

  const [createdUsers] = await pool.query<IUserRow[]>('SELECT id, name, email, role FROM `user` WHERE id = ?', [result.insertId]);
  const createdUser = createdUsers[0];
  const tokenUser: IAuthUser = { id: createdUser.id, name: createdUser.name, email: createdUser.email, role: (createdUser.role || '').toUpperCase() as IAuthUser['role'] };
  const safeUser: IUser = {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: (createdUser.role || '').toUpperCase() as IUser['role'],
  };

  return sendSuccess(
    res,
    {
      user: safeUser,
      token: signToken(tokenUser),
    },
    'Register successful',
    201
  );
};

export const login = async (req: IAuthedRequest<Record<string, never>, unknown, ILoginRequestBody>, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  const [users] = await pool.query<IUserRow[]>('SELECT id, name, email, password, role FROM `user` WHERE email = ?', [
    email.trim().toLowerCase(),
  ]);

  if (users.length === 0) {
    return sendError(res, 'Invalid credentials', 401);
  }

  const user = users[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return sendError(res, 'Invalid credentials', 401);
  }

  const authUser: IAuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role || '').toUpperCase() as IAuthUser['role'],
  };

  return sendSuccess(
    res,
    {
      user: authUser,
      token: signToken(authUser),
    },
    'Login successful'
  );
};
