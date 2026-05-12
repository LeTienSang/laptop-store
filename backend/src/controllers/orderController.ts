import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import {
  IAuthedRequest,
  ICreateOrderRequestBody,
  IOrder,
  IOrderItem,
  IUpdateOrderStatusRequestBody,
  OrderStatus,
} from '../types';
import { sendError, sendSuccess } from '../utils/response';
import { Response } from 'express';

interface IOrderRow extends RowDataPacket {
  id: number;
  user_id: number;
  order_date: string;
  status: OrderStatus;
  phone: string;
  address: string;
  user_name?: string;
  user_email?: string;
}

interface IOrderItemRow extends RowDataPacket {
  id: number;
  order_id: number;
  laptop_id: number;
  quantity: number;
  price: number;
  laptop_name?: string;
  laptop_image?: string;
}

interface ILaptopStockRow extends RowDataPacket {
  id: number;
  name: string;
  stock: number;
  price: number;
  image: string;
}

const allowedOrderStatuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const buildOrder = (orderRow: IOrderRow, items: IOrderItem[]): IOrder => ({
  id: orderRow.id,
  userId: orderRow.user_id,
  orderDate: orderRow.order_date,
  status: orderRow.status,
  phone: orderRow.phone,
  address: orderRow.address,
  totalAmount: items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
  items,
  userName: orderRow.user_name,
  userEmail: orderRow.user_email,
});

const getOrderItemsByOrderId = async (orderId: number): Promise<IOrderItem[]> => {
  const [rows] = await pool.query<IOrderItemRow[]>(
    `SELECT oi.id, oi.order_id, oi.laptop_id, oi.quantity, oi.price, l.name AS laptop_name, l.image AS laptop_image
     FROM order_item oi
     INNER JOIN laptop l ON l.id = oi.laptop_id
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [orderId]
  );

  return rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    laptopId: row.laptop_id,
    quantity: row.quantity,
    price: Number(row.price),
    laptopName: row.laptop_name,
    laptopImage: row.laptop_image,
  }));
};

const getOrderById = async (orderId: number): Promise<IOrder | null> => {
  const [orders] = await pool.query<IOrderRow[]>(
    `SELECT o.id, o.user_id, o.order_date, o.status, o.phone, o.address, u.name AS user_name, u.email AS user_email
     FROM ` + "`order`" + ` o
     INNER JOIN ` + "`user`" + ` u ON u.id = o.user_id
     WHERE o.id = ?`,
    [orderId]
  );

  if (orders.length === 0) {
    return null;
  }

  const items = await getOrderItemsByOrderId(orderId);
  return buildOrder(orders[0], items);
};

const validateOrderItems = (items: ICreateOrderRequestBody['items']): { valid: boolean; message?: string } => {
  if (!items || items.length === 0) {
    return { valid: false, message: 'Order items are required' };
  }

  for (const item of items) {
    if (!item?.laptopId || !item.quantity || item.quantity < 1) {
      return { valid: false, message: 'Each order item needs laptopId and quantity >= 1' };
    }
  }

  return { valid: true };
};

export const createOrder = async (
  req: IAuthedRequest<Record<string, never>, unknown, ICreateOrderRequestBody>,
  res: Response
): Promise<Response> => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  const { phone, addressDetail, ward, province, items } = req.body;
  if (!phone || !addressDetail || !ward || !province) {
    return sendError(res, 'Phone, address detail, ward and province are required', 400);
  }

  const validation = validateOrderItems(items);
  if (!validation.valid) {
    return sendError(res, validation.message || 'Invalid order items', 400);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const laptopIds = (items || []).map((item) => Number(item!.laptopId));
    const uniqueLaptopIds = [...new Set(laptopIds)];
    const placeholders = uniqueLaptopIds.map(() => '?').join(', ');
    const [laptops] = await connection.query<ILaptopStockRow[]>(
      `SELECT id, name, stock, price, image FROM laptop WHERE id IN (${placeholders}) FOR UPDATE`,
      uniqueLaptopIds
    );

    if (laptops.length !== uniqueLaptopIds.length) {
      await connection.rollback();
      return sendError(res, 'One or more laptops were not found', 404);
    }

    const laptopMap = new Map<number, ILaptopStockRow>(laptops.map((laptop) => [laptop.id, laptop]));
    for (const item of items || []) {
      const laptop = laptopMap.get(Number(item!.laptopId));
      if (!laptop) {
        await connection.rollback();
        return sendError(res, 'One or more laptops were not found', 404);
      }
      if (laptop.stock < Number(item!.quantity)) {
        await connection.rollback();
        return sendError(res, `Insufficient stock for ${laptop.name}`, 400);
      }
    }

    const address = `${addressDetail.trim()}, ${ward.trim()}, ${province.trim()}`;
    const totalAmount = (items || []).reduce((sum, item) => {
      const laptop = laptopMap.get(Number(item!.laptopId));
      return sum + Number(laptop?.price || 0) * Number(item!.quantity);
    }, 0);

    const [orderResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO `order` (user_id, order_date, status, phone, address) VALUES (?, NOW(), ?, ?, ?)',
      [req.user.id, 'PENDING', phone.trim(), address]
    );

    for (const item of items || []) {
      const laptop = laptopMap.get(Number(item!.laptopId));
      if (!laptop) {
        throw new Error('Laptop lookup failed during order creation');
      }

      await connection.execute<ResultSetHeader>(
        'INSERT INTO `order_item` (order_id, laptop_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, laptop.id, Number(item!.quantity), Number(laptop.price)]
      );

      await connection.execute<ResultSetHeader>(
        'UPDATE laptop SET stock = stock - ? WHERE id = ?',
        [Number(item!.quantity), laptop.id]
      );
    }

    await connection.commit();

    const createdOrder = await getOrderById(orderResult.insertId);
    if (createdOrder) {
      // compute totalAmount from items since schema does not store total_amount
      if (createdOrder.items && createdOrder.items.length > 0) {
        createdOrder.totalAmount = createdOrder.items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
      } else {
        createdOrder.totalAmount = 0;
      }
    }
    return sendSuccess(res, createdOrder, 'Order created successfully', 201);
  } catch (error) {
    await connection.rollback();
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return sendError(res, message, 500);
  } finally {
    connection.release();
  }
};

export const getMyOrders = async (req: IAuthedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  const [orders] = await pool.query<IOrderRow[]>(
    `SELECT o.id, o.user_id, o.order_date, o.status, o.phone, o.address, u.name AS user_name, u.email AS user_email
     FROM ` + "`order`" + ` o
     INNER JOIN ` + "`user`" + ` u ON u.id = o.user_id
     WHERE o.user_id = ?
     ORDER BY o.order_date DESC`,
    [req.user.id]
  );

  const items = await Promise.all(orders.map((order) => getOrderItemsByOrderId(order.id)));
  return sendSuccess(
    res,
    orders.map((order, index) => buildOrder(order, items[index] || [])),
    'My orders fetched successfully'
  );
};

export const getAllOrders = async (req: IAuthedRequest<Record<string, never>, unknown, unknown, { status?: string }>, res: Response): Promise<Response> => {
  const status = req.query.status;
  const params: Array<string> = [];
  let whereClause = '';

  if (status && allowedOrderStatuses.includes(status as OrderStatus)) {
    whereClause = 'WHERE o.status = ?';
    params.push(status);
  }

  const [orders] = await pool.query<IOrderRow[]>(
    `SELECT o.id, o.user_id, o.order_date, o.status, o.phone, o.address, u.name AS user_name, u.email AS user_email
     FROM ` + "`order`" + ` o
     INNER JOIN ` + "`user`" + ` u ON u.id = o.user_id
     ${whereClause}
     ORDER BY o.order_date DESC`,
    params
  );

  const items = await Promise.all(orders.map((order) => getOrderItemsByOrderId(order.id)));
  return sendSuccess(
    res,
    orders.map((order, index) => buildOrder(order, items[index] || [])),
    'Orders fetched successfully'
  );
};

export const getOrderDetail = async (req: IAuthedRequest<{ id: string }>, res: Response): Promise<Response> => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  const orderId = Number(req.params.id);
  if (Number.isNaN(orderId)) {
    return sendError(res, 'Invalid order id', 400);
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
    return sendError(res, 'Forbidden', 403);
  }

  return sendSuccess(res, order, 'Order fetched successfully');
};

export const updateOrderStatus = async (
  req: IAuthedRequest<{ id: string }, unknown, IUpdateOrderStatusRequestBody>,
  res: Response
): Promise<Response> => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  if (Number.isNaN(orderId)) {
    return sendError(res, 'Invalid order id', 400);
  }

  if (!status || !allowedOrderStatuses.includes(status)) {
    return sendError(res, 'Invalid order status', 400);
  }

  const [result] = await pool.execute<ResultSetHeader>('UPDATE `order` SET status = ? WHERE id = ?', [status, orderId]);
  if (result.affectedRows === 0) {
    return sendError(res, 'Order not found', 404);
  }

  const order = await getOrderById(orderId);
  return sendSuccess(res, order, 'Order status updated successfully');
};
