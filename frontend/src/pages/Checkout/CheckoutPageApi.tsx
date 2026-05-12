import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'
import { clearCart, loadCart, type CartItem } from '../../lib/cart'
import { createOrder } from '../../lib/api'

const fmt = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

const imageOptions = [
	'/pictures/laptops/laptop1.png',
	'/pictures/laptops/laptop2.jpg',
	'/pictures/laptops/laptop3.jpg',
	'/pictures/laptops/laptop4.jpg',
	'/pictures/laptops/laptop5.jpg',
	'/pictures/laptops/laptop6.jpg',
]

const LOCATION_API = 'http://localhost:3001'

type LocationProvince = {
	idProvince: string
	name: string
}

type LocationCommune = {
	idCommune: string
	name: string
	idProvince: string
}

const CheckoutPageApi = () => {
	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		addressDetail: '',
		provinceName: '',
		communeName: '',
		payment: 'card',
	})
	const [submitted, setSubmitted] = useState(false)
	const [orderError, setOrderError] = useState<string | null>(null)
	const [locationError, setLocationError] = useState<string | null>(null)
	const [provinces, setProvinces] = useState<LocationProvince[]>([])
	const [communes, setCommunes] = useState<LocationCommune[]>([])
	const [tempProvinceId, setTempProvinceId] = useState('')
	const [tempCommuneId, setTempCommuneId] = useState('')
	const [loadingProvinces, setLoadingProvinces] = useState(false)
	const [loadingCommunes, setLoadingCommunes] = useState(false)

	const [items, setItems] = useState<CartItem[]>(() => loadCart())

	const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])
	const shipping = items.length > 0 ? 15 : 0

	const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))
	const handleProvinceChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const selectedId = event.target.value
		const selectedName = event.target.selectedOptions[0]?.text ?? ''
		setTempProvinceId(selectedId)
		setTempCommuneId('')
		setForm((prev) => ({
			...prev,
			provinceName: selectedId ? selectedName : '',
			communeName: '',
		}))
		setCommunes([])
	}
	const handleCommuneChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const selectedId = event.target.value
		const selectedName = event.target.selectedOptions[0]?.text ?? ''
		setTempCommuneId(selectedId)
		setForm((prev) => ({
			...prev,
			communeName: selectedId ? selectedName : '',
		}))
	}

	useEffect(() => {
		let active = true
		const loadProvinces = async () => {
			setLoadingProvinces(true)
			setLocationError(null)
			try {
				const { data } = await axios.get<LocationProvince[]>(`${LOCATION_API}/province`)
				if (active) {
					console.log('Location provinces response:', data)
					setProvinces(data)
				}
			} catch (err) {
				if (active) {
					setLocationError('Không thể tải danh sách tỉnh/thành.')
				}
			} finally {
				if (active) setLoadingProvinces(false)
			}
		}

		void loadProvinces()
		return () => {
			active = false
		}
	}, [])

	useEffect(() => {
		if (!tempProvinceId) {
			setCommunes([])
			return
		}

		let active = true
		const loadCommunes = async () => {
			setLoadingCommunes(true)
			setLocationError(null)
			try {
				const provinceId = String(tempProvinceId)
				const { data } = await axios.get<LocationCommune[]>(
					`${LOCATION_API}/commune?idProvince=${encodeURIComponent(provinceId)}`
				)

				let resolvedCommunes = data
				if (Array.isArray(data) && data.length === 0) {
					const { data: allCommunes } = await axios.get<LocationCommune[]>(`${LOCATION_API}/commune`)
					resolvedCommunes = allCommunes.filter((item) => String(item.idProvince) === provinceId)
					console.log('Location communes fallback response:', resolvedCommunes)
				}

				if (active) {
					console.log('Location communes response:', data)
					setCommunes(resolvedCommunes)
				}
			} catch (err) {
				if (active) {
					setLocationError('Không thể tải danh sách phường/xã.')
				}
			} finally {
				if (active) setLoadingCommunes(false)
			}
		}

		void loadCommunes()
		return () => {
			active = false
		}
	}, [tempProvinceId])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setOrderError(null)

		if (items.length === 0) {
			setOrderError('Your cart is empty')
			return
		}

		if (!form.provinceName || !form.communeName) {
			setOrderError('Vui lòng chọn đầy đủ tỉnh/thành và phường/xã')
			return
		}

		if (!form.addressDetail.trim()) {
			setOrderError('Vui lòng nhập địa chỉ chi tiết')
			return
		}

		try {
			const orderItems = items.map(item => ({ id: item.id, qty: item.qty, price: item.price }))
			const mergedAddress = [form.addressDetail, form.communeName, form.provinceName]
				.map((value) => value.trim())
				.filter(Boolean)
				.join(', ')

			await createOrder({
				phone: form.phone,
				address: mergedAddress,
				items: orderItems,
			})

			setSubmitted(true)
			clearCart()
			setItems([])
		} catch (err) {
			setOrderError(err instanceof Error ? err.message : 'Failed to place order')
		}
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
					<h1 className='mb-2 text-2xl font-extrabold text-[#151515]'>Đơn Hàng Đã Được Đặt</h1>
						<div className='mb-6' />
						<Link
							to='/'
							className='inline-block rounded-full bg-[#f59b24] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
						>
							Quay Lại Trang Chủ
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
					<Link to='/' className='transition-colors hover:text-[#f59b24]'>Trang Chủ</Link>
					<span>/</span>
					<Link to='/cart' className='transition-colors hover:text-[#f59b24]'>Giỏ Hàng</Link>
					<span>/</span>
					<span className='text-[#555]'>Thanh Toán</span>
				</nav>
			</div>

			<main className='mx-auto w-full max-w-[1220px] px-4 pb-10 pt-7 sm:px-9'>
				<h1 className='mb-6 text-2xl font-extrabold tracking-tight text-[#151515]'>Thanh Toán</h1>

				{items.length === 0 ? (
					<div className='rounded-xl bg-white p-12 text-center text-sm text-[#999]'>
							Giỏ hàng của bạn đang trống. <Link to='/laptops' className='text-[#f59b24] underline'>Xem laptop</Link>
					</div>
				) : (
					<form onSubmit={handleSubmit} className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]'>
						<div className='space-y-6'>
							<div className='rounded-xl bg-white p-6 shadow-sm'>
								<h2 className='mb-4 text-sm font-bold uppercase tracking-wide text-[#222]'>Thông Tin Liên Hệ</h2>
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
									<div>
										<label className='mb-1 block text-xs font-semibold text-[#555]'>Tên</label>
										<input
											type='text'
											required
											value={form.firstName}
											onChange={(e) => update('firstName', e.target.value)}
											className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
										/>
									</div>
									<div>
										<label className='mb-1 block text-xs font-semibold text-[#555]'>Họp</label>
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
										<label className='mb-1 block text-xs font-semibold text-[#555]'>Điện Thoại</label>
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

							<div className='rounded-xl bg-white p-6 shadow-sm'>
								<h2 className='mb-4 text-sm font-bold uppercase tracking-wide text-[#222]'>Địa Chỉ Giao Hàng</h2>
								<div className='space-y-4'>
									<div>
										<label className='mb-1 block text-xs font-semibold text-[#555]'>Địa Chỉ</label>
										<input
											type='text'
											required
												value={form.addressDetail}
												onChange={(e) => update('addressDetail', e.target.value)}
											className='w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
										/>
									</div>
									<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
										<div>
											<label className='mb-1 block text-xs font-semibold text-[#555]'>Tỉnh/Thành</label>
											<select
												required
												value={tempProvinceId}
												onChange={handleProvinceChange}
													disabled={loadingProvinces}
													className='w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
												>
												<option value=''>
													{loadingProvinces ? 'Đang tải tỉnh/thành...' : 'Chọn tỉnh/thành'}
												</option>
												{provinces.map((province) => (
													<option key={province.idProvince} value={province.idProvince}>
														{province.name}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className='mb-1 block text-xs font-semibold text-[#555]'>Phường/Xã</label>
											<select
												required
												value={tempCommuneId}
												onChange={handleCommuneChange}
												disabled={!tempProvinceId || loadingCommunes}
												className='w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2.5 text-sm text-[#333] outline-none transition focus:border-[#f59b24]'
											>
												<option value=''>
													{loadingCommunes ? 'Đang tải phường/xã...' : 'Chọn phường/xã'}
												</option>
												{communes.map((commune) => (
													<option key={commune.idCommune} value={commune.idCommune}>
														{commune.name}
													</option>
												))}
											</select>
										</div>
									</div>
									{locationError && (
										<p className='text-xs text-red-600'>{locationError}</p>
									)}
								</div>
							</div>
						</div>

						<div className='space-y-6'>
							<div className='rounded-xl bg-white p-6 shadow-sm'>
								<h2 className='mb-5 text-sm font-bold uppercase tracking-wide text-[#222]'>Đơn Hàng Của Bạn</h2>

								<div className='space-y-4'>
									{items.map((item) => (
										<div key={item.id} className='flex items-center gap-3'>
											<img
												className='h-14 w-14 rounded-lg object-cover'
												src={item.image ?? imageOptions[0]}
												alt={item.name}
											/>
											<div className='flex-1'>
												<p className='text-sm font-semibold text-[#212121]'>{item.name}</p>
														<p className='text-[11px] text-[#999]'>Số Lượng: {item.qty}</p>
											</div>
											<p className='text-sm font-bold text-[#f59b24]'>
												{fmt(item.price * item.qty)}
											</p>
										</div>
									))}
								</div>

								<div className='mt-5 space-y-3 border-t border-[#f0f0f0] pt-4 text-sm'>
									<div className='flex justify-between text-[#666]'>
										<span>Tạm Tính</span>
										<span className='font-semibold text-[#333]'>{fmt(subtotal)}</span>
									</div>
									<div className='flex justify-between text-[#666]'>
										<span>Vận Chuyển</span>
										<span className='font-semibold text-[#333]'>{fmt(shipping)}</span>
									</div>
								</div>

								<div className='mt-4 flex justify-between border-t border-[#f0f0f0] pt-4 text-base font-extrabold text-[#151515]'>
							<span>Tổng Cộng</span>
								</div>

								{orderError && (
									<p className='mt-4 text-xs text-red-600'>{orderError}</p>
								)}

								<button
									type='submit'
									className='mt-6 w-full rounded-full bg-[#f59b24] py-3 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
								>
									Đặt Hàng
								</button>

								<Link
									to='/cart'
									className='mt-3 block text-center text-xs text-[#999] transition-colors hover:text-[#f59b24]'
								>
									← Quay Lại Giỏ Hàng
								</Link>
							</div>
						</div>
					</form>
				)}
			</main>

			<MainFooter />
		</div>
	)
}

export default CheckoutPageApi

