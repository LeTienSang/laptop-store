import { setToken } from './auth'

const TOKEN_KEY = 'auth_token'

function getStoredToken(): string | null {
	try {
		return window.localStorage.getItem(TOKEN_KEY)
	} catch {
		return null
	}
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
	const url = path.startsWith('/') ? path : `/${path}`

	const headers = new Headers(options.headers)
	headers.set('Content-Type', 'application/json')

	const token = getStoredToken()
	if (token) {
		headers.set('Authorization', `Bearer ${token}`)
	}

	const resp = await fetch(`/api${url}`, {
		...options,
		headers,
	})

	const text = await resp.text()
	
	// Check if response is HTML instead of JSON
	if (text.trim().startsWith('<')) {
		console.error('API returned HTML instead of JSON:', text.substring(0, 200))
		throw new Error('Server returned HTML instead of JSON. Backend may not be running.')
	}
	
	const parsed = text ? JSON.parse(text) : {}
	
	// Unwrap response envelope if it exists (extract 'data' field from { success, message, data, ... })
	const data = (parsed as any)?.data !== undefined ? (parsed as any).data : parsed

	if (!resp.ok) {
		const msg =
			typeof parsed === 'object' && parsed
				? (parsed as any).error || (parsed as any).message || text
				: text
		throw new Error(typeof msg === 'string' ? msg : `HTTP ${resp.status}`)
	}

	return data as T
}

// Auth
export type LoginResponse = { token: string }
type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T; error?: string | null } | T

export async function login(username: string, password: string): Promise<LoginResponse> {
	const res = await fetchJson<ApiEnvelope<{ token?: string }>>('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email: username, password } satisfies { email: string; password: string }),
	})
	const token = 'data' in res ? res.data?.token : (res as { token?: string }).token
	if (!token) {
		throw new Error('Login succeeded but no token was returned by the backend')
	}
	setToken(token)
	return { token }
}

export async function register(username: string, password: string, _role?: string): Promise<void> {
	await fetchJson<unknown>('/auth/register', {
		method: 'POST',
		body: JSON.stringify({ username, password, email: username }),
	})
}

// Laptops
export type Laptop = {
	id: number
	name: string
	price: number | string
	stock: number
	brand_id: number
	brandName?: string
	description: string
	cpu: string
	ram: string
	storage: string
	gpu: string
	image?: string
	created_at?: string
}

export type Pagination = {
	totalItems: number
	totalPages: number
	currentPage: number
}

export type ListResponse<T> = {
	success: boolean
	data: T[]
	pagination: Pagination
}

export type LaptopListResponse = {
	success: boolean
	data: Laptop[]
	pagination: Pagination
}

export type LaptopQuery = {
	keyword?: string
	brandId?: number | string
	minPrice?: number
	maxPrice?: number
	cpu?: string
	ram?: string
	storage?: string
	gpu?: string
	page?: number
	limit?: number
}

const buildQueryString = (params?: Record<string, unknown>): string => {
	if (!params) return ''
	const searchParams = new URLSearchParams()
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) continue
		if (typeof value === 'string') {
			const trimmed = value.trim()
			if (!trimmed || trimmed.toLowerCase() === 'all') continue
			searchParams.set(key, trimmed)
			continue
		}
		searchParams.set(key, String(value))
	}
	const query = searchParams.toString()
	return query ? `?${query}` : ''
}

export async function getLaptops(params?: LaptopQuery): Promise<Laptop[]> {
	const query = buildQueryString(params)
	const data = await fetchJson<unknown>(`/laptops${query}`, { method: 'GET' })

	if (Array.isArray(data)) {
		return data as Laptop[]
	}

	if (data && typeof data === 'object') {
		const obj = data as any
		// Case 1: data is already the items array
		if (Array.isArray(obj)) return obj as Laptop[]
		
		// Case 2: data is the unwrapped envelope { items, pagination }
		if (obj.items && Array.isArray(obj.items)) return obj.items as Laptop[]
		
		// Case 3: data is the full envelope { success, data: { items, pagination } }
		if (obj.data) {
			if (Array.isArray(obj.data)) return obj.data as Laptop[]
			if (typeof obj.data === 'object' && obj.data.items && Array.isArray(obj.data.items)) {
				return obj.data.items as Laptop[]
			}
		}
	}

	throw new Error('Unexpected response from /laptops')
}

export async function getLaptopsPage(params?: LaptopQuery): Promise<PagedListResponse<Laptop>> {
	const query = buildQueryString(params)
	return fetchPagedList<Laptop>(`/laptops${query}`)
}

export async function getLaptopById(id: number | string): Promise<Laptop> {
	return fetchJson<Laptop>(`/laptops/${id}`, { method: 'GET' })
}

// Brands
export type Brand = {
	id: number
	name: string
	laptop_count?: number
}

export type BrandQuery = {
	keyword?: string
	page?: number
	limit?: number
}

// Locations
export type Province = {
	province_code: string
	province_name: string
}

export type Commune = {
	commune_code: string
	commune_name: string
	parent_province_code: string
}

export type ProvinceQuery = {
	keyword?: string
	page?: number
	limit?: number
}

export type CommuneQuery = ProvinceQuery & {
	provinceCode?: string
}

export async function getProvinces(params?: ProvinceQuery): Promise<Province[]> {
	const query = buildQueryString(params)
	const data = await fetchJson<unknown>(`/locations/provinces${query}`, { method: 'GET' })

	if (Array.isArray(data)) {
		return data as Province[]
	}

	if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as ListResponse<Province>).data)) {
		return (data as ListResponse<Province>).data
	}

	throw new Error('Unexpected response from /locations/provinces')
}

export async function getCommunes(params?: CommuneQuery): Promise<Commune[]> {
	const query = buildQueryString(params)
	const data = await fetchJson<unknown>(`/locations/communes${query}`, { method: 'GET' })

	if (Array.isArray(data)) {
		return data as Commune[]
	}

	if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as ListResponse<Commune>).data)) {
		return (data as ListResponse<Commune>).data
	}

	throw new Error('Unexpected response from /locations/communes')
}

export async function getBrands(params?: BrandQuery): Promise<Brand[]> {
	const query = buildQueryString(params)
	const data = await fetchJson<unknown>(`/brands${query}`, { method: 'GET' })

	if (Array.isArray(data)) {
		return data as Brand[]
	}

	if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as ListResponse<Brand>).data)) {
		return (data as ListResponse<Brand>).data
	}

	throw new Error('Unexpected response from /brands')
}

export async function getBrandsPage(params?: BrandQuery): Promise<PagedListResponse<Brand>> {
	const query = buildQueryString(params)
	return fetchPagedList<Brand>(`/brands${query}`)
}

export async function createBrand(name: string): Promise<{ id: number }> {
	return fetchJson<{ id: number }>('/brands', {
		method: 'POST',
		body: JSON.stringify({ name }),
	})
}

export async function updateBrand(id: number, name: string): Promise<void> {
	return fetchJson<void>(`/brands/${id}`, {
		method: 'PUT',
		body: JSON.stringify({ name }),
	})
}

export async function deleteBrand(id: number): Promise<void> {
	return fetchJson<void>(`/brands/${id}`, { method: 'DELETE' })
}

export type LaptopInput = {
	name: string
	price: number
	stock: number
	brandId: number
	description?: string
	cpu?: string
	ram?: string
	storage?: string
	gpu?: string
	image?: string
}

export async function createLaptop(input: LaptopInput): Promise<Laptop> {
	return fetchJson<Laptop>('/laptops', { method: 'POST', body: JSON.stringify(input) })
}

export async function updateLaptop(id: number, input: LaptopInput): Promise<Laptop> {
	return fetchJson<Laptop>(`/laptops/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteLaptop(id: number): Promise<void> {
	await fetchJson<unknown>(`/laptops/${id}`, { method: 'DELETE' })
}

// Orders
export type OrderItem = {
	id: number
	qty: number
	price: number
}

export type CreateOrderInput = {
	phone: string
	address: string
	items: OrderItem[]
}

export type OrderResponse = {
	id: number
	message: string
	total: number
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResponse> {
	return fetchJson<OrderResponse>('/orders', {
		method: 'POST',
		body: JSON.stringify(input),
	})
}

export async function getMyOrders(): Promise<unknown[]> {
	return fetchJson<unknown[]>('/orders/my-orders', { method: 'GET' })
}

// Admin Orders
export type AdminOrder = {
	id: number
	orderDate: string
	status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
	phone: string
	address: string
	userId: number
	userName?: string
	userEmail?: string
	totalAmount?: number
	items?: Array<{
		id: number
		orderId: number
		laptopId: number
		laptopName?: string
		quantity: number
		price: number
	}>
}

export type AdminOrderQuery = {
	keyword?: string
	status?: string
	page?: number
	limit?: number
}

export async function getAllOrders(params?: AdminOrderQuery): Promise<AdminOrder[]> {
	const query = buildQueryString(params)
	const data = await fetchJson<unknown>(`/orders${query}`, { method: 'GET' })

	if (Array.isArray(data)) {
		return data as AdminOrder[]
	}

	if (data && typeof data === 'object') {
		const obj = data as any
		if (Array.isArray(obj)) return obj as AdminOrder[]
		if (obj.items && Array.isArray(obj.items)) return obj.items as AdminOrder[]
		if (obj.data) {
			if (Array.isArray(obj.data)) return obj.data as AdminOrder[]
			if (typeof obj.data === 'object' && obj.data.items && Array.isArray(obj.data.items)) {
				return obj.data.items as AdminOrder[]
			}
		}
	}

	throw new Error('Unexpected response from /orders')
}

export async function getOrdersPage(params?: AdminOrderQuery): Promise<PagedListResponse<AdminOrder>> {
	const query = buildQueryString(params)
	return fetchPagedList<AdminOrder>(`/orders${query}`)
}

export async function getOrderById(id: number): Promise<AdminOrder> {
	const data = await fetchJson<unknown>(`/orders/${id}`, { method: 'GET' })

	if (data && typeof data === 'object' && 'data' in (data as any)) {
		const envelope = data as { data?: unknown }
		if (envelope.data && typeof envelope.data === 'object') {
			return envelope.data as AdminOrder
		}
	}

	if (data && typeof data === 'object') {
		return data as AdminOrder
	}

	throw new Error('Unexpected response from /orders/:id')
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
	return fetchJson<void>(`/orders/${id}/status`, {
		method: 'PUT',
		body: JSON.stringify({ status }),
	})
}

// Users Management
export type User = {
	id: number
	name: string
	email: string
	role: 'ADMIN' | 'CUSTOMER'
	created_at: string
}

export type CreateUserInput = {
	name: string
	email: string
	password: string
	role: 'ADMIN' | 'CUSTOMER'
}

export type UpdateUserInput = {
	name: string
	email: string
	role: 'ADMIN' | 'CUSTOMER'
}

export type ChangePasswordInput = {
	password: string
}

export type UserQuery = {
	keyword?: string
	role?: string
	page?: number
	limit?: number
}

type PagedListResponse<T> = {
	data: T[]
	pagination: Pagination
}

async function fetchPagedList<T>(path: string): Promise<PagedListResponse<T>> {
	const data = await fetchJson<unknown>(path, { method: 'GET' })

	if (Array.isArray(data)) {
		return {
			data: data as T[],
			pagination: {
				totalItems: data.length,
				totalPages: 1,
				currentPage: 1,
			},
		}
	}

	if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as PagedListResponse<T>).data)) {
		return data as PagedListResponse<T>
	}

	throw new Error('Unexpected paged list response')
}

export async function getAllUsers(params?: UserQuery): Promise<User[]> {
	const query = buildQueryString(params)
	const data = await fetchJson<unknown>(`/users${query}`, { method: 'GET' })

	if (data && typeof data === 'object') {
		const obj = data as any
		if (Array.isArray(obj)) return obj as User[]
		if (obj.items && Array.isArray(obj.items)) return obj.items as User[]
		if (obj.data) {
			if (Array.isArray(obj.data)) return obj.data as User[]
			if (typeof obj.data === 'object' && obj.data.items && Array.isArray(obj.data.items)) {
				return obj.data.items as User[]
			}
		}
	}

	throw new Error('Unexpected response from /users')
}

export async function getUsersPage(params?: UserQuery): Promise<PagedListResponse<User>> {
	const query = buildQueryString(params)
	return fetchPagedList<User>(`/users${query}`)
}

export async function getUserById(id: number): Promise<User> {
	return fetchJson<User>(`/users/${id}`, { method: 'GET' })
}

export async function createUser(input: CreateUserInput): Promise<{ id: number }> {
	return fetchJson<{ id: number }>('/users', {
		method: 'POST',
		body: JSON.stringify(input),
	})
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<void> {
	return fetchJson<void>(`/users/${id}`, {
		method: 'PUT',
		body: JSON.stringify(input),
	})
}

export async function changeUserPassword(id: number, input: ChangePasswordInput): Promise<void> {
	return fetchJson<void>(`/users/${id}/password`, {
		method: 'PATCH',
		body: JSON.stringify(input),
	})
}

export async function deleteUser(id: number): Promise<void> {
	return fetchJson<void>(`/users/${id}`, { method: 'DELETE' })
}



export async function uploadImage(file: File): Promise<{ url: string }> {
	const formData = new FormData()
	formData.append('image', file)

	const token = getStoredToken()
	const headers = new Headers()
	if (token) {
		headers.set('Authorization', `Bearer ${token}`)
	}

	const resp = await fetch('/api/upload', {
		method: 'POST',
		body: formData,
		headers,
	})

	if (!resp.ok) {
		const text = await resp.text()
		let msg = text
		try {
			const parsed = JSON.parse(text)
			msg = parsed.message || parsed.error || text
		} catch {
			// ignore
		}
		throw new Error(msg || `Upload failed with status ${resp.status}`)
	}

	const json = await resp.json()
	return (json.data || json) as { url: string }
}
