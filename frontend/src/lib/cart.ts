import type { Laptop } from './api'

export type CartItem = {
	id: number
	name: string
	price: number
	qty: number
	image?: string
}

const CART_KEY = 'cart_items'

function safeParseJson<T>(text: string): T | null {
	try {
		return JSON.parse(text) as T
	} catch {
		return null
	}
}

export function loadCart(): CartItem[] {
	try {
		const raw = window.localStorage.getItem(CART_KEY)
		if (!raw) return []
		const parsed = safeParseJson<CartItem[]>(raw)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export function saveCart(items: CartItem[]): void {
	try {
		window.localStorage.setItem(CART_KEY, JSON.stringify(items))
	} catch {
		// ignore
	}
}

export function clearCart(): void {
	try {
		window.localStorage.removeItem(CART_KEY)
	} catch {
		// ignore
	}
}

export function addToCart(params: { laptop: Laptop; image?: string; qty?: number }): void {
	const qtyToAdd = Math.max(1, params.qty ?? 1)
	const priceNum = typeof params.laptop.price === 'string' ? Number(params.laptop.price) : params.laptop.price

	const items = loadCart()
	const existing = items.find((i) => i.id === params.laptop.id)
	if (existing) {
		existing.qty += qtyToAdd
		existing.image = params.image ?? existing.image
		saveCart(items)
		return
	}

	const newItem: CartItem = {
		id: params.laptop.id,
		name: params.laptop.name,
		price: Number.isFinite(priceNum) ? priceNum : 0,
		qty: qtyToAdd,
		image: params.image,
	}
	saveCart([...items, newItem])
}

export function setQty(id: number, qty: number): void {
	const items = loadCart()
	const next = items
		.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
		.filter((i) => i.qty > 0)
	saveCart(next)
}

export function removeFromCart(id: number): void {
	const items = loadCart().filter((i) => i.id !== id)
	saveCart(items)
}

