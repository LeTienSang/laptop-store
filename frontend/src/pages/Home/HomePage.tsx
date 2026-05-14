import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemCard from '../../components/ui/ItemCard'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'
import SectionHeading from '../../components/ui/SectionHeading'
import { getBrands, type Brand } from '../../lib/api'

type Product = {
	id: number
	name: string
	price: number | string
	cpu: string
	ram: string
	storage: string
	gpu: string
	stock: number
	brand_id: number
	brandName?: string
	createdAt: string
	image?: string
}

const fallbackImages = [
	'/pictures/laptops/laptop1.png',
	'/pictures/laptops/laptop2.jpg',
	'/pictures/laptops/laptop3.jpg',
	'/pictures/laptops/laptop4.jpg',
	'/pictures/laptops/laptop5.jpg',
	'/pictures/laptops/laptop6.jpg',
]

const normalizeImage = (value?: string): string | undefined => {
	if (!value) return undefined
	const trimmed = value.trim()
	if (!trimmed) return undefined
	const lower = trimmed.toLowerCase()
	if (lower === 'null' || lower === 'undefined') return undefined
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
		return trimmed
	}
	return `/${trimmed}`
}

const resolveProductImage = (product: Product, index: number) => {
	const fallbackImage = fallbackImages[index % fallbackImages.length]
	const normalized = normalizeImage(product.image)
	return {
		image: normalized ?? fallbackImage,
		fallbackImage,
	}
}
const HomePage = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [brands, setBrands] = useState<Brand[]>([])
	const [loading, setLoading] = useState(true)
	const brandNameById = useMemo(() => {
		const map = new Map<number, string>()
		brands.forEach((brand) => map.set(brand.id, brand.name))
		return map
	}, [brands])

	useEffect(() => {
		const fetchNewProducts = async () => {
			try {
				const [response, brandData] = await Promise.all([
					fetch('/api/laptops/new?limit=8'),
					getBrands().catch(() => [] as Brand[]),
				])
				if (!response.ok) {
					throw new Error('Failed to fetch new products')
				}
				const data = await response.json()
				setProducts(data)
				setBrands(brandData)
			} catch (error) {
				console.error('Error fetching new products:', error)
				setProducts([])
				setBrands([])
			} finally {
				setLoading(false)
			}
		}

		fetchNewProducts()
	}, [])

	return (
		<div className='min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f4f4f4]'>
			<main className='mx-auto w-full max-w-[1220px] px-4 pb-10 pt-7 sm:px-9'>
				<MainHeader />

				<section className='relative w-full overflow-hidden rounded-[14px] bg-black shadow-[0_20px_35px_-22px_rgba(0,0,0,0.65)]'>
					<img
						className='block h-[300px] w-full object-cover opacity-55 sm:h-[420px]'
						src='/pictures/laptops/laptop4.jpg'
						alt='laptop'
					/>
					<div className='absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15' />
					<div className='absolute left-6 top-1/2 -translate-y-1/2 text-white sm:left-11'>
						<p className='mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f59b24]'></p>
						<h1 className='m-0 max-w-[480px] text-3xl font-extrabold leading-tight tracking-tight drop-shadow-lg sm:text-5xl'>
							CHÀO MỪNG
						</h1>
						<p className='mb-[18px] mt-[10px] max-w-[420px] text-sm text-white/90'>
							Đến với Laptop Store
						</p>
						<Link
							to='/laptops'
							className='inline-block rounded-[30px] border-none bg-white px-[18px] py-[10px] text-[11px] font-semibold uppercase text-[#202020] shadow-md transition hover:bg-[#f8f8f8]'
						>
							Xem bộ sưu tập
						</Link>
					</div>
				</section>

				<section className='mt-10 rounded-[12px] bg-white px-4 py-7 shadow-[0_18px_30px_-24px_rgba(0,0,0,0.5)] sm:px-6'>
					<SectionHeading title='Sản Phẩm Mới' subtitle='Mới Nhất' />
					{loading ? (
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
							{[...Array(8)].map((_, index) => (
								<div key={index} className='animate-pulse'>
									<div className='h-48 bg-gray-200 rounded-lg mb-4'></div>
									<div className='h-4 bg-gray-200 rounded mb-2'></div>
									<div className='h-4 bg-gray-200 rounded w-3/4'></div>
								</div>
							))}
						</div>
					) : (
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
							{products.map((product, index) => {
								const priceValue = typeof product.price === 'string' ? Number(product.price) : product.price
								const displayPrice = Number.isFinite(priceValue) ? priceValue.toLocaleString('vi-VN') : '0'
								const { image, fallbackImage } = resolveProductImage(product, index)
								const brandLabel = product.brandName?.trim() || brandNameById.get(product.brand_id) || 'Không rõ hãng'

								return (
									<ItemCard
										key={product.id}
										image={image}
										fallbackImage={fallbackImage}
										name={product.name}
										subtext={brandLabel}
										price={`${displayPrice} ₫`}
										href={`/laptops/${product.id}`}
									/>
								)
							})}
						</div>
					)}
					<div className='mt-6 flex justify-center'>
						<Link
							to='/laptops'
							className='inline-block rounded-[30px] border border-[#e0e0e0] px-6 py-[10px] text-xs font-semibold uppercase tracking-wide text-[#4b4b4b] transition hover:border-[#f59b24] hover:text-[#f59b24]'
						>
							More
						</Link>
					</div>
				</section>
			</main>

			<MainFooter />
		</div>
	)
}

export default HomePage
