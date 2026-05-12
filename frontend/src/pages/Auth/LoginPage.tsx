import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import { login } from '../../lib/api'
import { getCurrentUserRole } from '../../lib/auth'

const LoginPage = () => {
	const navigate = useNavigate()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const onSubmit = async () => {
		setError(null)
		setLoading(true)
		try {
			await login(username, password)
			// Redirect based on role
			const role = getCurrentUserRole()
			if (role?.toLowerCase() === 'admin') {
				navigate('/admin/laptops')
			} else {
				navigate('/')
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-[#f4f4f4]'>
			<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
				<MainHeader />
			</div>

			<main className='mx-auto flex w-full max-w-[460px] flex-col px-4 pb-16 pt-8'>
				<div className='rounded-xl bg-white p-8 shadow-sm'>
					<div className='mb-7 text-center'>
						<h1 className='mb-1 text-2xl font-extrabold tracking-tight text-[#151515]'>Chào mừng trở lại</h1>
						<p className='text-xs text-[#999]'>Đăng nhập vào tài khoản của bạn</p>
					</div>

					<form
						className='space-y-4'
						onSubmit={(e) => {
							e.preventDefault()
							onSubmit()
						}}
					>
						<div>
							<label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-[#555]'>
								Email
							</label>
							<input
								type='email'
								placeholder='bạn@vídụ.com'
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className='w-full rounded-lg border border-[#e3e3e3] px-4 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
							/>
						</div>

						<div>
							<label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-[#555]'>
								Mật khẩu
							</label>
							<input
								type='password'
								placeholder='••••••••'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className='w-full rounded-lg border border-[#e3e3e3] px-4 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
							/>
						</div>

						<div className='flex items-center justify-between text-xs'>
							<label className='flex items-center gap-1.5 text-[#666]'>
								<input type='checkbox' className='accent-[#f59b24]' />
								Ghi nhớ tôi
							</label>
							<a href='#' className='text-[#f59b24] transition hover:underline'>
								Quên mật khẩu?
							</a>
						</div>

						{error && <p className='text-xs text-red-600'>{error}</p>}

						<button
							type='submit'
							className='w-full rounded-full bg-[#f59b24] py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
							disabled={loading}
						>
							{loading ? 'Signing in...' : 'Sign In'}
						</button>
					</form>

					<p className='mt-6 text-center text-xs text-[#999]'>
						Don't have an account?{' '}
						<Link to='/register' className='font-semibold text-[#f59b24] transition hover:underline'>
							Create one
						</Link>
					</p>
				</div>
			</main>
		</div>
	)
}

export default LoginPage
