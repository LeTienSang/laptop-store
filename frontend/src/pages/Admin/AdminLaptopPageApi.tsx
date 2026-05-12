import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createLaptop, deleteLaptop, getLaptops, updateLaptop, getBrands, uploadImage, type Laptop, type Brand } from '../../lib/api'
import PaginationControls from '../../components/common/PaginationControls'

type LaptopDraft = {
	name: string
	price: string
	stock: string
	brand_id: string
	description: string
	cpu: string
	ram: string
	storage: string
	gpu: string
	image: string
}

const imageOptions = [
	'/pictures/laptops/laptop1.png',
	'/pictures/laptops/laptop2.jpg',
	'/pictures/laptops/laptop3.jpg',
	'/pictures/laptops/laptop4.jpg',
	'/pictures/laptops/laptop5.jpg',
	'/pictures/laptops/laptop6.jpg',
]

function getLaptopImage(id: number): string {
	return imageOptions[(id - 1) % imageOptions.length]
}

const AdminLaptopPageApi = () => {
	const [laptops, setLaptops] = useState<Laptop[]>([])
	const [brands, setBrands] = useState<Brand[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [search, setSearch] = useState('')
	const [filterBrand, setFilterBrand] = useState<string>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const pageSize = 10

	const [editingId, setEditingId] = useState<number | null>(null)
	const [isNew, setIsNew] = useState(false)
	const [draft, setDraft] = useState<LaptopDraft>({ name: '', price: '', stock: '', brand_id: '', description: '', cpu: '', ram: '', storage: '', gpu: '', image: '' })
	const [saving, setSaving] = useState(false)
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string>('')
	const totalPages = Math.max(1, Math.ceil(laptops.length / pageSize))
	const pagedLaptops = useMemo(
		() => laptops.slice((currentPage - 1) * pageSize, currentPage * pageSize),
		[laptops, currentPage]
	)

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const loadBrands = async () => {
		try {
			const brandData = await getBrands()
			setBrands(brandData)
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Lỗi tải thương hiệu'
			setError(msg)
		}
	}

	const loadLaptops = async (keyword?: string, brandId?: string) => {
		setLoading(true)
		setError(null)
		try {
			const data = await getLaptops({
				keyword: keyword?.trim() ? keyword : undefined,
				brandId: brandId && brandId !== 'all' ? brandId : undefined,
			})
			console.log('Laptops loaded:', data.length)
			setLaptops(data)
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Lỗi tải sản phẩm'
			console.error('Load error:', msg)
			setError(msg)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void loadBrands()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const timer = setTimeout(() => {
			void loadLaptops(search, filterBrand)
		}, 300)
		return () => clearTimeout(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, filterBrand])

	const openNew = () => {
		setEditingId(null)
		setIsNew(true)
		setDraft({ name: '', price: '', stock: '', brand_id: '', description: '', cpu: '', ram: '', storage: '', gpu: '', image: '' })
		setImageFile(null)
		setImagePreview('')
	}

	const openEdit = (l: Laptop) => {
		setEditingId(l.id)
		setIsNew(false)
		setDraft({
			name: l.name ?? '',
			price: String(l.price ?? ''),
			stock: String(l.stock ?? ''),
			brand_id: String(l.brand_id ?? ''),
			description: l.description ?? '',
			cpu: l.cpu ?? '',
			ram: l.ram ?? '',
			storage: l.storage ?? '',
			gpu: l.gpu ?? '',
			image: l.image ?? '',
		})
		setImageFile(null)
		setImagePreview(l.image || getLaptopImage(l.id))
	}

	const closeModal = () => {
		setEditingId(null)
		setIsNew(false)
		setImageFile(null)
		setImagePreview('')
	}

	const onSave = async () => {
		setSaving(true)
		setError(null)
		try {
			const priceNum = Number(draft.price)
			const stockNum = Number(draft.stock)
			const brandIdNum = Number(draft.brand_id)
			if (!draft.name.trim() || !Number.isFinite(priceNum) || !Number.isFinite(stockNum) || !Number.isFinite(brandIdNum)) {
				throw new Error('Please provide valid name, price, stock, and brand_id')
			}

			let imageUrl = draft.image

			if (imageFile) {
				const uploadRes = await uploadImage(imageFile)
				imageUrl = uploadRes.url
			}

			const payload = {
				name: draft.name.trim(),
				price: priceNum,
				stock: stockNum,
				brandId: brandIdNum,
				description: draft.description ?? '',
				cpu: draft.cpu ?? '',
				ram: draft.ram ?? '',
				storage: draft.storage ?? '',
				gpu: draft.gpu ?? '',
				image: imageUrl ?? '',
			}

			if (isNew) {
				await createLaptop(payload)
			} else if (editingId != null) {
				await updateLaptop(editingId, payload)
			}

			closeModal()
			await loadLaptops(search, filterBrand)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Save failed')
		} finally {
			setSaving(false)
		}
	}

	const onDelete = async (id: number) => {
		// eslint-disable-next-line no-restricted-globals
		if (!confirm(`Delete laptop #${id}?`)) return
		setError(null)
		try {
			await deleteLaptop(id)
			setLaptops((prev) => prev.filter((l) => l.id !== id))
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Delete failed')
		}
	}

	return (
		<div className='flex min-h-screen bg-[#f0f2f5]'>
			{/* Sidebar */}
			<aside className='fixed left-0 top-0 flex h-screen w-[220px] flex-col bg-[#1e1e2d]'>
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
			<div className='ml-[220px] flex-1 p-8'>
				<div className='mb-7 flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-extrabold text-[#1e1e2d]'>Laptop</h1>
						<p className='mt-1 text-xs text-[#999]'>Quản lý danh sách sản phẩm của bạn</p>
					</div>
					<button
						type='button'
						onClick={openNew}
						className='rounded-lg bg-[#f59b24] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#f59b24]/25 transition hover:bg-[#e08b15]'
					>
						+ Thêm Laptop
					</button>
				</div>

				{error && <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700'>{error}</div>}

				<div className='mb-5 flex flex-wrap items-center gap-3'>
					<input
						type='text'
						placeholder='Tìm kiếm sản phẩm...'
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setCurrentPage(1)
						}}
						className='w-64 rounded-lg border border-[#e3e3e3] bg-white px-4 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
					/>
					<select
						value={filterBrand}
						onChange={(e) => {
							setFilterBrand(e.target.value)
							setCurrentPage(1)
						}}
						className='rounded-lg border border-[#e3e3e3] bg-white px-4 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
					>
						<option value='all'>Tất Cả Thương Hiệu</option>
						{brands.map((brand) => (
							<option key={brand.id} value={String(brand.id)}>
								{brand.name}
							</option>
						))}
					</select>
					<span className='ml-auto text-xs text-[#999]'>{laptops.length} kết quả</span>
				</div>

				<div className='overflow-hidden rounded-xl bg-white shadow-sm'>
					<div className='overflow-x-auto'>
						<table className='w-full text-left text-xs'>
							<thead>
								<tr className='border-b bg-[#fafafa] text-[10px] font-bold uppercase tracking-wider text-[#aaa]'>
									<th className='px-5 py-3.5'>Hình ảnh</th>
									<th className='px-5 py-3.5'>Sản phẩm</th>
									<th className='px-5 py-3.5'>Thương hiệu</th>
									<th className='px-5 py-3.5'>Giá</th>
									<th className='px-5 py-3.5'>Mô tả</th>
									<th className='px-5 py-3.5 text-right'>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={6} className='px-5 py-10 text-center text-sm text-[#999]'>
											Đang tải...
										</td>
									</tr>
								) : laptops.length === 0 ? (
									<tr>
										<td colSpan={6} className='px-5 py-10 text-center text-sm text-[#bbb]'>
											Không có sản phẩm nào
										</td>
									</tr>
								) : (
									pagedLaptops.map((l) => (
										<tr key={l.id} className='border-b transition hover:bg-[#fafafa] last:border-none'>
											<td className='px-5 py-3.5'>
												<div className='h-10 w-14 overflow-hidden rounded-md bg-[#f5f5f5]'>
													<img src={l.image || getLaptopImage(l.id)} alt={l.name} className='h-full w-full object-contain' />
												</div>
											</td>
											<td className='px-5 py-3.5'>
												<p className='font-semibold text-[#222]'>{l.name}</p>
											</td>
											<td className='px-5 py-3.5 text-[#666]'>
												{l.brandName || 'Không rõ hãng'}
											</td>
											<td className='px-5 py-3.5 font-bold text-[#f59b24]'>
												{Number(l.price).toLocaleString('vi-VN')} ₫
											</td>
											<td className='px-5 py-3.5 text-[#666] max-w-[260px] truncate' title={l.description}>
												{l.description}
											</td>
											<td className='px-5 py-3.5 text-right'>
												<div className='flex items-center justify-end gap-1'>
													<button
														type='button'
														onClick={() => openEdit(l)}
														className='rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[#f59b24] transition hover:bg-[#f59b24]/10'
													>
														Sửa
													</button>
													<button
														type='button'
														onClick={() => onDelete(l.id)}
														className='rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-red-400 transition hover:bg-red-50'
													>
														Xóa
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				<PaginationControls
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={laptops.length}
					itemLabel='sản phẩm'
					onPageChange={setCurrentPage}
				/>

				{(editingId !== null || isNew) && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
						<div className='w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl'>
							<h2 className='mb-1 text-lg font-extrabold text-[#1e1e2d]'>
								{isNew ? 'Thêm Laptop Mới' : `Sửa Laptop #${editingId}`}
							</h2>
							<p className='mb-5 text-xs text-[#999]'>tên, giá, kho hàng, hãng, cpu, ram, lưu trữ, gpu, hình ảnh, mô tả</p>
							<div className='grid grid-cols-2 gap-4'>
								{error && (
									<div className='col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700'>
										Lỗi: {error}
									</div>
								)}
								{brands.length === 0 && !error && (
									<div className='col-span-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700'>
										⚠️ Không có hãng nào. Vui lòng thêm hãng trước.
									</div>
								)}								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Tên</span>
									<input
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.name}
										onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
									/>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Giá</span>
									<input
										type='number'
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.price}
										onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
									/>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Kho hàng</span>
									<input
										type='number'
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.stock}
										onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))}
									/>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Hãng {brands.length > 0 ? `(${brands.length})` : '(0)'}</span>
									<select
										disabled={brands.length === 0}
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed'
										onChange={(e) => setDraft((d) => ({ ...d, brand_id: e.target.value }))}
									>
										<option value=''>Chọn Hãng</option>
										{brands.map((b) => (
											<option key={b.id} value={String(b.id)}>{b.name}</option>
										))}
									</select>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Hình ảnh</span>
									<div className='flex flex-col gap-3'>
										<input
											type='text'
											placeholder='Nhập URL hình ảnh trực tiếp...'
											className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
											value={draft.image}
											onChange={(e) => {
												setDraft((d) => ({ ...d, image: e.target.value }))
												setImagePreview(e.target.value)
											}}
										/>
										<div className='flex items-center gap-3'>
											<input
												type='file'
												accept='image/*'
												className='flex-1 rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
												onChange={(e) => {
													const file = e.target.files?.[0]
													if (file) {
														setImageFile(file)
														const reader = new FileReader()
														reader.onloadend = () => {
															setImagePreview(reader.result as string)
														}
														reader.readAsDataURL(file)
													}
												}}
											/>
											{imagePreview && (
												<img
													src={imagePreview}
													alt='Xem trước'
													className='h-12 w-16 rounded object-cover'
													onError={(e) => (e.currentTarget.style.display = 'none')}
												/>
											)}
										</div>
										<p className='text-[10px] text-[#999]'>Dán URL hoặc chọn file để tải lên server.</p>
									</div>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>CPU</span>
									<input
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.cpu}
										onChange={(e) => setDraft((d) => ({ ...d, cpu: e.target.value }))}
									/>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>RAM</span>
									<input
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.ram}
										onChange={(e) => setDraft((d) => ({ ...d, ram: e.target.value }))}
									/>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Storage</span>
									<input
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.storage}
										onChange={(e) => setDraft((d) => ({ ...d, storage: e.target.value }))}
									/>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>GPU</span>
									<input
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.gpu}
										onChange={(e) => setDraft((d) => ({ ...d, gpu: e.target.value }))}
									/>
								</label>

								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Mô tả</span>
									<textarea
										className='min-h-[90px] rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.description}
										onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
									/>
								</label>
							</div>

							<div className='mt-6 flex justify-end gap-3'>
								<button
									type='button'
									onClick={closeModal}
									className='rounded-lg border border-[#e0e0e0] px-5 py-2.5 text-xs font-semibold text-[#666] transition hover:bg-[#f5f5f5]'
									disabled={saving}
								>
									Hủy
								</button>
								<button
									type='button'
									onClick={() => void onSave()}
									className='rounded-lg bg-[#f59b24] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#f59b24]/25 transition hover:bg-[#e08b15]'
									disabled={saving}
								>
									{saving ? 'Đang lưu...' : isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default AdminLaptopPageApi

