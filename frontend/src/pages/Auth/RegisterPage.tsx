import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import { register } from '../../lib/api'

const RegisterPage = () => {
	const navigate = useNavigate()
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const onSubmit = async () => {
		setError(null)
		if (!email.trim()) {
			setError('Email is required')
			return
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters')
			return
		}
		if (password !== confirmPassword) {
			setError('Password confirmation does not match')
			return
		}

		setLoading(true)
		try {
			// Backend expects: { username, password, role }
			// FE uses Email as backend "username".
			await register(email.trim(), password, 'CUSTOMER')
			navigate('/login')
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Register failed')
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
						<h1 className='mb-1 text-2xl font-extrabold tracking-tight text-[#151515]'>Tạo tài khoản</h1>
						<p className='text-xs text-[#999]'>Tham gia cộng đồng cửa hàng laptop của chúng tôi</p>
					</div>

					<form
						className='space-y-4'
						onSubmit={(e) => {
							e.preventDefault()
							onSubmit()
						}}
					>
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-[#555]'>
									Tên
								</label>
								<input
									type='text'
									placeholder='Nguyễn'
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className='w-full rounded-lg border border-[#e3e3e3] px-4 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-[#555]'>
									Họ
								</label>
								<input
									type='text'
									placeholder='Văn A'
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className='w-full rounded-lg border border-[#e3e3e3] px-4 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
								/>
							</div>
						</div>

						<div>
							<label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-[#555]'>
								Email
							</label>
							<input
								type='email'
								placeholder='bạn@vídụ.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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

						<div>
							<label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-[#555]'>
								Xác nhận mật khẩu
							</label>
							<input
								type='password'
								placeholder='••••••••'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className='w-full rounded-lg border border-[#e3e3e3] px-4 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
							/>
						</div>

						<label className='flex items-start gap-1.5 text-xs text-[#666]'>
							<input type='checkbox' className='mt-0.5 accent-[#f59b24]' />
							Tôi đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật
						</label>

						<button
							type='submit'
							className='w-full rounded-full bg-[#f59b24] py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
							disabled={loading}
						>
							{loading ? 'Creating...' : 'Create Account'}
						</button>

						{error && <p className='text-center text-xs text-red-600'>{error}</p>}
					</form>

					<p className='mt-6 text-center text-xs text-[#999]'>
						Already have an account?{' '}
						<Link to='/login' className='font-semibold text-[#f59b24] transition hover:underline'>
							Sign In
						</Link>
					</p>
				</div>
			</main>
		</div>
	)
}

export default RegisterPage
