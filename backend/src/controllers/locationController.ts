import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '../utils/response';

const dbPath = path.join(process.cwd(), 'data', 'db_location.json');
console.log('Location DB path:', dbPath);

const getDbData = async () => {
  try {
    if (!fs.existsSync(dbPath)) {
      console.error('Location DB file not found at:', dbPath);
      return null;
    }
    const raw = await fs.promises.readFile(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading location db:', error);
    return null;
  }
};

export const getProvinces = async (_req: Request, res: Response) => {
  const data = await getDbData();
  if (!data || !data.province) {
    return sendError(res, 'Could not load provinces', 500);
  }
  // Match frontend's LocationProvince type
  const mapped = data.province.map((p: any) => ({
    idProvince: p.idProvince,
    name: p.name,
  }));
  return sendSuccess(res, mapped);
};

export const getCommunes = async (req: Request, res: Response) => {
  const provinceId = (req.query.idProvince || req.query.provinceId || req.query.provinceCode) as string;
  const data = await getDbData();
  if (!data || !data.commune) {
    return sendError(res, 'Could not load communes', 500);
  }

  let filtered = data.commune;
  if (provinceId) {
    filtered = filtered.filter((c: any) => c.idProvince === provinceId);
  }

  // Match frontend's LocationCommune type
  const mapped = filtered.map((c: any) => ({
    idCommune: c.idCommune,
    name: c.name,
    idProvince: c.idProvince,
  }));

  return sendSuccess(res, mapped);
};
