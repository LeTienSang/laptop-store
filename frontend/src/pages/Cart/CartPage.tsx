import { useState } from 'react'
import { Link } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'

type CartItem = {
	id: number
	name: string
	brand: string
	price: number
	qty: number
	image: string
}

const initialCart: CartItem[] = [
	{ id: 5, name: 'MacBook Pro 14"', brand: 'Apple', price: 1890, qty: 1, image: '/pictures/laptops/laptop5.jpg' },
	{ id: 1, name: 'Dell XPS 13', brand: 'Dell', price: 950, qty: 2, image: '/pictures/laptops/laptop1.png' },
	{ id: 6, name: 'Asus Zenbook 14', brand: 'Asus', price: 990, qty: 1, image: '/pictures/laptops/laptop6.jpg' },
]

const fmt = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

const CartPage = () => {
	const [items, setItems] = useState(initialCart)

	const updateQty = (id: number, delta: number) =>
		setItems((prev) =>
			prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)),
		)

	const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id))

	const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
	const shipping = subtotal > 0 ? 15 : 0
	const total = subtotal + shipping

	return (
		<div className='min-h-screen bg-[#f4f4f4]'>
			<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
				<MainHeader />
			</div>

			{/* Breadcrumb */}
			<div className='mx-auto w-full max-w-[1220px] px-4 sm:px-9'>
				<nav className='flex items-center gap-1.5 text-xs text-[#999]'>
					<Link to='/' className='transition-colors hover:text-[#f59b24]'>Home</Link>
					<span>/</span>
					<span className='text-[#555]'>Cart</span>
				</nav>
			</div>

			<main className='mx-auto w-full max-w-[1220px] px-4 pb-10 pt-7 sm:px-9'>
				<h1 className='mb-6 text-2xl font-extrabold tracking-tight text-[#151515]'>Shopping Cart</h1>

				{items.length === 0 ? (
					<div className='rounded-xl bg-white p-12 text-center shadow-sm'>
						<p className='mb-4 text-sm text-[#999]'>Your cart is empty</p>
						<Link
						to='/laptops'
							className='inline-block rounded-full bg-[#f59b24] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
						>
							Continue Shopping
						</Link>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]'>
						{/* Cart Items */}
						<div className='space-y-4'>
							{/* Table Header */}
							<div className='hidden rounded-lg bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999] shadow-sm sm:grid sm:grid-cols-[1fr_120px_120px_100px_40px]'>
								<span>Product</span>
								<span className='text-center'>Price</span>
								<span className='text-center'>Quantity</span>
								<span className='text-center'>Total</span>
								<span />
							</div>

							{items.map((item) => (
								<div
									key={item.id}
									className='grid grid-cols-1 items-center gap-4 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_120px_120px_100px_40px] sm:p-5'
								>
									{/* Product */}
									<div className='flex items-center gap-4'>
										<img
											className='h-20 w-20 rounded-lg object-cover'
											src={item.image}
											alt={item.name}
										/>
										<div>
											<Link
												to={`/laptops/${item.id}`}
												className='text-sm font-semibold text-[#212121] transition-colors hover:text-[#f59b24]'
											>
												{item.name}
											</Link>
											<p className='text-[11px] text-[#999]'>{item.brand}</p>
										</div>
									</div>

									{/* Price */}
									<p className='text-center text-sm font-semibold text-[#555]'>
										{fmt(item.price)}
									</p>

									{/* Quantity */}
									<div className='flex items-center justify-center'>
										<div className='flex items-center overflow-hidden rounded-full border border-[#e0e0e0]'>
											<button
												type='button'
												onClick={() => updateQty(item.id, -1)}
												className='h-8 w-8 text-xs font-bold text-[#555] transition hover:bg-[#f0f0f0]'
											>
												−
											</button>
											<span className='flex h-8 w-8 items-center justify-center text-xs font-semibold text-[#333]'>
												{item.qty}
											</span>
											<button
												type='button'
												onClick={() => updateQty(item.id, 1)}
												className='h-8 w-8 text-xs font-bold text-[#555] transition hover:bg-[#f0f0f0]'
											>
												+
											</button>
										</div>
									</div>

									{/* Total */}
									<p className='text-center text-sm font-bold text-[#f59b24]'>
										{fmt(item.price * item.qty)}
									</p>

									{/* Remove */}
									<button
										type='button'
										onClick={() => remove(item.id)}
										className='mx-auto text-sm text-[#ccc] transition-colors hover:text-red-400'
										aria-label='Remove item'
									>
										✕
									</button>
								</div>
							))}
						</div>

						{/* Summary */}
						<div className='h-fit rounded-xl bg-white p-6 shadow-sm'>
							<h2 className='mb-5 text-sm font-bold uppercase tracking-wide text-[#222]'>Order Summary</h2>

							<div className='space-y-3 border-b border-[#f0f0f0] pb-4 text-sm'>
								<div className='flex justify-between text-[#666]'>
									<span>Subtotal</span>
									<span className='font-semibold text-[#333]'>{fmt(subtotal)}</span>
								</div>
								<div className='flex justify-between text-[#666]'>
									<span>Shipping</span>
									<span className='font-semibold text-[#333]'>{fmt(shipping)}</span>
								</div>
							</div>

							<div className='mt-4 flex justify-between text-base font-extrabold text-[#151515]'>
								<span>Total</span>
								<span className='text-[#f59b24]'>{fmt(total)}</span>
							</div>

							<Link
								to='/checkout'
								className='mt-6 block w-full rounded-full bg-[#f59b24] py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
							>
								Proceed to Checkout
							</Link>

							<Link
								to='/laptops'
								className='mt-3 block text-center text-xs text-[#999] transition-colors hover:text-[#f59b24]'
							>
								← Continue Shopping
							</Link>
						</div>
					</div>
				)}
			</main>

			<MainFooter />
		</div>
	)
}

export default CartPage
