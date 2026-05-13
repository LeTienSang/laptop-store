import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllOrders, getAllUsers, getBrands, getLaptops, getOrderById, type AdminOrder, type User, type Brand, type Laptop } from '../../lib/api'

const money = (n: number) => `${n.toLocaleString('vi-VN')} ₫`
const shortDate = (date: Date) => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

const statusMeta: Record<AdminOrder['status'], { label: string; color: string }> = {
	PENDING: { label: 'Chờ duyệt', color: '#f59b24' },
	PROCESSING: { label: 'Đã duyệt', color: '#f7b04a' },
	SHIPPED: { label: 'Đang giao', color: '#f9c178' },
	DELIVERED: { label: 'Đã giao', color: '#fbcfa0' },
	CANCELLED: { label: 'Đã hủy', color: '#fde2ca' },
}

type BestSellerItem = {
	id: number
	name: string
	qty: number
	revenue: number
}

const AdminDashboardPage = () => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [laptops, setLaptops] = useState<Laptop[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [brands, setBrands] = useState<Brand[]>([])
	const [orders, setOrders] = useState<AdminOrder[]>([])
	const [bestSellers, setBestSellers] = useState<BestSellerItem[]>([])

	useEffect(() => {
		let active = true
		const loadDashboard = async () => {
			setLoading(true)
			setError(null)
			try {
				const [laptopData, userData, brandData, orderData] = await Promise.all([
					getLaptops(),
					getAllUsers(),
					getBrands(),
					getAllOrders(),
				])

				const orderDetails = await Promise.all(
					orderData.slice(0, 30).map((order) => getOrderById(order.id).catch(() => null))
				)

				const sellerMap = new Map<number, BestSellerItem>()
				orderDetails.forEach((order) => {
					if (!order?.items) return
					order.items.forEach((item) => {
						const current = sellerMap.get(item.laptopId) ?? {
							id: item.laptopId,
							name: item.laptopName || `Laptop #${item.laptopId}`,
							qty: 0,
							revenue: 0,
						}

						current.qty += Number(item.quantity ?? 0)
						current.revenue += Number(item.price ?? 0) * Number(item.quantity ?? 0)
						sellerMap.set(item.laptopId, current)
					})
				})

				const bestSellerData = [...sellerMap.values()]
					.sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
					.slice(0, 5)

				if (!active) return
				setLaptops(laptopData)
				setUsers(userData)
				setBrands(brandData)
				setOrders(orderData)
				setBestSellers(bestSellerData)
			} catch (e) {
				if (!active) return
				setError(e instanceof Error ? e.message : 'Không thể tải dashboard')
			} finally {
				if (active) setLoading(false)
			}
		}

		void loadDashboard()
		return () => {
			active = false
		}
	}, [])

	const metrics = useMemo(() => {
		const totalOrders = orders.length
		const pendingOrders = orders.filter((o) => o.status === 'PENDING').length
		const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length
		const totalRevenue = orders
			.filter((o) => o.status !== 'CANCELLED')
			.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0)
		const adminUsers = users.filter((u) => u.role === 'ADMIN').length

		return {
			totalOrders,
			pendingOrders,
			deliveredOrders,
			totalRevenue,
			adminUsers,
		}
	}, [orders, users])

	const latestOrders = useMemo(() => {
		return [...orders]
			.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
			.slice(0, 6)
	}, [orders])

	const statusChart = useMemo(() => {
		const total = Math.max(orders.length, 1)
		const entries = Object.entries(statusMeta).map(([status, config]) => {
			const count = orders.filter((o) => o.status === status).length
			const percentage = Math.round((count / total) * 100)
			return {
				status: status as AdminOrder['status'],
				label: config.label,
				color: config.color,
				count,
				percentage,
			}
		})

		let start = 0
		const segments = entries
			.filter((item) => item.count > 0)
			.map((item) => {
				const end = start + (item.count / total) * 100
				const segment = `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`
				start = end
				return segment
			})

		return {
			entries,
			donutBackground: segments.length > 0 ? `conic-gradient(${segments.join(', ')})` : '#e5e7eb',
		}
	}, [orders])

	const sevenDayTrend = useMemo(() => {
		const today = new Date()
		today.setHours(23, 59, 59, 999)

		const days = Array.from({ length: 7 }).map((_, index) => {
			const date = new Date(today)
			date.setDate(today.getDate() - (6 - index))
			const key = date.toISOString().slice(0, 10)
			return {
				key,
				label: shortDate(date),
				count: 0,
				revenue: 0,
			}
		})

		const dayMap = new Map(days.map((item) => [item.key, item]))
		orders.forEach((order) => {
			const key = new Date(order.orderDate).toISOString().slice(0, 10)
			const bucket = dayMap.get(key)
			if (!bucket) return
			bucket.count += 1
			if (order.status !== 'CANCELLED') {
				bucket.revenue += Number(order.totalAmount ?? 0)
			}
		})

		const maxCount = Math.max(...days.map((d) => d.count), 1)
		return {
			days,
			maxCount,
		}
	}, [orders])

	const topBrands = useMemo(() => {
		const laptopCountByBrand = new Map<number, number>()
		laptops.forEach((laptop) => {
			const count = laptopCountByBrand.get(laptop.brand_id) ?? 0
			laptopCountByBrand.set(laptop.brand_id, count + 1)
		})

		const data = brands
			.map((brand) => ({
				name: brand.name,
				count: laptopCountByBrand.get(brand.id) ?? 0,
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5)

		const maxCount = Math.max(...data.map((item) => item.count), 1)
		return { data, maxCount }
	}, [brands, laptops])

	const bestSellerChart = useMemo(() => {
		const maxQty = Math.max(...bestSellers.map((item) => item.qty), 1)
		return {
			items: bestSellers,
			maxQty,
		}
	}, [bestSellers])

	return (
		<div className='flex min-h-screen bg-[#f0f2f5]'>
			<aside className='fixed left-0 top-0 flex h-screen w-[220px] flex-col bg-[#1e1e2d]'>
				<div className='flex h-16 items-center gap-2 border-b border-white/10 px-5'>
					<span className='text-lg font-extrabold text-[#f59b24]'>ADMIN</span>
					<span className='text-lg font-extrabold text-white/90'>PANEL</span>
				</div>
				<nav className='mt-6 flex flex-col gap-1 px-3 text-[13px]'>
					<Link to='/admin/dashboard' className='rounded-lg bg-[#f59b24]/15 px-3 py-2.5 font-semibold text-[#f59b24]'>
						Dashboard
					</Link>
					<Link to='/admin/laptops' className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'>
						Laptop
					</Link>
					<Link to='/admin/orders' className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'>
						Đơn hàng
					</Link>
					<Link to='/admin/users' className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'>
						Người dùng
					</Link>
					<Link to='/admin/brands' className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'>
						Thương hiệu
					</Link>
				</nav>
				<div className='mt-auto border-t border-white/10 p-4'>
					<Link to='/' className='flex items-center gap-2 text-xs text-white/50 transition hover:text-white/90'>
						<span>←</span> Quay lại cửa hàng
					</Link>
				</div>
			</aside>

			<div className='ml-[220px] flex-1 p-8'>
				<div className='mb-7'>
					<h1 className='text-2xl font-extrabold text-[#1e1e2d]'>Dashboard</h1>
					<p className='mt-1 text-xs text-[#999]'>Tổng quan tình hình vận hành cửa hàng</p>
				</div>

				{error && <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700'>{error}</div>}

				<div className='mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5'>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Sản phẩm</p>
						<p className='mt-1 text-2xl font-extrabold text-[#1e1e2d]'>{loading ? '...' : laptops.length}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Thương hiệu</p>
						<p className='mt-1 text-2xl font-extrabold text-[#1e1e2d]'>{loading ? '...' : brands.length}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Người dùng</p>
						<p className='mt-1 text-2xl font-extrabold text-[#1e1e2d]'>{loading ? '...' : users.length}</p>
						<p className='mt-1 text-[10px] text-[#aaa]'>Admin: {loading ? '...' : metrics.adminUsers}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Đơn hàng</p>
						<p className='mt-1 text-2xl font-extrabold text-[#1e1e2d]'>{loading ? '...' : metrics.totalOrders}</p>
						<p className='mt-1 text-[10px] text-[#aaa]'>Chờ duyệt: {loading ? '...' : metrics.pendingOrders}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Doanh thu</p>
						<p className='mt-1 text-xl font-extrabold text-green-600'>{loading ? '...' : money(metrics.totalRevenue)}</p>
						<p className='mt-1 text-[10px] text-[#aaa]'>Đã giao: {loading ? '...' : metrics.deliveredOrders}</p>
					</div>
				</div>

				<div className='mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.1fr_1fr]'>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<h2 className='mb-4 text-sm font-bold uppercase tracking-wider text-[#666]'>Trạng thái đơn</h2>
						{loading ? (
							<p className='py-12 text-center text-sm text-[#999]'>Đang tải lược đồ...</p>
						) : (
							<div className='flex items-center gap-5'>
								<div
									className='relative h-32 w-32 shrink-0 rounded-full'
									style={{ background: statusChart.donutBackground }}
								>
									<div className='absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#666]'>
										{orders.length} đơn
									</div>
								</div>
								<div className='space-y-2 text-xs'>
									{statusChart.entries.map((item) => (
										<div key={item.status} className='flex items-center justify-between gap-3'>
											<div className='flex items-center gap-2 text-[#666]'>
												<span className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: item.color }} />
												<span>{item.label}</span>
											</div>
											<span className='font-semibold text-[#222]'>{item.count}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<h2 className='mb-4 text-sm font-bold uppercase tracking-wider text-[#666]'>7 ngày gần nhất</h2>
						{loading ? (
							<p className='py-12 text-center text-sm text-[#999]'>Đang tải lược đồ...</p>
						) : (
							<>
								<div className='flex h-40 items-end gap-2'>
									{sevenDayTrend.days.map((day) => {
										const barHeight = `${Math.max((day.count / sevenDayTrend.maxCount) * 100, day.count > 0 ? 12 : 6)}%`
										return (
											<div key={day.key} className='flex flex-1 flex-col items-center gap-2'>
												<div className='relative flex h-32 w-full items-end rounded-md bg-[#f7f8fa]'>
													<div className='w-full rounded-md bg-[#f59b24] transition-all' style={{ height: barHeight }} />
													{day.count > 0 && (
														<span className='absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#666]'>{day.count}</span>
													)}
												</div>
												<span className='text-[10px] text-[#888]'>{day.label}</span>
											</div>
										)
									})}
								</div>
								<div className='mt-4 grid grid-cols-2 gap-3 text-xs'>
									{sevenDayTrend.days.slice(-2).map((day) => (
										<div key={day.key} className='rounded-lg bg-[#fafafa] px-3 py-2'>
											<p className='text-[10px] text-[#999]'>Doanh thu {day.label}</p>
											<p className='font-semibold text-[#333]'>{money(day.revenue)}</p>
										</div>
									))}
								</div>
							</>
						)}
					</div>

					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<h2 className='mb-4 text-sm font-bold uppercase tracking-wider text-[#666]'>Thương hiệu</h2>
						{loading ? (
							<p className='py-12 text-center text-sm text-[#999]'>Đang tải lược đồ...</p>
						) : topBrands.data.length === 0 ? (
							<p className='py-12 text-center text-sm text-[#bbb]'>Chưa có dữ liệu thương hiệu</p>
						) : (
							<div className='space-y-3'>
								{topBrands.data.map((item, index) => {
									const width = `${Math.max((item.count / topBrands.maxCount) * 100, item.count > 0 ? 8 : 0)}%`
									return (
										<div key={item.name}>
											<div className='mb-1 flex items-center justify-between text-[11px]'>
												<span className='font-semibold text-[#555]'>#{index + 1} {item.name}</span>
												<span className='text-[#999]'>{item.count} SP</span>
											</div>
											<div className='h-2.5 overflow-hidden rounded-full bg-[#eef0f4]'>
												<div className='h-full rounded-full bg-[#f59b24]' style={{ width }} />
											</div>
										</div>
									)
								})}
							</div>
						)}
					</div>
				</div>

				<div className='grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]'>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<div className='mb-4 flex items-center justify-between'>
							<h2 className='text-sm font-bold uppercase tracking-wider text-[#666]'>Đơn hàng gần đây</h2>
							<Link to='/admin/orders' className='text-xs font-semibold text-[#f59b24] hover:underline'>
								Xem tất cả
							</Link>
						</div>
						{loading ? (
							<p className='py-8 text-center text-sm text-[#999]'>Đang tải...</p>
						) : latestOrders.length === 0 ? (
							<p className='py-8 text-center text-sm text-[#bbb]'>Chưa có đơn hàng</p>
						) : (
							<div className='space-y-3'>
								{latestOrders.map((order) => (
									<div key={order.id} className='flex items-center justify-between rounded-lg border border-[#f0f0f0] px-3 py-2'>
										<div>
											<p className='text-xs font-bold text-[#222]'>#{order.id}</p>
											<p className='text-[11px] text-[#999]'>{order.userName || 'Khách vãng lai'}</p>
										</div>
										<div className='text-right'>
											<p className='text-xs font-semibold text-[#333]'>{money(Number(order.totalAmount ?? 0))}</p>
											<p className='text-[11px] text-[#999]'>
												{statusMeta[order.status]?.label || order.status}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<div className='mb-4 flex items-center justify-between'>
							<h2 className='text-sm font-bold uppercase tracking-wider text-[#666]'>Best seller</h2>
							<Link to='/admin/laptops' className='text-xs font-semibold text-[#f59b24] hover:underline'>
								Xem sản phẩm
							</Link>
						</div>
						{loading ? (
							<p className='py-8 text-center text-sm text-[#999]'>Đang tải...</p>
						) : bestSellerChart.items.length === 0 ? (
							<p className='py-8 text-center text-sm text-[#bbb]'>Chưa có dữ liệu bán hàng</p>
						) : (
							<div className='space-y-3'>
								{bestSellerChart.items.map((item, index) => {
									const width = `${Math.max((item.qty / bestSellerChart.maxQty) * 100, item.qty > 0 ? 8 : 0)}%`
									return (
										<div key={item.id}>
											<div className='mb-1 flex items-center justify-between text-[11px]'>
												<span className='font-bold text-[#222]'>#{index + 1} {item.name}</span>
												<span className='font-semibold text-[#f59b24]'>{item.qty} bán</span>
											</div>
											<div className='h-2.5 overflow-hidden rounded-full bg-[#eef0f4]'>
												<div className='h-full rounded-full bg-[#f59b24]' style={{ width }} />
											</div>
											<p className='mt-1 text-[11px] text-[#999]'>Doanh thu: {money(item.revenue)}</p>
										</div>
									)
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminDashboardPage
