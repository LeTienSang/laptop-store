import { Request } from 'express';

// Types aligned with docs/database.md (and compatibility aliases for existing controllers)
export type UserRole = 'ADMIN' | 'CUSTOMER';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface IBrand {
  id: number;
  name: string;
  createdAt?: string;
}

export interface ILaptop {
  id: number;
  name: string;
  cpu?: string | null;
  ram?: string | null;
  storage?: string | null;
  gpu?: string | null;
  description?: string | null;
  price: number;
  stock: number;
  brandId: number;
  image?: string | null;
  brandName?: string;
  createdAt?: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt?: string;
}

export interface IOrderItem {
  id: number;
  orderId: number;
  laptopId: number;
  quantity: number;
  price: number;
}

export interface IOrder {
  id: number;
  userId: number;
  orderDate: string;
  status: OrderStatus;
  phone: string;
  address: string;
  totalAmount?: number;
  items?: IOrderItem[];
  userName?: string;
  userEmail?: string;
}

export interface IAuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface IJwtPayload {
  userId: number;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Request / body shapes (compatibility names)
export interface IAuthRequestBody {
  name?: string;
  email?: string;
  password?: string;
}
export interface ILoginRequestBody {
  email?: string;
  password?: string;
}
export interface IBrandRequestBody { name?: string }
export interface ILaptopRequestBody {
  name?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  price?: number;
  stock?: number;
  brandId?: number;
  image?: string;
  description?: string;
}

// Backwards-compatible aliases
export type ILaptopCreateBody = ILaptopRequestBody;
export type ILaptopUpdateBody = ILaptopRequestBody;
export interface ILaptopFilterQuery {
  page?: string;
  limit?: string;
  keyword?: string;
  brandId?: string;
  minPrice?: string;
  maxPrice?: string;
  cpu?: string;
  ram?: string;
  gpu?: string;
}
export interface IOrderItemInput { laptopId?: number; quantity?: number }
export interface ICreateOrderRequestBody { phone?: string; addressDetail?: string; ward?: string; province?: string; items?: IOrderItemInput[] }
export interface IUpdateOrderStatusRequestBody { status?: OrderStatus }

// Dashboard / reporting types
export interface IOrderStatusCount { status: OrderStatus; total: number }
export interface IRevenueTrendItem { date: string; revenue: number }
export interface ITopProductItem { laptopId: number; name: string; quantitySold: number; revenue: number; image: string }
export interface IDashboardStats {
  totalUsers: number;
  totalBrands: number;
  totalLaptops: number;
  totalOrders: number;
  totalRevenue: number;
  orderStatusCounts: IOrderStatusCount[];
  revenueTrend: IRevenueTrendItem[];
  topProducts: ITopProductItem[];
}

// API response helpers
export interface IApiResponse<T> { success: boolean; message: string; data?: T; error?: string | null }
export interface IErrorResponse { success: false; message: string; error?: string | null }

// Express request with auth
export interface IAuthedRequest<Params = Record<string, never>, ResBody = unknown, ReqBody = unknown, ReqQuery = Record<string, never>> extends Request<Params, ResBody, ReqBody, ReqQuery> { user?: IAuthUser }
