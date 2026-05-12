import { useState } from 'react'
import { Link } from 'react-router-dom'

type Laptop = {
	id: number
	name: string
	brand: string
	cpu: string
	ram: string
	storage: string
	gpu: string
	screen: string
	price: number
	stock: number
	hidden: boolean
	image: string
}

const initialLaptops: Laptop[] = [
	{ id: 1, name: 'Dell XPS 13', brand: 'Dell', cpu: 'Intel Core i7-1360P', ram: '16 GB', storage: '512 GB SSD', gpu: 'Intel Iris Xe', screen: '13.4" FHD+', price: 950, stock: 15, hidden: false, image: '/pictures/laptops/laptop1.png' },
	{ id: 2, name: 'Asus Vivobook Pro', brand: 'Asus', cpu: 'AMD Ryzen 7 7735HS', ram: '16 GB', storage: '512 GB SSD', gpu: 'NVIDIA RTX 3050', screen: '15.6" FHD', price: 780, stock: 22, hidden: false, image: '/pictures/laptops/laptop2.jpg' },
	{ id: 3, name: 'MacBook Air M2', brand: 'Apple', cpu: 'Apple M2', ram: '8 GB', storage: '256 GB SSD', gpu: 'Integrated 8-core', screen: '13.6" Liquid Retina', price: 1090, stock: 8, hidden: false, image: '/pictures/laptops/laptop3.jpg' },
	{ id: 4, name: 'Dell Inspiron 15', brand: 'Dell', cpu: 'Intel Core i5-1235U', ram: '8 GB', storage: '256 GB SSD', gpu: 'Intel UHD', screen: '15.6" FHD', price: 690, stock: 30, hidden: false, image: '/pictures/laptops/laptop4.jpg' },
	{ id: 5, name: 'MacBook Pro 14', brand: 'Apple', cpu: 'Apple M3 Pro', ram: '18 GB', storage: '512 GB SSD', gpu: 'Integrated 18-core', screen: '14.2" XDR', price: 1890, stock: 12, hidden: false, image: '/pictures/laptops/laptop5.jpg' },

]

const emptyLaptop: Omit<Laptop, 'id' | 'hidden'> = { name: '', brand: '', cpu: '', ram: '', storage: '', gpu: '', screen: '', price: 0, stock: 0, image: '' }

const fmt = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

const AdminLaptopPage = () => {
	const [laptops, setLaptops] = useState<Laptop[]>(initialLaptops)
	const [editing, setEditing] = useState<Laptop | null>(null)
	const [isNew, setIsNew] = useState(false)
	const [search, setSearch] = useState('')
	const [filterBrand, setFilterBrand] = useState('All')
	const [filterStatus, setFilterStatus] = useState<'All' | 'Visible' | 'Hidden'>('All')

	const brands = ['All', ...Array.from(new Set(laptops.map((l) => l.brand)))]

	const filtered = laptops.filter((l) => {
		if (filterBrand !== 'All' && l.brand !== filterBrand) return false
		if (filterStatus === 'Visible' && l.hidden) return false
		if (filterStatus === 'Hidden' && !l.hidden) return false
		if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false
		return true
	})

	const visibleCount = laptops.filter((l) => !l.hidden).length
	const outOfStock = laptops.filter((l) => l.stock === 0).length

	const openNew = () => {
		setEditing({ id: Date.now(), ...emptyLaptop, hidden: false, image: '' })
		setIsNew(true)
	}

	const openEdit = (laptop: Laptop) => {
		setEditing({ ...laptop })
		setIsNew(false)
	}

	const save = async () => {
		if (!editing) return

		// Validation
		if (!editing.name || !editing.price || !editing.stock) {
			alert('Please fill in all required fields.')
			return
		}

		try {
			if (isNew) {
				// Backend integration for adding a new laptop
				const response = await fetch('/api/laptops', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(editing),
				})

				if (!response.ok) {
					throw new Error('Failed to add laptop.')
				}

				const newLaptop = await response.json()
				setLaptops((prev) => [...prev, newLaptop])
			} else {
				// Backend integration for updating an existing laptop
				const response = await fetch(`/api/laptops/${editing.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(editing),
				})

				if (!response.ok) {
					throw new Error('Failed to update laptop.')
				}

				const updatedLaptop = await response.json()
				setLaptops((prev) => prev.map((l) => (l.id === updatedLaptop.id ? updatedLaptop : l)))
			}

			setEditing(null)
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message)
			} else {
				alert('An unknown error occurred.')
			}
		}
	}

	const toggleHidden = (id: number) => {
		setLaptops((prev) => prev.map((l) => (l.id === id ? { ...l, hidden: !l.hidden } : l)))
	}

	const removeLaptop = (id: number) => {
		setLaptops((prev) => prev.filter((l) => l.id !== id))
	}

	return (
		<div className='flex min-h-screen bg-[#f0f2f5]'>
			{/* Sidebar */}
			<aside className='fixed left-0 top-0 flex h-screen w-55 flex-col bg-[#1e1e2d]'>
				<div className='flex h-16 items-center gap-2 border-b border-white/10 px-5'>
					<span className='text-lg font-extrabold text-[#f59b24]'>LAPTOP</span>
					<span className='text-lg font-extrabold text-white/90'>QUẢN LÝ</span>
				</div>
				<nav className='mt-6 flex flex-col gap-1 px-3 text-[13px]'>
					<Link
						to='/admin/laptops'
						className='rounded-lg bg-[#f59b24]/15 px-3 py-2.5 font-semibold text-[#f59b24]'
					>
						Laptop
					</Link>
					<Link
						to='/admin/orders'
						className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'
					>
						Đơn hàng
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
				<div className='mb-7 flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-extrabold text-[#1e1e2d]'>Laptop</h1>
						<p className='mt-1 text-xs text-[#999]'>Quản lý kho sản phẩm của bạn</p>
					</div>
					<button
						type='button'
						onClick={openNew}
						className='rounded-lg bg-[#f59b24] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#f59b24]/25 transition hover:bg-[#e08b15]'
					>
						+ Thêm Laptop
					</button>
				</div>

				{/* Stats */}
				<div className='mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4'>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Tổng sản phẩm</p>
						<p className='mt-1 text-2xl font-extrabold text-[#1e1e2d]'>{laptops.length}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Hiển thị</p>
						<p className='mt-1 text-2xl font-extrabold text-[#1e1e2d]'>{visibleCount}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Hết hàng</p>
						<p className='mt-1 text-2xl font-extrabold text-[#1e1e2d]'>{outOfStock}</p>
					</div>
					<div className='rounded-xl bg-white p-5 shadow-sm'>
						<p className='text-[11px] font-semibold uppercase tracking-wider text-[#999]'>Hết hàng</p>
						<p className='mt-1 text-2xl font-extrabold text-red-500'>{outOfStock}</p>
					</div>
				</div>

				{/* Filters */}
				<div className='mb-5 flex flex-wrap items-center gap-3'>
					<input
						type='text'
						placeholder='Search products...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='w-64 rounded-lg border border-[#e3e3e3] bg-white px-4 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
					/>
					<select
						value={filterBrand}
						onChange={(e) => setFilterBrand(e.target.value)}
						className='rounded-lg border border-[#e3e3e3] bg-white px-3 py-2.5 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
					>
						{brands.map((b) => (
							<option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
						))}
					</select>
					<select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Visible' | 'Hidden')}
						className='rounded-lg border border-[#e3e3e3] bg-white px-3 py-2.5 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
					>
						<option value='All'>Tất cả trạng thái</option>
						<option value='Visible'>Hiển thị</option>
						<option value='Hidden'>Ẩn</option>
					</select>
					<span className='ml-auto text-xs text-[#999]'>
						{filtered.length} kết quả{filtered.length !== 1 ? '' : ''}
					</span>
				</div>

				{/* Table */}
				<div className='overflow-hidden rounded-xl bg-white shadow-sm'>
					<div className='overflow-x-auto'>
						<table className='w-full text-left text-xs'>
							<thead>
								<tr className='border-b bg-[#fafafa] text-[10px] font-bold uppercase tracking-wider text-[#aaa]'>
									<th className='px-5 py-3.5'>Hình ảnh</th>
									<th className='px-5 py-3.5'>Sản phẩm</th>
									<th className='px-5 py-3.5'>Thương hiệu</th>
									<th className='px-5 py-3.5'>CPU</th>
									<th className='px-5 py-3.5'>RAM</th>
									<th className='px-5 py-3.5'>Giá</th>
									<th className='px-5 py-3.5'>Số lượng</th>
									<th className='px-5 py-3.5'>Trạng thái</th>
									<th className='px-5 py-3.5 text-right'>Hành động</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((l) => (
									<tr key={l.id} className={`border-b transition hover:bg-[#fafafa] last:border-none ${l.hidden ? 'opacity-45' : ''}`}>
										<td className='px-5 py-3.5'>
											<div className='h-10 w-14 overflow-hidden rounded-md bg-[#f5f5f5]'>
												{l.image ? (
													<img src={l.image} alt={l.name} className='h-full w-full object-contain' />
												) : (
													<div className='flex h-full w-full items-center justify-center text-[10px] text-[#ccc]'>No img</div>
												)}
											</div>
										</td>
										<td className='px-5 py-3.5'>
											<p className='font-semibold text-[#222]'>{l.name}</p>
											<p className='mt-0.5 text-[10px] text-[#aaa]'>ID: {l.id}</p>
										</td>
										<td className='px-5 py-3.5 text-[#666]'>{l.brand}</td>
										<td className='px-5 py-3.5 text-[#666]'>{l.cpu}</td>
										<td className='px-5 py-3.5 text-[#666]'>{l.ram}</td>
										<td className='px-5 py-3.5 font-bold text-[#f59b24]'>{fmt(l.price)}</td>
										<td className='px-5 py-3.5'>
											<span className='font-semibold text-[#333]'>
												{l.stock}
											</span>
										</td>
										<td className='px-5 py-3.5'>
											<span className='text-sm font-semibold text-[#333]'>
												{l.hidden ? 'Hidden' : 'Visible'}
											</span>
										</td>
										<td className='px-5 py-3.5 text-right'>
											<div className='flex items-center justify-end gap-1'>
												<button
													type='button'
													onClick={() => openEdit(l)}
													className='rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[#f59b24] transition hover:bg-[#f59b24]/10'
												>
													Edit
												</button>
												<button
													type='button'
													onClick={() => toggleHidden(l.id)}
													className='rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[#888] transition hover:bg-[#eee]'
												>
													{l.hidden ? 'Show' : 'Hide'}
												</button>
												<button
													type='button'
													onClick={() => removeLaptop(l.id)}
													className='rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-red-400 transition hover:bg-red-50'
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
								{filtered.length === 0 && (
									<tr>
										<td colSpan={9} className='px-5 py-10 text-center text-sm text-[#bbb]'>
											No products found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Edit / Add Modal */}
				{editing && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
						<div className='w-full max-w-135 rounded-2xl bg-white p-7 shadow-2xl'>
							<h2 className='mb-1 text-lg font-extrabold text-[#1e1e2d]'>
								{isNew ? 'Add New Laptop' : 'Edit Laptop'}
							</h2>
							<p className='mb-5 text-xs text-[#999]'>
								{isNew ? 'Fill in the product details below' : `Editing: ${editing.name}`}
							</p>
							{/* Image Upload */}
							<div className='mb-5'>
								<span className='mb-2 block text-xs font-semibold text-[#555]'>Product Image</span>
								<div className='flex items-center gap-4'>
									<div className='h-24 w-32 overflow-hidden rounded-lg border-2 border-dashed border-[#e0e0e0] bg-[#fafafa]'>
										{editing.image ? (
											<img src={editing.image} alt='Preview' className='h-full w-full object-contain' />
										) : (
											<div className='flex h-full w-full flex-col items-center justify-center text-[#ccc]'>
												<span className='text-2xl'>🖼</span>
												<span className='mt-1 text-[10px]'>No image</span>
											</div>
										)}
									</div>
									<div className='flex flex-col gap-2'>
										<label className='cursor-pointer rounded-lg bg-[#f59b24] px-4 py-2 text-center text-[11px] font-bold text-white shadow transition hover:bg-[#e08b15]'>
											Choose File
											<input
												type='file'
												accept='image/*'
												className='hidden'
												onChange={(e) => {
													const file = e.target.files?.[0]
													if (file) {
														const url = URL.createObjectURL(file)
														setEditing({ ...editing, image: url })
													}
												}}
											/>
										</label>
										{editing.image && (
											<button
												type='button'
												onClick={() => setEditing({ ...editing, image: '' })}
												className='rounded-lg border border-[#e0e0e0] px-4 py-2 text-[11px] font-semibold text-red-400 transition hover:bg-red-50'
											>
												Remove
											</button>
										)}
										<p className='text-[10px] text-[#bbb]'>PNG, JPG up to 5MB</p>
									</div>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								{(['name', 'cpu', 'ram', 'storage', 'gpu', 'screen'] as const).map((field) => (
									<label key={field} className='flex flex-col text-xs'>
										<span className='mb-1.5 font-semibold capitalize text-[#555]'>{field === 'cpu' ? 'CPU' : field === 'gpu' ? 'GPU' : field}</span>
										<input
											className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
											value={editing[field]}
											onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
										/>
									</label>
								))}
								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Brand</span>
									<select
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={editing.brand}
										onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
									>
										<option value='' disabled>Select Brand</option>
										{brandOptions.map((brand: string) => (
											<option key={brand} value={brand}>{brand}</option>
										))}
									</select>
								</label>
								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Price ($)</span>
									<input
										type='number'
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={editing.price}
										onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
									/>
								</label>
								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Stock</span>
									<input
										type='number'
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={editing.stock}
										onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
									/>
								</label>
							</div>
							<div className='mt-6 flex justify-end gap-3'>
								<button
									type='button'
									onClick={() => setEditing(null)}
									className='rounded-lg border border-[#e0e0e0] px-5 py-2.5 text-xs font-semibold text-[#666] transition hover:bg-[#f5f5f5]'
								>
									Cancel
								</button>
								<button
									type='button'
									onClick={save}
									className='rounded-lg bg-[#f59b24] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#f59b24]/25 transition hover:bg-[#e08b15]'
								>
									{isNew ? 'Add Product' : 'Save Changes'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default AdminLaptopPage

// Define brandOptions
const brandOptions: string[] = ['Dell', 'Apple', 'Asus'];
