import { useState } from 'react'
import { Link } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'

type LaptopProduct = {
	id: number
	name: string
	brand: string
	price: number
	image: string
	processor: string
	memory: string
	storage: string
	gpu: string
	display: string
}

const allLaptops: LaptopProduct[] = [
	{ id: 1, name: 'Dell XPS 13', brand: 'Dell', price: 950, image: '/pictures/laptops/laptop1.png', processor: 'Intel Core i7', memory: '16GB', storage: '512GB SSD', gpu: 'Integrated', display: '13.4"' },
	{ id: 2, name: 'Asus Vivobook Pro', brand: 'Asus', price: 780, image: '/pictures/laptops/laptop2.jpg', processor: 'AMD Ryzen 7', memory: '16GB', storage: '512GB SSD', gpu: 'NVIDIA RTX 3050', display: '15.6"' },
	{ id: 3, name: 'MacBook Air M2', brand: 'Apple', price: 1090, image: '/pictures/laptops/laptop3.jpg', processor: 'Apple M2', memory: '8GB', storage: '256GB SSD', gpu: 'Integrated', display: '13.6"' },
	{ id: 4, name: 'Dell Inspiron 15', brand: 'Dell', price: 690, image: '/pictures/laptops/laptop4.jpg', processor: 'Intel Core i5', memory: '8GB', storage: '256GB SSD', gpu: 'Integrated', display: '15.6"' },
	{ id: 5, name: 'MacBook Pro 14', brand: 'Apple', price: 1890, image: '/pictures/laptops/laptop5.jpg', processor: 'Apple M3 Pro', memory: '18GB', storage: '1TB SSD', gpu: 'Integrated', display: '14.2"' },
	{ id: 6, name: 'Asus Zenbook 14', brand: 'Asus', price: 990, image: '/pictures/laptops/laptop6.jpg', processor: 'Intel Core i7', memory: '16GB', storage: '512GB SSD', gpu: 'Integrated', display: '14"' },
	{ id: 7, name: 'Dell Latitude 5440', brand: 'Dell', price: 1150, image: '/pictures/laptops/laptop3.jpg', processor: 'Intel Core i7', memory: '32GB', storage: '1TB SSD', gpu: 'Integrated', display: '14"' },
	{ id: 8, name: 'Asus ROG Zephyrus', brand: 'Asus', price: 1650, image: '/pictures/laptops/laptop1.png', processor: 'AMD Ryzen 9', memory: '32GB', storage: '1TB SSD', gpu: 'NVIDIA RTX 4070', display: '16"' },
	{ id: 9, name: 'MacBook Pro 16', brand: 'Apple', price: 2390, image: '/pictures/laptops/laptop5.jpg', processor: 'Apple M3 Max', memory: '36GB', storage: '1TB SSD', gpu: 'Integrated', display: '16.2"' },
	{ id: 10, name: 'Dell XPS 15', brand: 'Dell', price: 1350, image: '/pictures/laptops/laptop6.jpg', processor: 'Intel Core i7', memory: '16GB', storage: '512GB SSD', gpu: 'NVIDIA RTX 3050', display: '15.6"' },
	{ id: 11, name: 'Asus TUF Gaming F15', brand: 'Asus', price: 890, image: '/pictures/laptops/laptop2.jpg', processor: 'AMD Ryzen 7', memory: '16GB', storage: '512GB SSD', gpu: 'NVIDIA RTX 3050', display: '15.6"' },
	{ id: 12, name: 'MacBook Air M3', brand: 'Apple', price: 1190, image: '/pictures/laptops/laptop3.jpg', processor: 'Apple M3 Pro', memory: '16GB', storage: '512GB SSD', gpu: 'Integrated', display: '13.6"' },
	{ id: 13, name: 'Dell Vostro 16', brand: 'Dell', price: 820, image: '/pictures/laptops/laptop4.jpg', processor: 'Intel Core i5', memory: '16GB', storage: '512GB SSD', gpu: 'Integrated', display: '16"' },
	{ id: 14, name: 'Asus ProArt StudioBook', brand: 'Asus', price: 2100, image: '/pictures/laptops/laptop1.png', processor: 'AMD Ryzen 9', memory: '32GB', storage: '1TB SSD', gpu: 'NVIDIA RTX 4070', display: '16"' },
	{ id: 15, name: 'Dell G16 Gaming', brand: 'Dell', price: 1450, image: '/pictures/laptops/laptop5.jpg', processor: 'Intel Core i7', memory: '16GB', storage: '1TB SSD', gpu: 'NVIDIA RTX 4070', display: '16"' },
	{ id: 16, name: 'Asus Chromebook Plus', brand: 'Asus', price: 450, image: '/pictures/laptops/laptop6.jpg', processor: 'Intel Core i5', memory: '8GB', storage: '256GB SSD', gpu: 'Integrated', display: '14"' },
	{ id: 17, name: 'MacBook Pro 14 M3', brand: 'Apple', price: 1990, image: '/pictures/laptops/laptop2.jpg', processor: 'Apple M3 Pro', memory: '18GB', storage: '1TB SSD', gpu: 'Integrated', display: '14.2"' },
	{ id: 18, name: 'Dell Precision 5680', brand: 'Dell', price: 2650, image: '/pictures/laptops/laptop3.jpg', processor: 'Intel Core i7', memory: '32GB', storage: '1TB SSD', gpu: 'NVIDIA RTX 4070', display: '16"' },
	{ id: 19, name: 'Asus Zenbook Duo', brand: 'Asus', price: 1750, image: '/pictures/laptops/laptop4.jpg', processor: 'Intel Core i7', memory: '16GB', storage: '1TB SSD', gpu: 'Integrated', display: '14"' },
	{ id: 20, name: 'Dell XPS 17', brand: 'Dell', price: 1800, image: '/pictures/laptops/laptop1.png', processor: 'Intel Core i7', memory: '32GB', storage: '1TB SSD', gpu: 'NVIDIA RTX 3050', display: '16"' },
]

const brandList = ['All', 'Apple', 'Dell', 'Asus']
const memoryList = ['All', '8GB', '16GB', '18GB', '32GB', '36GB']
const storageList = ['All', '256GB SSD', '512GB SSD', '1TB SSD']
const priceRanges = [
	{ label: 'All prices', min: 0, max: Infinity },
	{ label: 'Below $700', min: 0, max: 699 },
	{ label: '$700 - $1000', min: 700, max: 1000 },
	{ label: '$1000 - $1500', min: 1000, max: 1500 },
	{ label: '$1500 - $2000', min: 1500, max: 2000 },
	{ label: 'Above $2000', min: 2000, max: Infinity },
]

const ITEMS_PER_PAGE = 12

const fmt = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

const ProductListPage = () => {
	const [keyword, setKeyword] = useState('')
	const [selectedBrand, setSelectedBrand] = useState('All')
	const [selectedPrice, setSelectedPrice] = useState(0)
	const [selectedMemory, setSelectedMemory] = useState('All')
	const [selectedStorage, setSelectedStorage] = useState('All')
	const [page, setPage] = useState(0)

	const range = priceRanges[selectedPrice]

	const filtered = allLaptops.filter((l) => {
		if (selectedBrand !== 'All' && l.brand !== selectedBrand) return false
		if (l.price < range.min || l.price > range.max) return false
		if (selectedMemory !== 'All' && l.memory !== selectedMemory) return false
		if (selectedStorage !== 'All' && l.storage !== selectedStorage) return false
		if (keyword && !l.name.toLowerCase().includes(keyword.toLowerCase())) return false
		return true
	})

	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
	const paginatedProducts = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

	return (
		<div className='min-h-screen bg-[#f4f4f4]'>
			<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
				<MainHeader />
			</div>

			<section className='relative mt-2 w-full overflow-hidden bg-black'>
				<img className='h-[170px] w-full object-cover opacity-45 sm:h-[210px]' src='/pictures/laptops/laptop4.jpg' alt='laptops banner' />
				<div className='absolute inset-0 bg-black/45' />
				<div className='absolute inset-0 flex flex-col items-center justify-center text-white'>
					<h1 className='mb-1 text-4xl font-extrabold tracking-tight'>Laptops</h1>
					<p className='text-xs text-white/90'>Home {'>'} Laptops</p>
				</div>
			</section>

			<main className='mx-auto grid w-full max-w-[1220px] grid-cols-1 gap-6 px-4 pb-12 pt-9 sm:px-9 lg:grid-cols-[1fr_280px]'>
				{/* Product Grid */}
				<section>
					<div className='mb-5 flex flex-col gap-3 text-xs text-[#888] sm:flex-row sm:items-center sm:justify-between'>
						<p className='m-0'>Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} results</p>
						<div className='flex items-center gap-2'>
							<input
								type='text'
								value={keyword}
								onChange={(e) => setKeyword(e.target.value)}
								placeholder='Search laptop...'
								className='rounded-md border border-[#e3e3e3] bg-white px-3 py-2 text-xs text-[#555] outline-none transition focus:border-[#f59b24]'
							/>
						</div>
					</div>

					{filtered.length === 0 ? (
						<div className='rounded-xl bg-white p-12 text-center shadow-sm'>
							<p className='text-sm text-[#999]'>No laptops found matching your criteria.</p>
						</div>
					) : (
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
							{paginatedProducts.map((product) => (
								<Link
									key={product.id}
									to={`/laptops/${product.id}`}
									className='block rounded-[10px] bg-[#efefef] p-3 text-center transition-transform hover:-translate-y-0.5'
								>
									<img className='h-40 w-full rounded-md object-cover' src={product.image} alt={product.name} />
									<h3 className='mb-1 mt-3 text-sm font-semibold text-[#212121]'>{product.name}</h3>
									<p className='m-0 text-[12px] text-[#777]'>{product.brand}</p>
									<p className='m-0 text-[13px] font-bold text-[#f59b24]'>{fmt(product.price)}</p>
								</Link>
							))}
						</div>
					)}

					{totalPages > 1 && (
						<div className='mt-6 flex items-center justify-center gap-2'>
							<button
								type='button'
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								disabled={page === 0}
								className='rounded-md border border-[#e0e0e0] px-3 py-1.5 text-xs text-[#555] transition hover:border-[#f59b24] hover:text-[#f59b24] disabled:opacity-40 disabled:hover:border-[#e0e0e0] disabled:hover:text-[#555]'
							>
								Prev
							</button>
							{Array.from({ length: totalPages }, (_, i) => (
								<button
									key={i}
									type='button'
									onClick={() => setPage(i)}
									className={`h-8 w-8 rounded-md text-xs font-semibold transition ${i === page ? 'bg-[#f59b24] text-white' : 'border border-[#e0e0e0] text-[#555] hover:border-[#f59b24] hover:text-[#f59b24]'}`}
								>
									{i + 1}
								</button>
							))}
							<button
								type='button'
								onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
								disabled={page === totalPages - 1}
								className='rounded-md border border-[#e0e0e0] px-3 py-1.5 text-xs text-[#555] transition hover:border-[#f59b24] hover:text-[#f59b24] disabled:opacity-40 disabled:hover:border-[#e0e0e0] disabled:hover:text-[#555]'
							>
								Next
							</button>
						</div>
					)}
				</section>

				{/* Sidebar Filters */}
				<aside className='space-y-5 text-sm text-[#676767]'>
					<div className='rounded-[10px] bg-white p-4'>
						<h3 className='mb-3 text-sm font-bold text-[#222]'>Brands</h3>
						<ul className='space-y-2 text-xs'>
							{brandList.map((brand) => (
								<li key={brand}>
									<button
										type='button'
										onClick={() => setSelectedBrand(brand)}
										className={`transition-colors hover:text-[#f59b24] ${selectedBrand === brand ? 'font-semibold text-[#f59b24]' : ''}`}
									>
										{brand}
									</button>
								</li>
							))}
						</ul>
					</div>

					<div className='rounded-[10px] bg-white p-4'>
						<h3 className='mb-3 text-sm font-bold text-[#222]'>Filter By Price</h3>
						<ul className='space-y-2 text-xs'>
							{priceRanges.map((range, i) => (
								<li key={range.label}>
									<button
										type='button'
										onClick={() => setSelectedPrice(i)}
										className={`transition-colors hover:text-[#f59b24] ${selectedPrice === i ? 'font-semibold text-[#f59b24]' : ''}`}
									>
										{range.label}
									</button>
								</li>
							))}
						</ul>
					</div>

					<div className='rounded-[10px] bg-white p-4'>
						<h3 className='mb-3 text-sm font-bold text-[#222]'>Memory</h3>
						<ul className='space-y-2 text-xs'>
							{memoryList.map((item) => (
								<li key={item}>
									<button
										type='button'
										onClick={() => setSelectedMemory(item)}
										className={`transition-colors hover:text-[#f59b24] ${selectedMemory === item ? 'font-semibold text-[#f59b24]' : ''}`}
									>
										{item}
									</button>
								</li>
							))}
						</ul>
					</div>

					<div className='rounded-[10px] bg-white p-4'>
						<h3 className='mb-3 text-sm font-bold text-[#222]'>Storage</h3>
						<ul className='space-y-2 text-xs'>
							{storageList.map((item) => (
								<li key={item}>
									<button
										type='button'
										onClick={() => setSelectedStorage(item)}
										className={`transition-colors hover:text-[#f59b24] ${selectedStorage === item ? 'font-semibold text-[#f59b24]' : ''}`}
									>
										{item}
									</button>
								</li>
							))}
						</ul>
					</div>
				</aside>
			</main>

			<MainFooter />
		</div>
	)
}

export default ProductListPage
