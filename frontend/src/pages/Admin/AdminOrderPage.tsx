import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllOrders, getOrderById, updateOrderStatus, type AdminOrder } from '../../lib/api'
import PaginationControls from '../../components/common/PaginationControls'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

type Order = {
	id: number
	customer: string
	email: string
	phone: string
	address: string
	items: { name: string; qty: number; price: number }[]
	itemCount: number
	total: number
	status: OrderStatus
	date: string
	payment: string
}

// Status colors removed for cleaner interface

const allStatuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const fmt = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

const getStatusLabel = (status: OrderStatus): string => {
	const statusMap: Record<OrderStatus, string> = {
		PENDING: 'CHỜ DUYỆT',
		PROCESSING: 'ĐÃ DUYỆT',
		SHIPPED: 'ĐANG GIAO',
		DELIVERED: 'ĐÃ GIAO',
		CANCELLED: 'ĐÃ HỦY',
	}
	return statusMap[status] || status
}

const buildOrder = (o: AdminOrder): Order => {
	const items = o.items?.map((item) => ({
		name: item.laptopName || `Laptop #${item.laptopId}`,
		qty: item.quantity,
		price: Number(item.price),
	})) || []
	const itemCount = items.length > 0
		? items.reduce((sum, item) => sum + item.qty, 0)
		: 0
	const total = items.length > 0
		? items.reduce((sum, item) => sum + item.price * item.qty, 0)
		: Number(o.totalAmount ?? 0)

	return {
		id: o.id,
		customer: o.userName || 'Unknown',
		email: o.userEmail || '',
		phone: o.phone,
		address: o.address,
		items,
		itemCount,
		total,
		status: o.status as OrderStatus,
		date: new Date(o.orderDate).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit',
		}),
		payment: 'COD',
	}
}

const AdminOrderPage = () => {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [detail, setDetail] = useState<Order | null>(null)
	const [search, setSearch] = useState('')
	const [filterStatus, setFilterStatus] = useState<'All' | OrderStatus>('All')
	const [currentPage, setCurrentPage] = useState(1)
	const pageSize = 10

	const fetchOrders = async (keyword?: string, status?: OrderStatus | 'All') => {
		setLoading(true)
		setError(null)
		try {
			const data = await getAllOrders({
				keyword: keyword?.trim() ? keyword : undefined,
				status: status && status !== 'All' ? status : undefined,
			})
			const transformed = data.map(buildOrder)
			setOrders(transformed)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Lỗi không tải đơn hàng')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const timer = setTimeout(() => {
			void fetchOrders(search, filterStatus)
		}, 300)
		return () => clearTimeout(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, filterStatus])

	const totalPages = Math.max(1, Math.ceil(orders.length / pageSize))
	const pagedOrders = useMemo(
		() => orders.slice((currentPage - 1) * pageSize, currentPage * pageSize),
		[orders, currentPage]
	)

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const totalRevenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0)
	const deliveredRevenue = orders.filter((o) => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total, 0)
	const pendingRevenue = orders.filter((o) => o.status === 'PENDING').reduce((sum, o) => sum + o.total, 0)
	const shippingRevenue = orders.filter((o) => o.status === 'SHIPPED').reduce((sum, o) => sum + o.total, 0)
	const validOrdersCount = orders.filter((o) => o.status !== 'CANCELLED').length
	const avgOrderValue = validOrdersCount > 0 ? Math.round(totalRevenue / validOrdersCount) : 0
	const pendingCount = orders.filter((o) => o.status === 'PENDING').length
	const shippingCount = orders.filter((o) => o.status === 'SHIPPED').length

	const handleUpdateStatus = async (id: number, status: OrderStatus) => {
		try {
			await updateOrderStatus(id, status)
			setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
			if (detail?.id === id) setDetail((prev) => (prev ? { ...prev, status } : prev))
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to update status')
		}
	}

	const openDetail = async (id: number) => {
		setError(null)
		setDetail(null)
		try {
			const data = await getOrderById(id)
			setDetail(buildOrder(data))
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Không tải được chi tiết đơn hàng')
		}
	}

	return (
		<div className='flex min-h-screen bg-[#f0f2f5]'>
			{/* Sidebar */}
			<aside className='fixed left-0 top-0 flex h-screen w-55 flex-col bg-[#1e1e2d]'>
				<div className='flex h-16 items-center gap-2 border-b border-white/10 px-5'>
					<span className='text-lg font-extrabold text-[#f59b24]'>ADMIN</span>
					<span className='text-lg font-extrabold text-white/90'>PANEL</span>
				</div>
				<nav className='mt-6 flex flex-col gap-1 px-3 text-[13px]'>
					<Link
						to='/admin/dashboard'
						className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'
					>
						Dashboard
					</Link>
					<Link
						to='/admin/laptops'
						className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'
					>
						Laptop
					</Link>
					<Link
						to='/admin/orders'
						className='rounded-lg bg-[#f59b24]/15 px-3 py-2.5 font-semibold text-[#f59b24]'
					>
						Đơn hàng
					</Link>
					<Link
						to='/admin/users'
						className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'
					>
						Người dùng
					</Link>
					<Link
						to='/admin/brands'
						className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'
					>
						Thương hiệu
					</Link>
				</nav>
				<div className='mt-auto border-t border-white/10 p-4'>
					<Link to='/' className='flex items-center gap-2 text-xs text-white/50 transition hover:text-white/90'>
						<span>←</span> Quay lại cửa hàng
					</Link>
				</div>
			</aside>

			{/* Main Content */}
			<div className='ml-55 flex-1 p-8'>
				{/* Header */}
				<div className='mb-7'>
					<h1 className='text-2xl font-extrabold text-[#1e1e2d]'>Đơn hàng</h1>
					<p className='mt-1 text-xs text-[#999]'>Theo dõi và quản lý đơn hàng của khách hàng</p>
				</div>

				{error && <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700'>{error}</div>}

				{/* Stats */}
				<div className='mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4'>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Tổng số đơn hàng</p>
						<p className='mt-1 text-2xl font-extrabold text-[#1e1e2d]'>{orders.length}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Doanh thu</p>
						<p className='mt-1 text-2xl font-extrabold text-green-600'>{fmt(totalRevenue)}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Đang chờ xử lý</p>
						<p className='mt-1 text-2xl font-extrabold text-yellow-600'>{pendingCount}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Đang giao hàng</p>
						<p className='mt-1 text-2xl font-extrabold text-purple-600'>{shippingCount}</p>
					</div>
				</div>

				{/* Revenue Breakdown */}
				<div className='mb-7 rounded-xl bg-white p-5 shadow-sm'>
					<h2 className='mb-4 text-xs font-bold uppercase tracking-wider text-[#999]'>Phân tích doanh thu</h2>
					<div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
						<div>
							<p className='text-[10px] text-[#aaa]'>Đã giao</p>
							<p className='mt-0.5 text-lg font-extrabold text-[#1e1e2d]'>{fmt(deliveredRevenue)}</p>
						</div>
						<div>
							<p className='text-[10px] text-[#aaa]'>Đang giao hàng</p>
							<p className='mt-0.5 text-lg font-extrabold text-[#1e1e2d]'>{fmt(shippingRevenue)}</p>
						</div>
						<div>
							<p className='text-[10px] text-[#aaa]'>Đang chờ xử lý</p>
							<p className='mt-0.5 text-lg font-extrabold text-[#1e1e2d]'>{fmt(pendingRevenue)}</p>
						</div>
						<div>
							<p className='text-[10px] text-[#aaa]'>Giá trị đơn hàng trung bình</p>
							<p className='mt-0.5 text-lg font-extrabold text-[#1e1e2d]'>{fmt(avgOrderValue)}</p>
							<p className='mt-2 text-[10px] text-[#bbb]'>{orders.filter((o) => o.status !== 'CANCELLED').length} đơn hàng hợp lệ</p>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className='mb-5 flex flex-wrap items-center gap-3'>
					<input
						type='text'
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setCurrentPage(1)
						}}
						placeholder='Tìm kiếm đơn hàng...'
						className='rounded-md border border-[#e3e3e3] bg-white px-3 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
					/>
					<select
						value={filterStatus}
						onChange={(e) => {
							setFilterStatus(e.target.value as 'All' | OrderStatus)
							setCurrentPage(1)
						}}
						className='rounded-lg border border-[#e3e3e3] bg-white px-3 py-2.5 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
					>
						<option value='All'>Tất cả trạng thái</option>
						{allStatuses.map((s) => (
							<option key={s} value={s}>{getStatusLabel(s)}</option>
						))}
					</select>
					<span className='ml-auto text-xs text-[#999]'>
						{orders.length} đơn hàng
					</span>
				</div>

				{/* Table */}
				<div className='overflow-hidden rounded-xl bg-white shadow-sm'>
					<div className='overflow-x-auto'>
						<table className='w-full text-left text-xs'>
							<thead>
								<tr className='border-b bg-[#fafafa] text-[10px] font-bold uppercase tracking-wider text-[#aaa]'>
									<th className='px-5 py-3.5'>Đơn hàng</th>
									<th className='px-5 py-3.5'>Khách hàng</th>
									<th className='px-5 py-3.5'>Mục</th>
									<th className='px-5 py-3.5'>Tổng cộng</th>
									<th className='px-5 py-3.5'>Trạng thái</th>
									<th className='px-5 py-3.5'>Ngày</th>
									<th className='px-5 py-3.5 text-right'>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={7} className='px-5 py-10 text-center text-sm text-[#999]'>
										Đang tải...
										</td>
									</tr>
								) : pagedOrders.map((o) => (
									<tr key={o.id} className='border-b transition hover:bg-[#fafafa] last:border-none'>
										<td className='px-5 py-3.5'>
											<span className='font-bold text-[#222]'>#{o.id}</span>
										</td>
										<td className='px-5 py-3.5'>
											<p className='font-semibold text-[#333]'>{o.customer}</p>
											<p className='mt-0.5 text-[10px] text-[#aaa]'>{o.email}</p>
										</td>
										<td className='px-5 py-3.5 text-[#666]'>
											{o.itemCount} item{o.itemCount > 1 ? 's' : ''}
										</td>
										<td className='px-5 py-3.5 font-bold text-[#f59b24]'>{fmt(o.total)}</td>
										<td className='px-5 py-3.5'>
											<select
												value={o.status}
												onChange={(e) => handleUpdateStatus(o.id, e.target.value as OrderStatus)}
												className='rounded-lg border border-[#e0e0e0] px-2.5 py-1 text-[10px] font-semibold text-[#333] outline-none'
											>
												{allStatuses.map((s) => (
													<option key={s} value={s}>{getStatusLabel(s)}</option>
												))}
											</select>
										</td>
										<td className='px-5 py-3.5 text-[#999]'>{o.date}</td>
										<td className='px-5 py-3.5 text-right'>
											<button
												type='button'
												onClick={() => void openDetail(o.id)}
												className='rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#f59b24] transition hover:bg-[#f59b24]/10'
											>
												Chi tiết
											</button>
										</td>
									</tr>
								))}
								{orders.length === 0 && !loading && (
									<tr>
										<td colSpan={7} className='px-5 py-10 text-center text-sm text-[#bbb]'>
											Không có đơn hàng nào
										</td>
									</tr>
								)}
								</tbody>
						</table>
					</div>
				</div>

					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={orders.length}
						itemLabel='đơn hàng'
						onPageChange={setCurrentPage}
					/>

				{/* Order Detail Modal */}
				{detail && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
						<div className='w-full max-w-125 rounded-2xl bg-white p-7 shadow-2xl'>
							<div className='mb-5 flex items-start justify-between'>
								<div>
									<h2 className='text-lg font-extrabold text-[#1e1e2d]'>Order #{detail.id}</h2>
									<p className='mt-0.5 text-xs text-[#999]'>Đặt hàng vào {detail.date}</p>
								</div>
								<span className='rounded-lg border border-[#e0e0e0] px-3 py-1 text-[10px] font-semibold text-[#333]'>
									{getStatusLabel(detail.status)}
								</span>
							</div>

							{/* Customer Info */}
							<div className='mb-5 rounded-lg bg-[#f8f8f8] p-4'>
								<h3 className='mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#aaa]'>Thông tin khách hàng</h3>
								<div className='grid grid-cols-2 gap-2 text-xs'>
									<div>
											<p className='text-[10px] text-[#999]'>Tên</p>
										<p className='font-semibold text-[#333]'>{detail.customer}</p>
									</div>
									<div>
											<p className='text-[10px] text-[#999]'>Điện thoại</p>
										<p className='font-semibold text-[#333]'>{detail.phone}</p>
									</div>
									<div>
										<p className='text-[10px] text-[#999]'>Email</p>
										<p className='font-semibold text-[#333]'>{detail.email}</p>
									</div>
									<div>
											<p className='text-[10px] text-[#999]'>Thanh toán</p>
										<p className='font-semibold text-[#333]'>{detail.payment}</p>
									</div>
									<div className='col-span-2'>
											<p className='text-[10px] text-[#999]'>Địa chỉ</p>
										<p className='font-semibold text-[#333]'>{detail.address}</p>
									</div>
								</div>
							</div>

							{/* Items */}
							<h3 className='mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#aaa]'>Mục đơn hàng</h3>
							<table className='mb-4 w-full text-xs'>
								<thead>
									<tr className='border-b text-[10px] font-bold uppercase tracking-wider text-[#bbb]'>
									<th className='pb-2 text-left'>Sản phẩm</th>
									<th className='pb-2 text-center'>Số lượng</th>
									<th className='pb-2 text-right'>Giá</th>
									</tr>
								</thead>
								<tbody>
									{detail.items.map((item, i) => (
										<tr key={i} className='border-b last:border-none'>
											<td className='py-2.5 font-semibold text-[#333]'>{item.name}</td>
											<td className='py-2.5 text-center text-[#666]'>{item.qty}</td>
											<td className='py-2.5 text-right font-semibold text-[#f59b24]'>{fmt(item.price * item.qty)}</td>
										</tr>
									))}
								</tbody>
							</table>

							<div className='flex items-center justify-between border-t pt-4'>
							<span className='text-sm font-bold text-[#333]'>Tổng cộng</span>
								<span className='text-lg font-extrabold text-[#f59b24]'>{fmt(detail.total)}</span>
							</div>

							<div className='mt-6 flex justify-end'>
								<button
									type='button'
									onClick={() => setDetail(null)}
									className='rounded-lg border border-[#e0e0e0] px-5 py-2.5 text-xs font-semibold text-[#666] transition hover:bg-[#f5f5f5]'
								>
									Close
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default AdminOrderPage
