import { useState } from 'react'
import { Link } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'

type CartItem = {
	id: number
	name: string
	price: number
	qty: number
	image: string
}

const orderItems: CartItem[] = [
	{ id: 5, name: 'MacBook Pro 14"', price: 1890, qty: 1, image: '/pictures/laptops/laptop5.jpg' },
	{ id: 1, name: 'Dell XPS 13', price: 950, qty: 2, image: '/pictures/laptops/laptop1.png' },
	{ id: 6, name: 'Asus Zenbook 14', price: 990, qty: 1, image: '/pictures/laptops/laptop6.jpg' },
]

const fmt = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

const CheckoutPage = () => {
	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		zip: '',
		payment: 'card',
	})
	const [submitted, setSubmitted] = useState(false)

	const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

	const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0)
	const shipping = 15
	const total = subtotal + shipping

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitted(true)
	}

	if (submitted) {
		return (
			<div className='min-h-screen bg-[#f4f4f4]'>
				<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
					<MainHeader />
				</div>
				<main className='mx-auto w-full max-w-[1220px] px-4 pb-10 pt-16 sm:px-9'>
					<div className='mx-auto max-w-[520px] rounded-xl bg-white p-10 text-center shadow-sm'>
						<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-500'>
							✓
						</div>
						<h1 className='mb-2 text-2xl font-extrabold text-[#151515]'>Order Placed!</h1>
						<p className='mb-1 text-sm text-[#777]'>Thank you for your purchase.</p>
						<p className='mb-6 text-sm text-[#777]'>
							Your order total is <span className='font-bold text-[#f59b24]'>{fmt(total)}</span>
						</p>
						<Link
							to='/'
							className='inline-block rounded-full bg-[#f59b24] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
						>
							Back to Home
						</Link>
					</div>
				</main>
				<MainFooter />
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-[#f4f4f4]'>
			<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
				<MainHeader />
			</div>

			<div className='mx-auto w-full max-w-[1220px] px-4 sm:px-9'>
				<nav className='flex items-center gap-1.5 text-xs text-[#999]'>
					<Link to='/' className='transition-colors hover:text-[#f59b24]'>Home</Link>
					<span>/</span>
					<Link to='/cart' className='transition-colors hover:text-[#f59b24]'>Cart</Link>
					<span>/</span>
					<span className='text-[#555]'>Checkout</span>
				</nav>
			</div>

			<main className='mx-auto w-full max-w-[1220px] px-4 pb-10 pt-7 sm:px-9'>
				<h1 className='mb-6 text-2xl font-extrabold tracking-tight text-[#151515]'>Checkout</h1>

				<form onSubmit={handleSubmit} className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]'>
					{/* Shipping & Payment */}
					<div className='space-y-6'>
						{/* Contact Info */}
						<div className='rounded-xl bg-white p-6 shadow-sm'>
							<h2 className='mb-4 text-sm font-bold uppercase tracking-wide text-[#222]'>Contact Information</h2>
							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								<div>
									<label className='mb-1 block text-xs font-semibold text-[#555]'>First Name</label>
									<input
										type='text'
										required
										value={form.firstName}
										onChange={(e) => update('firstName', e.target.value)}
										className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
									/>
								</div>
								<div>
									<label className='mb-1 block text-xs font-semibold text-[#555]'>Last Name</label>
									<input
										type='text'
										required
										value={form.lastName}
										onChange={(e) => update('lastName', e.target.value)}
										className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
									/>
								</div>
								<div>
									<label className='mb-1 block text-xs font-semibold text-[#555]'>Email</label>
									<input
										type='email'
										required
										value={form.email}
										onChange={(e) => update('email', e.target.value)}
										className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
									/>
								</div>
								<div>
									<label className='mb-1 block text-xs font-semibold text-[#555]'>Phone</label>
									<input
										type='tel'
										required
										value={form.phone}
										onChange={(e) => update('phone', e.target.value)}
										className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
									/>
								</div>
							</div>
						</div>

						{/* Shipping Address */}
						<div className='rounded-xl bg-white p-6 shadow-sm'>
							<h2 className='mb-4 text-sm font-bold uppercase tracking-wide text-[#222]'>Shipping Address</h2>
							<div className='space-y-4'>
								<div>
									<label className='mb-1 block text-xs font-semibold text-[#555]'>Address</label>
									<input
										type='text'
										required
										value={form.address}
										onChange={(e) => update('address', e.target.value)}
										className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
									/>
								</div>
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
									<div>
										<label className='mb-1 block text-xs font-semibold text-[#555]'>City</label>
										<input
											type='text'
											required
											value={form.city}
											onChange={(e) => update('city', e.target.value)}
											className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
										/>
									</div>
									<div>
										<label className='mb-1 block text-xs font-semibold text-[#555]'>ZIP Code</label>
										<input
											type='text'
											required
											value={form.zip}
											onChange={(e) => update('zip', e.target.value)}
											className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Payment Method */}
						<div className='rounded-xl bg-white p-6 shadow-sm'>
							<h2 className='mb-4 text-sm font-bold uppercase tracking-wide text-[#222]'>Payment Method</h2>
							<div className='flex items-center gap-3 rounded-lg border border-[#f59b24] bg-[#fef9f2] p-3.5'>
								<span className='text-sm font-medium text-[#333]'>Cash on Delivery (COD)</span>
							</div>
						</div>
					</div>

					{/* Order Summary */}
					<div className='h-fit space-y-6'>
						<div className='rounded-xl bg-white p-6 shadow-sm'>
							<h2 className='mb-5 text-sm font-bold uppercase tracking-wide text-[#222]'>Your Order</h2>

							<div className='space-y-4'>
								{orderItems.map((item) => (
									<div key={item.id} className='flex items-center gap-3'>
										<img className='h-14 w-14 rounded-lg object-cover' src={item.image} alt={item.name} />
										<div className='flex-1'>
											<p className='text-sm font-semibold text-[#212121]'>{item.name}</p>
											<p className='text-[11px] text-[#999]'>Qty: {item.qty}</p>
										</div>
										<p className='text-sm font-bold text-[#f59b24]'>{fmt(item.price * item.qty)}</p>
									</div>
								))}
							</div>

							<div className='mt-5 space-y-3 border-t border-[#f0f0f0] pt-4 text-sm'>
								<div className='flex justify-between text-[#666]'>
									<span>Subtotal</span>
									<span className='font-semibold text-[#333]'>{fmt(subtotal)}</span>
								</div>
								<div className='flex justify-between text-[#666]'>
									<span>Shipping</span>
									<span className='font-semibold text-[#333]'>{fmt(shipping)}</span>
								</div>
							</div>

							<div className='mt-4 flex justify-between border-t border-[#f0f0f0] pt-4 text-base font-extrabold text-[#151515]'>
								<span>Total</span>
								<span className='text-[#f59b24]'>{fmt(total)}</span>
							</div>

							<button
								type='submit'
								className='mt-6 w-full rounded-full bg-[#f59b24] py-3 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
							>
								Place Order
							</button>

							<Link
								to='/cart'
								className='mt-3 block text-center text-xs text-[#999] transition-colors hover:text-[#f59b24]'
							>
								← Back to Cart
							</Link>
						</div>
					</div>
				</form>
			</main>

			<MainFooter />
		</div>
	)
}

export default CheckoutPage
