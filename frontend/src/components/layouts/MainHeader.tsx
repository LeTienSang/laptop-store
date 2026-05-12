import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUserRole, isAuthenticated, getCurrentUserName, clearToken } from '../../lib/auth'

const MainHeader = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const role = getCurrentUserRole()
  const isAdmin = role?.toUpperCase() === 'ADMIN'
  const isLoggedIn = isAuthenticated()
  const userName = getCurrentUserName()

  const handleLogout = () => {
    clearToken()
    setShowUserMenu(false)
    navigate('/')
  }

  const navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Laptop', path: '/laptops' },
    { label: 'Giỏ hàng', path: '/cart' },
    ...(isAdmin ? [{ label: 'Admin Panel', path: '/admin/laptops' }] : []),
  ]
  
  const loginLabel = isLoggedIn ? (userName || 'User') : 'Đăng nhập'
  const loginPath = !isLoggedIn ? '/login' : undefined

  return (
    <header className='mb-6 flex items-center justify-between'>
      <Link to='/' className='text-lg font-extrabold tracking-wide'>
        <span className='text-[#f59b24]'>LAPTOP</span><span className='text-[#202020]'>STORE</span>
      </Link>

      <nav className='hidden gap-7 md:flex'>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`text-sm uppercase tracking-[0.04em] ${isActive ? 'font-bold text-[#f59b24]' : 'text-[#4b4b4b]'}`}
            >
              {item.label}
            </Link>
          )
        })}
        
        {/* User Menu */}
        {isLoggedIn ? (
          <div className='relative'>
            <button
              type='button'
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`text-sm uppercase tracking-[0.04em] ${pathname === '/profile' ? 'font-bold text-[#f59b24]' : 'text-[#4b4b4b]'} cursor-pointer transition hover:text-[#f59b24]`}
            >
              {loginLabel}
            </button>
            {showUserMenu && (
              <div className='absolute right-0 mt-2 w-40 rounded-lg bg-white shadow-lg border border-[#e0e0e0] z-50'>
                <button
                  type='button'
                  onClick={handleLogout}
                  className='w-full px-4 py-2.5 text-left text-sm text-[#333] hover:bg-[#f59b24] hover:text-white transition rounded-lg'
                >
                  Đăng Xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          loginPath && (
            <Link
              to={loginPath}
              className={`text-sm uppercase tracking-[0.04em] ${pathname === loginPath ? 'font-bold text-[#f59b24]' : 'text-[#4b4b4b]'}`}
            >
              {loginLabel}
            </Link>
          )
        )}
      </nav>
    </header>
  )
}

export default MainHeader
