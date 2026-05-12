import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'
import { clearCart, loadCart, removeFromCart, setQty, type CartItem } from '../../lib/cart'

const fmt = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

const imageOptions = [
	'/pictures/laptops/laptop1.png',
	'/pictures/laptops/laptop2.jpg',
	'/pictures/laptops/laptop3.jpg',
	'/pictures/laptops/laptop4.jpg',
	'/pictures/laptops/laptop5.jpg',
	'/pictures/laptops/laptop6.jpg',
]

function getFallbackImage(id: number): string {
	return imageOptions[(id - 1) % imageOptions.length]
}

const CartPageApi = () => {
	const [items, setItems] = useState<CartItem[]>([])

	const refresh = () => setItems(loadCart())

	useEffect(() => {
		refresh()
	}, [])

	const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])
	const total = subtotal

	const updateQty = (id: number, delta: number) => {
		const target = items.find((i) => i.id === id)
		if (!target) return
		setQty(id, target.qty + delta)
		refresh()
	}

	const remove = (id: number) => {
		removeFromCart(id)
		refresh()
	}

	return (
		<div className='min-h-screen bg-[#f4f4f4]'>
			<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
				<MainHeader />
			</div>

			<div className='mx-auto w-full max-w-[1220px] px-4 sm:px-9'>
				<nav className='flex items-center gap-1.5 text-xs text-[#999]'>
				<Link to='/' className='transition-colors hover:text-[#f59b24]'>Trang Chủ</Link>
				<span>/</span>
				<span className='text-[#555]'>Giỏ Hàng</span>
				</nav>
			</div>

			<main className='mx-auto w-full max-w-[1220px] px-4 pb-10 pt-7 sm:px-9'>
				<h1 className='mb-6 text-2xl font-extrabold tracking-tight text-[#151515]'>Giỏ Hàng Mua Sắm</h1>

				{items.length === 0 ? (
					<div className='rounded-xl bg-white p-12 text-center shadow-sm'>
						<p className='mb-4 text-sm text-[#999]'>Giỏ hàng của bạn đang trống</p>
						<Link
							to='/laptops'
							className='inline-block rounded-full bg-[#f59b24] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
						>
							Tiếp Tục Mua Sắm
						</Link>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]'>
						<div className='space-y-4'>
							<div className='hidden rounded-lg bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#999] shadow-sm sm:grid sm:grid-cols-[1fr_120px_120px_100px_40px]'>
								<span>Sản Phẩm</span>
								<span className='text-center'>Giá</span>
								<span className='text-center'>Số Lượng</span>
								<span className='text-center'>Tổng</span>
								<span />
							</div>

							{items.map((item) => (
								<div
									key={item.id}
									className='grid grid-cols-1 items-center gap-4 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_120px_120px_100px_40px] sm:p-5'
								>
									<div className='flex items-center gap-4'>
										<img
											className='h-20 w-20 rounded-lg object-cover'
											src={item.image ?? getFallbackImage(item.id)}
											alt={item.name}
										/>
										<div>
											<Link
												to={`/laptops/${item.id}`}
												className='text-sm font-semibold text-[#212121] transition-colors hover:text-[#f59b24]'
											>
												{item.name}
											</Link>
											<p className='text-[11px] text-[#999]'>Laptop</p>
										</div>
									</div>

									<p className='text-center text-sm font-semibold text-[#555]'>{fmt(item.price)}</p>

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

									<p className='text-center text-sm font-bold text-[#f59b24]'>
										{fmt(item.price * item.qty)}
									</p>

									<button
										type='button'
										onClick={() => remove(item.id)}
										className='mx-auto text-sm text-[#ccc] transition-colors hover:text-red-500'
										aria-label='Remove item'
									>
										✕
									</button>
								</div>
							))}
						</div>

						<div className='h-fit rounded-xl bg-white p-6 shadow-sm'>
						<h2 className='mb-5 text-sm font-bold uppercase tracking-wide text-[#222]'>Tóm Tắt Đơn Hàng</h2>

						<div className='space-y-3 border-b border-[#f0f0f0] pb-4 text-sm'>
							<div className='flex justify-between text-[#666]'>
								<span>Tạm Tính</span>
								<span className='font-semibold text-[#333]'>{fmt(subtotal)}</span>
							</div>
						</div>

						<div className='mt-4 flex justify-between text-base font-extrabold text-[#151515]'>
							<span>Tổng Cộng</span>
								<span className='text-[#f59b24]'>{fmt(total)}</span>
							</div>

							<div className='mt-6 space-y-3'>
								<Link
									to='/checkout'
									className='block w-full rounded-full bg-[#f59b24] py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
								>
									Tiến Hành Thanh Toán
								</Link>

								<button
									type='button'
									onClick={() => {
										clearCart()
										refresh()
									}}
									className='block w-full rounded-full border border-[#e0e0e0] py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#666] transition hover:bg-[#f5f5f5]'
								>
									Xóa Giỏ Hàng
								</button>
							</div>
						</div>
					</div>
				)}
			</main>

			<MainFooter />
		</div>
	)
}

export default CartPageApi

