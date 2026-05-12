import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLaptops, getBrands, type Laptop, type Brand } from '../../lib/api'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'

type LaptopView = {
	id: number
	name: string
	brand_id: number
	price: number
	description: string
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

const fmt = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

const ProductListPageApi = () => {
	const [laptops, setLaptops] = useState<Laptop[]>([])
	const [brands, setBrands] = useState<Brand[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [keyword, setKeyword] = useState('')
	const [selectedBrandId, setSelectedBrandId] = useState<string>('all')
	const [minPrice, setMinPrice] = useState<number>(0)
	const [maxPrice, setMaxPrice] = useState<number>(100000000)
	const [selectedCpu, setSelectedCpu] = useState<string>('all')
	const [selectedRam, setSelectedRam] = useState<string>('all')
	const [selectedStorage, setSelectedStorage] = useState<string>('all')
	const [selectedGpu, setSelectedGpu] = useState<string>('all')
	const brandNameById = useMemo(() => {
		const map = new Map<number, string>()
		brands.forEach((brand) => map.set(brand.id, brand.name))
		return map
	}, [brands])

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				const [laptopsData, brandsData] = await Promise.all([getLaptops(), getBrands()])
				if (mounted) {
					setLaptops(laptopsData)
					setBrands(brandsData)
				}
			} catch (e) {
				if (mounted) setError(e instanceof Error ? e.message : 'Failed to load laptops')
			} finally {
				if (mounted) setLoading(false)
			}
		}
		void load()
		return () => {
			mounted = false
		}
	}, [])

	// Extract unique specs from all laptops
	const specs = useMemo(() => {
		const cpus = new Set<string>()
		const rams = new Set<string>()
		const storages = new Set<string>()
		const gpus = new Set<string>()
		
		for (const l of laptops) {
			if (l.cpu) cpus.add(l.cpu)
			if (l.ram) rams.add(l.ram)
			if (l.storage) storages.add(l.storage)
			if (l.gpu) gpus.add(l.gpu)
		}
		
		return {
			cpus: Array.from(cpus).sort(),
			rams: Array.from(rams).sort(),
			storages: Array.from(storages).sort(),
			gpus: Array.from(gpus).sort(),
		}
	}, [laptops])

	const viewItems: LaptopView[] = useMemo(() => {
		return laptops.map((l) => ({
			id: l.id,
			name: l.name,
			brand_id: Number(l.brand_id),
			price: typeof l.price === 'string' ? Number(l.price) : l.price,
			description: l.description ?? '',
			image: getLaptopImage(l.id),
		}))
	}, [laptops])

	const filtered = useMemo(() => {
		const q = keyword.trim().toLowerCase()
		return viewItems.filter((l) => {
			// Brand filter
			if (selectedBrandId !== 'all' && String(l.brand_id) !== selectedBrandId) return false
			
			// Price range filter
			if (l.price < minPrice || l.price > maxPrice) return false
			
			// Specs filter
			const laptop = laptops.find(x => x.id === l.id)
			if (!laptop) return false
			if (selectedCpu !== 'all' && laptop.cpu !== selectedCpu) return false
			if (selectedRam !== 'all' && laptop.ram !== selectedRam) return false
			if (selectedStorage !== 'all' && laptop.storage !== selectedStorage) return false
			if (selectedGpu !== 'all' && laptop.gpu !== selectedGpu) return false
			
			// Keyword search - search in name and description
			if (q) {
				const searchFields = [
					l.name,
					l.description,
					brandNameById.get(l.brand_id) ?? '',
					laptop.cpu,
					laptop.ram,
					laptop.storage,
					laptop.gpu,
				].join(' ').toLowerCase()
				if (!searchFields.includes(q)) return false
			}
			
			return true
		})
	}, [viewItems, keyword, selectedBrandId, minPrice, maxPrice, selectedCpu, selectedRam, selectedStorage, selectedGpu, laptops, brandNameById])

	return (
		<div className='min-h-screen bg-[#f4f4f4]'>
			<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
				<MainHeader />
			</div>

			<section className='relative mt-2 w-full overflow-hidden bg-black'>
				<img
					className='h-[170px] w-full object-cover opacity-45 sm:h-[210px]'
					src='/pictures/laptops/laptop4.jpg'
					alt='laptops banner'
				/>
				<div className='absolute inset-0 bg-black/45' />
				<div className='absolute inset-0 flex flex-col items-center justify-center text-white'>
					<h1 className='mb-1 text-4xl font-extrabold tracking-tight'>Laptop</h1>
					<p className='text-xs text-white/90'>Trang Chủ {'>'} Laptop</p>
				</div>
			</section>

			<main className='mx-auto w-full max-w-[1220px] px-4 pb-12 pt-9 sm:px-9'>
				<div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<p className='text-xs text-[#888] m-0'>Hiển thị {filtered.length} kết quả</p>
					<div className='flex flex-wrap items-center gap-2'>
						<input
							type='text'
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							placeholder='Tìm kiếm laptop...'
							className='rounded-md border border-[#e3e3e3] bg-white px-3 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
						/>
					</div>
				</div>

				{/* Advanced Filters */}
				<div className='mb-6 rounded-lg border border-[#e3e3e3] bg-white p-4 shadow-sm'>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
							{/* Brand Filter */}
							<div>
								<label className='block text-xs font-semibold text-[#333] mb-1.5'>Thương Hiệu</label>
								<select
									value={selectedBrandId}
									onChange={(e) => setSelectedBrandId(e.target.value)}
									className='w-full rounded-md border border-[#e3e3e3] bg-white px-2 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
								>
									<option value='all'>Tất cả thương hiệu</option>
									{brands.map((brand) => (
										<option key={brand.id} value={String(brand.id)}>
											{brand.name}
										</option>
									))}
								</select>
							</div>

							{/* Price Range */}
							<div>
								<label className='block text-xs font-semibold text-[#333] mb-1.5'>Giá Tối Thiểu</label>
								<input
									type='number'
									value={minPrice}
									onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
									className='w-full rounded-md border border-[#e3e3e3] bg-white px-2 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
									placeholder='VD: 5000000'
								/>
							</div>

							<div>
								<label className='block text-xs font-semibold text-[#333] mb-1.5'>Giá Tối Đa</label>
								<input
									type='number'
									value={maxPrice}
									onChange={(e) => setMaxPrice(Math.max(0, parseInt(e.target.value) || 100000000))}
									className='w-full rounded-md border border-[#e3e3e3] bg-white px-2 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
									placeholder='VD: 50000000'
								/>
							</div>

							{/* CPU Filter */}
							{specs.cpus.length > 0 && (
								<div>
									<label className='block text-xs font-semibold text-[#333] mb-1.5'>CPU</label>
									<select
										value={selectedCpu}
										onChange={(e) => setSelectedCpu(e.target.value)}
										className='w-full rounded-md border border-[#e3e3e3] bg-white px-2 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
									>
										<option value='all'>Tất cả CPU</option>
										{specs.cpus.map((cpu) => (
											<option key={cpu} value={cpu}>
												{cpu}
											</option>
										))}
									</select>
								</div>
							)}

							{/* RAM Filter */}
							{specs.rams.length > 0 && (
								<div>
									<label className='block text-xs font-semibold text-[#333] mb-1.5'>RAM</label>
									<select
										value={selectedRam}
										onChange={(e) => setSelectedRam(e.target.value)}
										className='w-full rounded-md border border-[#e3e3e3] bg-white px-2 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
									>
										<option value='all'>Tất cả RAM</option>
										{specs.rams.map((ram) => (
											<option key={ram} value={ram}>
												{ram}
											</option>
										))}
									</select>
								</div>
							)}

							{/* Storage Filter */}
							{specs.storages.length > 0 && (
								<div>
									<label className='block text-xs font-semibold text-[#333] mb-1.5'>Bộ Nhớ</label>
									<select
										value={selectedStorage}
										onChange={(e) => setSelectedStorage(e.target.value)}
										className='w-full rounded-md border border-[#e3e3e3] bg-white px-2 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
									>
										<option value='all'>Tất cả bộ nhớ</option>
										{specs.storages.map((storage) => (
											<option key={storage} value={storage}>
												{storage}
											</option>
										))}
									</select>
								</div>
							)}

							{/* GPU Filter */}
							{specs.gpus.length > 0 && (
								<div>
									<label className='block text-xs font-semibold text-[#333] mb-1.5'>GPU</label>
									<select
										value={selectedGpu}
										onChange={(e) => setSelectedGpu(e.target.value)}
										className='w-full rounded-md border border-[#e3e3e3] bg-white px-2 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
									>
										<option value='all'>Tất cả GPU</option>
										{specs.gpus.map((gpu) => (
											<option key={gpu} value={gpu}>
												{gpu}
											</option>
										))}
									</select>
								</div>
							)}
						</div>

						{/* Reset Filters Button */}
						<button
							onClick={() => {
								setKeyword('')
								setSelectedBrandId('all')
								setMinPrice(0)
								setMaxPrice(100000000)
								setSelectedCpu('all')
								setSelectedRam('all')
								setSelectedStorage('all')
								setSelectedGpu('all')
							}}
							className='mt-4 rounded-md bg-[#f59b24] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e68917] transition'
						>
							Xóa Tất Cả Lọc
						</button>
				</div>

			{error && <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700'>{error}</div>}

			{loading ? (
						<div className='rounded-xl bg-white p-12 text-center shadow-sm text-[#999] text-sm'>Đang tải...</div>
				) : filtered.length === 0 ? (
					<div className='rounded-xl bg-white p-12 text-center shadow-sm'>
							<p className='text-sm text-[#999]'>Không tìm thấy laptop nào phù hợp với tiêu chí của bạn.</p>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
						{filtered.map((product) => {
							const brandLabel = brandNameById.get(product.brand_id) || 'Không rõ hãng'
							return (
							<Link
								key={product.id}
								to={`/laptops/${product.id}`}
								className='block rounded-[10px] bg-[#efefef] p-3 text-center transition-transform hover:-translate-y-0.5'
							>
								<img
									className='h-40 w-full rounded-md object-cover'
									src={product.image}
									alt={product.name}
								/>
								<h3 className='mb-1 mt-3 text-sm font-semibold text-[#212121]'>{product.name}</h3>
								<p className='m-0 text-[12px] text-[#777]'>{brandLabel}</p>
								<p className='m-0 text-[13px] font-bold text-[#f59b24]'>{fmt(product.price)}</p>
							</Link>
							)
						})}
					</div>
				)}
			</main>

			<MainFooter />
		</div>
	)
}

export default ProductListPageApi

