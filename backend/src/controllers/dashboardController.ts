import { RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { IAuthedRequest, IDashboardStats, IOrderStatusCount, IRevenueTrendItem, ITopProductItem, OrderStatus } from '../types';
import { sendSuccess } from '../utils/response';
import { Response } from 'express';

interface ICountRow extends RowDataPacket {
  total: number;
}

interface IStatusCountRow extends RowDataPacket {
  status: OrderStatus;
  total: number;
}

interface ITrendRow extends RowDataPacket {
  date: string;
  revenue: number;
}

interface ITopProductRow extends RowDataPacket {
  laptopId: number;
  name: string;
  quantitySold: number;
  revenue: number;
  image: string;
}

export const getDashboardStats = async (_req: IAuthedRequest, res: Response): Promise<Response> => {
  const [usersRows] = await pool.query<ICountRow[]>('SELECT COUNT(*) AS total FROM `user`');
  const [brandsRows] = await pool.query<ICountRow[]>('SELECT COUNT(*) AS total FROM `brand`');
  const [laptopsRows] = await pool.query<ICountRow[]>('SELECT COUNT(*) AS total FROM `laptop`');
  const [ordersRows] = await pool.query<ICountRow[]>('SELECT COUNT(*) AS total FROM `order`');
  const [revenueRows] = await pool.query<ICountRow[]>(
    `SELECT COALESCE(SUM(oi.quantity * oi.price), 0) AS total
     FROM ` + "`order_item`" + ` oi
     INNER JOIN ` + "`order`" + ` o ON o.id = oi.order_id
     WHERE o.status <> 'CANCELLED'`
  );
  const [statusRows] = await pool.query<IStatusCountRow[]>('SELECT status, COUNT(*) AS total FROM `order` GROUP BY status');
  const [trendRows] = await pool.query<ITrendRow[]>(
    `SELECT DATE(o.order_date) AS date, COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
     FROM ` + "`order`" + ` o
     INNER JOIN ` + "`order_item`" + ` oi ON oi.order_id = o.id
     WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       AND o.status <> 'CANCELLED'
     GROUP BY DATE(o.order_date)
     ORDER BY date ASC`
  );
  const [topProductRows] = await pool.query<ITopProductRow[]>(
    `SELECT l.id AS laptopId, l.name, COALESCE(SUM(oi.quantity), 0) AS quantitySold, COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue, l.image
     FROM ` + "`order_item`" + ` oi
     INNER JOIN ` + "`laptop`" + ` l ON l.id = oi.laptop_id
     INNER JOIN ` + "`order`" + ` o ON o.id = oi.order_id
     WHERE o.status <> 'CANCELLED'
     GROUP BY l.id, l.name, l.image
     ORDER BY quantitySold DESC, revenue DESC
     LIMIT 5`
  );

  const stats: IDashboardStats = {
    totalUsers: usersRows[0]?.total ?? 0,
    totalBrands: brandsRows[0]?.total ?? 0,
    totalLaptops: laptopsRows[0]?.total ?? 0,
    totalOrders: ordersRows[0]?.total ?? 0,
    totalRevenue: Number(revenueRows[0]?.total ?? 0),
    orderStatusCounts: statusRows.map((row): IOrderStatusCount => ({ status: row.status, total: row.total })),
    revenueTrend: trendRows.map((row): IRevenueTrendItem => ({ date: row.date, revenue: Number(row.revenue) })),
    topProducts: topProductRows.map((row): ITopProductItem => ({
      laptopId: row.laptopId,
      name: row.name,
      quantitySold: Number(row.quantitySold),
      revenue: Number(row.revenue),
      image: row.image,
    })),
  };

  return sendSuccess(res, stats, 'Dashboard stats fetched successfully');
};
