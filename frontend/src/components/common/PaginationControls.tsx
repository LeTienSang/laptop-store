type PaginationControlsProps = {
	currentPage: number
	totalPages: number
	totalItems?: number
	itemLabel?: string
	onPageChange: (page: number) => void
}

const PaginationControls = ({
	currentPage,
	totalPages,
	totalItems,
	itemLabel = 'kết quả',
	onPageChange,
}: PaginationControlsProps) => {
	if (totalPages <= 1) {
		return null
	}

	const goToPage = (page: number) => {
		const nextPage = Math.min(Math.max(page, 1), totalPages)
		if (nextPage !== currentPage) {
			onPageChange(nextPage)
		}
	}

	const visiblePages: number[] = []
	const startPage = Math.max(1, currentPage - 2)
	const endPage = Math.min(totalPages, currentPage + 2)

	for (let page = startPage; page <= endPage; page += 1) {
		visiblePages.push(page)
	}

	return (
		<div className='mt-5 flex flex-col gap-3 rounded-xl bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
			<div className='text-xs text-[#777]'>
				Trang {currentPage} / {totalPages}
				{typeof totalItems === 'number' ? ` • ${totalItems} ${itemLabel}` : ''}
			</div>
			<div className='flex flex-wrap items-center gap-2'>
				<button
					type='button'
					onClick={() => goToPage(currentPage - 1)}
					disabled={currentPage <= 1}
					className='rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#666] transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40'
				>
					Trước
				</button>
				{startPage > 1 && (
					<>
						<button
							type='button'
							onClick={() => goToPage(1)}
							className='rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#666] transition hover:bg-[#f5f5f5]'
						>
							1
						</button>
						{startPage > 2 && <span className='px-1 text-xs text-[#bbb]'>...</span>}
					</>
				)}
				{visiblePages.map((page) => (
					<button
						key={page}
						type='button'
						onClick={() => goToPage(page)}
						className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
							page === currentPage
								? 'bg-[#f59b24] text-white shadow-sm'
								: 'border border-[#e0e0e0] text-[#666] hover:bg-[#f5f5f5]'
						}`}
					>
						{page}
					</button>
				))}
				{endPage < totalPages && (
					<>
						{endPage < totalPages - 1 && <span className='px-1 text-xs text-[#bbb]'>...</span>}
						<button
							type='button'
							onClick={() => goToPage(totalPages)}
							className='rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#666] transition hover:bg-[#f5f5f5]'
						>
							{totalPages}
						</button>
					</>
				)}
				<button
					type='button'
					onClick={() => goToPage(currentPage + 1)}
					disabled={currentPage >= totalPages}
					className='rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#666] transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40'
				>
					Sau
				</button>
			</div>
		</div>
	)
}

export default PaginationControls
