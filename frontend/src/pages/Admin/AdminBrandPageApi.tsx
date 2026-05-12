import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBrands, createBrand, updateBrand, deleteBrand, type Brand } from '../../lib/api'
import PaginationControls from '../../components/common/PaginationControls'

type BrandDraft = {
	name: string
}

const AdminBrandPageApi = () => {
	const [brands, setBrands] = useState<Brand[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [search, setSearch] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const pageSize = 10

	const [editingId, setEditingId] = useState<number | null>(null)
	const [isNew, setIsNew] = useState(false)
	const [draft, setDraft] = useState<BrandDraft>({ name: '' })
	const [saving, setSaving] = useState(false)

	const refresh = async (keyword?: string) => {
		setLoading(true)
		setError(null)
		try {
			const data = await getBrands(keyword ? { keyword } : undefined)
			setBrands(data)
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Lỗi tải thương hiệu'
			setError(msg)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const timer = setTimeout(() => {
			void refresh(search)
		}, 300)
		return () => clearTimeout(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search])

	const totalPages = Math.max(1, Math.ceil(brands.length / pageSize))
	const pagedBrands = brands.slice((currentPage - 1) * pageSize, currentPage * pageSize)

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const openNew = () => {
		setEditingId(null)
		setIsNew(true)
		setDraft({ name: '' })
	}

	const openEdit = (b: Brand) => {
		setEditingId(b.id)
		setIsNew(false)
		setDraft({ name: b.name })
	}

	const closeModal = () => {
		setEditingId(null)
		setIsNew(false)
		setDraft({ name: '' })
	}

	const onSave = async () => {
		if (!draft.name.trim()) {
			setError('Vui lòng nhập tên thương hiệu')
			return
		}

		setSaving(true)
		setError(null)
		try {
			if (isNew) {
				await createBrand(draft.name.trim())
			} else if (editingId != null) {
				await updateBrand(editingId, draft.name.trim())
			}

			closeModal()
			await refresh(search)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Lỗi lưu')
		} finally {
			setSaving(false)
		}
	}

	const onDelete = async (id: number) => {
		// eslint-disable-next-line no-restricted-globals
		if (!confirm(`Xóa thương hiệu này?`)) return
		setError(null)
		try {
			await deleteBrand(id)
			await refresh(search)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Lỗi xóa')
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
						className='rounded-lg px-3 py-2.5 text-white/60 transition hover:bg-white/5 hover:text-white/90'
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
						className='rounded-lg bg-[#f59b24]/15 px-3 py-2.5 font-semibold text-[#f59b24]'
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
						<h1 className='text-2xl font-extrabold text-[#1e1e2d]'>Thương hiệu</h1>
						<p className='mt-1 text-xs text-[#999]'>Quản lý danh sách thương hiệu của bạn</p>
					</div>
					<button
						type='button'
						onClick={openNew}
						className='rounded-lg bg-[#f59b24] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#f59b24]/25 transition hover:bg-[#e08b15]'
					>
						+ Thêm Thương Hiệu
					</button>
				</div>

				{error && <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700'>{error}</div>}

				<div className='mb-5 flex flex-wrap items-center gap-3'>
					<input
						type='text'
						placeholder='Tìm kiếm thương hiệu...'
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setCurrentPage(1)
						}}
						className='w-64 rounded-lg border border-[#e3e3e3] bg-white px-4 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
					/>
					<span className='ml-auto text-xs text-[#999]'>{brands.length} kết quả</span>
				</div>

				<div className='overflow-hidden rounded-xl bg-white shadow-sm'>
					<div className='overflow-x-auto'>
						<table className='w-full text-left text-xs'>
							<thead>
								<tr className='border-b bg-[#fafafa] text-[10px] font-bold uppercase tracking-wider text-[#aaa]'>
									<th className='px-5 py-3.5'>Tên thương hiệu</th>
									<th className='px-5 py-3.5 text-right'>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={2} className='px-5 py-10 text-center text-sm text-[#999]'>
											Đang tải...
										</td>
									</tr>
								) : pagedBrands.length === 0 ? (
									<tr>
										<td colSpan={2} className='px-5 py-10 text-center text-sm text-[#bbb]'>
											Không có thương hiệu nào
										</td>
									</tr>
								) : (
									pagedBrands.map((b) => (
										<tr key={b.id} className='border-b transition hover:bg-[#fafafa] last:border-none'>
											<td className='px-5 py-3.5'>
												<p className='font-semibold text-[#222]'>{b.name}</p>
											</td>
											<td className='px-5 py-3.5 text-right'>
												<div className='flex items-center justify-end gap-1'>
													<button
														type='button'
														onClick={() => openEdit(b)}
														className='rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[#f59b24] transition hover:bg-[#f59b24]/10'
													>
														Sửa
													</button>
													<button
														type='button'
														onClick={() => onDelete(b.id)}
														className='rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-red-400 transition hover:bg-red-50'
													>

										<PaginationControls
											currentPage={currentPage}
											totalPages={totalPages}
											totalItems={brands.length}
											itemLabel='thương hiệu'
											onPageChange={setCurrentPage}
										/>
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

				{(editingId !== null || isNew) && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
						<div className='w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-2xl'>
							<h2 className='mb-1 text-lg font-extrabold text-[#1e1e2d]'>
								{isNew ? 'Thêm Thương Hiệu Mới' : `Sửa Thương Hiệu #${editingId}`}
							</h2>
							<p className='mb-5 text-xs text-[#999]'>Nhập thông tin thương hiệu</p>
							<div className='grid grid-cols-1 gap-4'>
								{error && (
									<div className='rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700'>
										Lỗi: {error}
									</div>
								)}
								<label className='flex flex-col text-xs'>
									<span className='mb-1.5 font-semibold text-[#555]'>Tên thương hiệu</span>
									<input
										type='text'
										className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
										value={draft.name}
										onChange={(e) => setDraft({ name: e.target.value })}
										placeholder='Ví dụ: Apple, Dell, HP...'
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
									{saving ? 'Đang lưu...' : isNew ? 'Thêm thương hiệu' : 'Lưu thay đổi'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default AdminBrandPageApi
