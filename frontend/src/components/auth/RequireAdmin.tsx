import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUserRole } from '../../lib/auth'
import type { ReactNode } from 'react'

export default function RequireAdmin({ children }: { children: ReactNode }) {
	const location = useLocation()
	const role = getCurrentUserRole()

	if (!role) {
		return <Navigate to='/login' replace state={{ from: location.pathname }} />
	}

	// Check for lowercase 'admin' role for consistency
	if (role.toLowerCase() !== 'admin') {
		return <Navigate to='/' replace state={{ from: location.pathname }} />
	}

	return <>{children}</>
}

