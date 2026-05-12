const TOKEN_KEY = 'auth_token'

export type JwtPayload = {
	role?: string
	id?: number
	iat?: number
	exp?: number
	[key: string]: unknown
}

export function getToken(): string | null {
	try {
		const token = window.localStorage.getItem(TOKEN_KEY)
		// Validate token is not expired
		if (token && isTokenExpired(token)) {
			clearToken()
			return null
		}
		return token
	} catch {
		return null
	}
}

export function setToken(token: string): void {
	try {
		window.localStorage.setItem(TOKEN_KEY, token)
	} catch {
		// ignore
	}
}

export function clearToken(): void {
	try {
		window.localStorage.removeItem(TOKEN_KEY)
	} catch {
		// ignore
	}
}

function base64UrlDecode(input: string): string {
	// JWT uses base64url, but atob expects base64.
	const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
	// Pad to correct length
	const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
	return atob(padded)
}

export function decodeJwtPayload(token: string): JwtPayload | null {
	try {
		const parts = token.split('.')
		if (parts.length < 2) return null
		const payloadJson = base64UrlDecode(parts[1])
		return JSON.parse(payloadJson) as JwtPayload
	} catch {
		return null
	}
}

export function isTokenExpired(token: string): boolean {
	try {
		const payload = decodeJwtPayload(token)
		if (!payload || !payload.exp) return false
		// exp is in seconds, compare with current time in seconds
		const expirationTime = payload.exp * 1000 // Convert to milliseconds
		return Date.now() >= expirationTime
	} catch {
		return false
	}
}

export function getCurrentUserRole(): string | null {
	const token = getToken()
	if (!token) return null
	const payload = decodeJwtPayload(token)
	// Normalize to lowercase for consistency with backend
	return payload?.role ? String(payload.role).toLowerCase() : null
}

export function getCurrentUserId(): number | null {
	const token = getToken()
	if (!token) return null
	const payload = decodeJwtPayload(token)
	return payload?.id ? Number(payload.id) : null
}

export function getCurrentUserName(): string | null {
	const token = getToken()
	if (!token) return null
	const payload = decodeJwtPayload(token)
	return payload?.name ? String(payload.name) : null
}

export function isAuthenticated(): boolean {
	const token = getToken()
	return token !== null && !isTokenExpired(token)
}
