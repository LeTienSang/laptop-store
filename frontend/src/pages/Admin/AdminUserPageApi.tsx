import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsers, createUser, updateUser, deleteUser, changeUserPassword, type User, type CreateUserInput, type UpdateUserInput, type ChangePasswordInput } from '../../lib/api'
import PaginationControls from '../../components/common/PaginationControls'

type UserDraft = {
	name: string
	email: string
	password: string
	role: 'ADMIN' | 'CUSTOMER'
}

type UserEditDraft = {
	name: string
	email: string
	role: 'ADMIN' | 'CUSTOMER'
}

type PasswordChangeDraft = {
	password: string
}

const AdminUserPageApi = () => {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchKeyword, setSearchKeyword] = useState('')
	const [filterRole, setFilterRole] = useState<string>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const pageSize = 10
	
	const [isNew, setIsNew] = useState(false)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [draft, setDraft] = useState<UserDraft>({ name: '', email: '', password: '', role: 'CUSTOMER' })
	const [editDraft, setEditDraft] = useState<UserEditDraft>({ name: '', email: '', role: 'CUSTOMER' })
	const [passwordDraft, setPasswordDraft] = useState<PasswordChangeDraft>({ password: '' })
	const [showPasswordModal, setShowPasswordModal] = useState(false)
	const [passwordEditingId, setPasswordEditingId] = useState<number | null>(null)

	const loadUsers = async (keyword?: string, role?: string) => {
		try {
			setLoading(true)
			setError(null)
			const data = await getAllUsers({
				keyword: keyword?.trim() ? keyword : undefined,
				role: role && role !== 'all' ? role : undefined,
			})
			setUsers(data)
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unknown error'
			setError(msg)
			console.error('Load users error:', msg)
		} finally {
			setLoading(false)
		}
	}

	// Load users with backend filtering
	useEffect(() => {
		const timer = setTimeout(() => {
			void loadUsers(searchKeyword, filterRole)
		}, 300)
		return () => clearTimeout(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchKeyword, filterRole])

	const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
	const pagedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize)

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const resetFormCreate = () => {
		setDraft({ name: '', email: '', password: '', role: 'CUSTOMER' })
		setIsNew(false)
		setEditingId(null)
	}

	const resetFormEdit = () => {
		setEditDraft({ name: '', email: '', role: 'CUSTOMER' })
		setEditingId(null)
	}

	const resetPasswordForm = () => {
		setPasswordDraft({ password: '' })
		setShowPasswordModal(false)
		setPasswordEditingId(null)
	}

	const handleCreate = async () => {
		try {
			if (!draft.name.trim() || !draft.email.trim() || !draft.password.trim()) {
				alert('Vui lòng điền đầy đủ thông tin')
				return
			}

			if (draft.password.length < 6) {
				alert('Mật khẩu phải ít nhất 6 ký tự')
				return
			}

			const input: CreateUserInput = {
				name: draft.name.trim(),
				email: draft.email.trim(),
				password: draft.password,
				role: draft.role,
			}

			console.log('Creating user:', input)
			await createUser(input)
			alert('Tạo người dùng thành công')
			resetFormCreate()
			await loadUsers(searchKeyword, filterRole)
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unknown error'
			alert(`Lỗi: ${msg}`)
			console.error('Create user error:', msg)
		}
	}

	const openEdit = (user: User) => {
		setEditDraft({ name: user.name, email: user.email, role: user.role })
		setEditingId(user.id)
	}

	const handleUpdate = async () => {
		try {
			if (!editDraft.name.trim() || !editDraft.email.trim() || editingId === null) {
				alert('Vui lòng điền đầy đủ thông tin')
				return
			}

			const input: UpdateUserInput = {
				name: editDraft.name.trim(),
				email: editDraft.email.trim(),
				role: editDraft.role,
			}

			console.log('Updating user:', input)
			await updateUser(editingId, input)
			alert('Cập nhật người dùng thành công')
			resetFormEdit()
			await loadUsers(searchKeyword, filterRole)
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unknown error'
			alert(`Lỗi: ${msg}`)
			console.error('Update user error:', msg)
		}
	}

	const handleChangePassword = async () => {
		try {
			if (!passwordDraft.password.trim()) {
				alert('Vui lòng nhập mật khẩu mới')
				return
			}

			if (passwordDraft.password.length < 6) {
				alert('Mật khẩu phải ít nhất 6 ký tự')
				return
			}

			if (passwordEditingId === null) {
				return
			}

			const input: ChangePasswordInput = {
				password: passwordDraft.password,
			}

			console.log('Changing password for user:', passwordEditingId)
			await changeUserPassword(passwordEditingId, input)
			alert('Đổi mật khẩu thành công')
			resetPasswordForm()
			await loadUsers(searchKeyword, filterRole)
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unknown error'
			alert(`Lỗi: ${msg}`)
			console.error('Change password error:', msg)
		}
	}

	const handleDelete = async (userId: number) => {
		if (!confirm('Bạn chắc chắn muốn xóa người dùng này?')) {
			return
		}

		try {
			console.log('Deleting user:', userId)
			await deleteUser(userId)
			alert('Xóa người dùng thành công')
			await loadUsers(searchKeyword, filterRole)
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unknown error'
			alert(`Lỗi: ${msg}`)
			console.error('Delete user error:', msg)
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
						className='rounded-lg bg-[#f59b24]/15 px-3 py-2.5 font-semibold text-[#f59b24]'
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
				{/* Header */}
				<div className='mb-7 flex items-center justify-between'>
						<div>
							<h1 className='text-2xl font-extrabold text-[#1e1e2d]'>Người dùng</h1>
							<p className='mt-1 text-xs text-[#999]'>Quản lý người dùng hệ thống của bạn</p>
						</div>
						<button
							onClick={() => setIsNew(true)}
							className='rounded-lg bg-[#f59b24] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#f59b24]/25 transition hover:bg-[#e08b15]'
						>
							+ Thêm Người dùng
						</button>
					</div>

					{/* Error Message */}
					{error && <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700'>{error}</div>}

					{/* Search Bar */}
					<div className='mb-5 flex flex-wrap items-center gap-3'>
						<input
							type='text'
							placeholder='Tìm kiếm người dùng...'
							value={searchKeyword}
							onChange={(e) => {
								setSearchKeyword(e.target.value)
								setCurrentPage(1)
							}}
							className='w-64 rounded-lg border border-[#e3e3e3] bg-white px-4 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
						/>
					<select
						value={filterRole}
							onChange={(e) => {
								setFilterRole(e.target.value)
								setCurrentPage(1)
							}}
						className='rounded-lg border border-[#e3e3e3] bg-white px-4 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
					>
						<option value='all'>Tất Cả Vai Trò</option>
						<option value='ADMIN'>ADMIN</option>
						<option value='CUSTOMER'>CUSTOMER</option>
					</select>
					<span className='ml-auto text-xs text-[#999]'>{users.length} kết quả</span>
				</div>

				{/* Users Table */}
				{loading ? (
					<div className='rounded-xl bg-white p-12 text-center text-sm text-[#999]'>Đang tải...</div>
				) : (
					<>
					<div className='overflow-hidden rounded-xl bg-white shadow-sm'>
						<div className='overflow-x-auto'>
							<table className='w-full text-left text-xs'>
									<thead>
										<tr className='border-b bg-[#fafafa] text-[10px] font-bold uppercase tracking-wider text-[#aaa]'>
											<th className='px-5 py-3.5'>ID</th>
											<th className='px-5 py-3.5'>Tên</th>
											<th className='px-5 py-3.5'>Email</th>
											<th className='px-5 py-3.5'>Vai Trò</th>
											<th className='px-5 py-3.5'>Ngày Tạo</th>
											<th className='px-5 py-3.5 text-right'>Hành Động</th>
										</tr>
									</thead>
									<tbody>
										{pagedUsers.length > 0 ? (
											pagedUsers.map((user) => (
												<tr key={user.id} className='border-b hover:bg-[#f9f9f9]'>
													<td className='px-5 py-3.5 font-semibold text-[#666]'>#{user.id}</td>
													<td className='px-5 py-3.5 font-semibold text-[#222]'>{user.name}</td>
													<td className='px-5 py-3.5 text-[#666]'>{user.email}</td>
													<td className='px-5 py-3.5'>
														<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-[#f59b24]/15 text-[#f59b24]' : 'bg-[#e3e3e3] text-[#666]'}`}>
															{user.role}
														</span>
													</td>
													<td className='px-5 py-3.5 text-[#999]'>
														{new Date(user.createdAt).toLocaleDateString('vi-VN')}
													</td>
													<td className='px-5 py-3.5 text-right'>
														<div className='flex items-center justify-end gap-2'>
															<button
																type='button'
																onClick={() => openEdit(user)}
																className='rounded px-2.5 py-1.5 text-[10px] font-bold text-[#f59b24] transition hover:bg-[#f59b24]/10'
															>
																Sửa
															</button>
															<button
																type='button'
																onClick={() => {
																	setPasswordEditingId(user.id)
																	setShowPasswordModal(true)
																}}
																className='rounded px-2.5 py-1.5 text-[10px] font-bold text-[#666] transition hover:bg-[#f0f0f0]'
															>
																Đổi MK
															</button>
															<button
																type='button'
																onClick={() => handleDelete(user.id)}
																className='rounded px-2.5 py-1.5 text-[10px] font-bold text-red-600 transition hover:bg-red-50'
															>
																Xóa
															</button>
														</div>
													</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan={6} className='py-8 text-center text-sm text-[#999]'>
													Không tìm thấy người dùng phù hợp
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
						totalItems={users.length}
						itemLabel='người dùng'
						onPageChange={setCurrentPage}
					/>
						</>
					)}

				{/* Create Modal */}
				{isNew && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
						<div className='w-full max-w-[480px] rounded-2xl bg-white p-7 shadow-2xl'>
							<h2 className='mb-5 text-lg font-extrabold text-[#1e1e2d]'>Thêm Người dùng Mới</h2>

							<label className='mb-4 flex flex-col text-xs'>
								<span className='mb-1.5 font-semibold text-[#555]'>Tên</span>
								<input
									className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
									value={draft.name}
									onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
								/>
							</label>

							<label className='mb-4 flex flex-col text-xs'>
								<span className='mb-1.5 font-semibold text-[#555]'>Email</span>
								<input
									type='email'
									className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
									value={draft.email}
									onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
								/>
							</label>

							<label className='mb-4 flex flex-col text-xs'>
								<span className='mb-1.5 font-semibold text-[#555]'>Mật khẩu</span>
								<input
									type='password'
									className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
									value={draft.password}
									onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
								/>
							</label>

							<label className='mb-6 flex flex-col text-xs'>
								<span className='mb-1.5 font-semibold text-[#555]'>Vai trò</span>
								<select
									className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
									value={draft.role}
									onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as 'ADMIN' | 'CUSTOMER' }))}
								>
									<option value='CUSTOMER'>CUSTOMER</option>
									<option value='ADMIN'>ADMIN</option>
								</select>
							</label>

							<div className='flex gap-3'>
								<button
									onClick={handleCreate}
									className='flex-1 rounded-lg bg-[#f59b24] px-4 py-2.5 font-semibold text-white transition hover:bg-[#e08a17]'
								>
									Tạo
								</button>
								<button
									onClick={resetFormCreate}
									className='flex-1 rounded-lg bg-[#e0e0e0] px-4 py-2.5 font-semibold text-[#333] transition hover:bg-[#d0d0d0]'
								>
									Hủy
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Edit Modal */}
				{editingId !== null && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
						<div className='w-full max-w-[480px] rounded-2xl bg-white p-7 shadow-2xl'>
							<h2 className='mb-5 text-lg font-extrabold text-[#1e1e2d]'>Sửa Người dùng #{editingId}</h2>

							<label className='mb-4 flex flex-col text-xs'>
								<span className='mb-1.5 font-semibold text-[#555]'>Tên</span>
								<input
									className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
									value={editDraft.name}
									onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
								/>
							</label>

							<label className='mb-4 flex flex-col text-xs'>
								<span className='mb-1.5 font-semibold text-[#555]'>Email</span>
								<input
									type='email'
									className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
									value={editDraft.email}
									onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
								/>
							</label>

							<label className='mb-6 flex flex-col text-xs'>
								<span className='mb-1.5 font-semibold text-[#555]'>Vai trò</span>
								<select
									className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
									value={editDraft.role}
									onChange={(e) => setEditDraft((d) => ({ ...d, role: e.target.value as 'ADMIN' | 'CUSTOMER' }))}
								>
									<option value='CUSTOMER'>CUSTOMER</option>
									<option value='ADMIN'>ADMIN</option>
								</select>
							</label>

							<div className='flex gap-3'>
								<button
									onClick={handleUpdate}
									className='flex-1 rounded-lg bg-[#f59b24] px-4 py-2.5 font-semibold text-white transition hover:bg-[#e08a17]'
								>
									Lưu
								</button>
								<button
									onClick={resetFormEdit}
									className='flex-1 rounded-lg bg-[#e0e0e0] px-4 py-2.5 font-semibold text-[#333] transition hover:bg-[#d0d0d0]'
								>
									Hủy
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Password Change Modal */}
				{showPasswordModal && passwordEditingId !== null && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
						<div className='w-full max-w-[480px] rounded-2xl bg-white p-7 shadow-2xl'>
							<h2 className='mb-5 text-lg font-extrabold text-[#1e1e2d]'>Đổi Mật khẩu - User #{passwordEditingId}</h2>

							<label className='mb-6 flex flex-col text-xs'>
								<span className='mb-1.5 font-semibold text-[#555]'>Mật khẩu mới</span>
								<input
									type='password'
									className='rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-xs text-[#333] outline-none transition focus:border-[#f59b24] focus:ring-2 focus:ring-[#f59b24]/10'
									value={passwordDraft.password}
									onChange={(e) => setPasswordDraft({ password: e.target.value })}
									placeholder='Ít nhất 6 ký tự'
								/>
							</label>

							<div className='flex gap-3'>
								<button
									onClick={handleChangePassword}
									className='flex-1 rounded-lg bg-[#f59b24] px-4 py-2.5 font-semibold text-white transition hover:bg-[#e08a17]'
								>
									Đổi Mật khẩu
								</button>
								<button
									onClick={resetPasswordForm}
									className='flex-1 rounded-lg bg-[#e0e0e0] px-4 py-2.5 font-semibold text-[#333] transition hover:bg-[#d0d0d0]'
								>
									Hủy
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default AdminUserPageApi
