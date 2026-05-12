import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'
import { addToCart } from '../../lib/cart'
import { getLaptopById, getBrands, type Laptop, type Brand } from '../../lib/api'

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

type RouteParams = {
	id: string
}

const ProductDetailPageApi = () => {
	const { id } = useParams() as RouteParams
	const [laptop, setLaptop] = useState<Laptop | null>(null)
	const [brands, setBrands] = useState<Brand[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [qty, setQty] = useState(1)

	const image = useMemo(() => {
		if (!laptop) return imageOptions[0]
		return getLaptopImage(laptop.id)
	}, [laptop])

	const brandLabel = useMemo(() => {
		if (!laptop) return ''
		const brand = brands.find((b) => b.id === laptop.brand_id)
		return brand?.name ?? 'Không rõ hãng'
	}, [brands, laptop])

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				const [data, brandData] = await Promise.all([getLaptopById(id), getBrands()])
				if (mounted) {
					setLaptop(data)
					setBrands(brandData)
				}
			} catch (e) {
				if (mounted) setError(e instanceof Error ? e.message : 'Failed to load laptop')
			} finally {
				if (mounted) setLoading(false)
			}
		}
		void load()
		return () => {
			mounted = false
		}
	}, [id])

	const onAddToCart = () => {
		if (!laptop) return
		addToCart({ laptop, image, qty })
		setQty(1)
		// eslint-disable-next-line no-alert
		alert('Đã thêm vào giỏ hàng')
	}

	return (
		<div className='min-h-screen bg-[#f4f4f4]'>
			<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
				<MainHeader />
			</div>

			<div className='mx-auto w-full max-w-[1220px] px-4 sm:px-9'>
				<nav className='flex items-center gap-1.5 text-xs text-[#999]'>
					<Link to='/' className='transition-colors hover:text-[#f59b24]'>Trang Chủ</Link>
					<span>/</span>
					<Link to='/laptops' className='transition-colors hover:text-[#f59b24]'>Laptop</Link>
					<span>/</span>
					<span className='text-[#555]'>{laptop?.name ?? '...'}</span>
				</nav>
			</div>

			<main className='mx-auto w-full max-w-[1220px] px-4 pb-6 pt-7 sm:px-9'>
				{loading ? (
					<div className='rounded-xl bg-white p-12 text-center text-sm text-[#999]'>Đang tải...</div>
				) : error ? (
					<div className='rounded-xl bg-red-50 p-6 text-xs text-red-700'>{error}</div>
				) : laptop ? (
					<div className='grid grid-cols-1 gap-8 rounded-xl bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2'>
						<div>
							<div className='overflow-hidden rounded-lg bg-[#f0f0f0]'>
								<img
									className='mx-auto h-[320px] w-full object-cover sm:h-[400px]'
									src={image}
									alt={laptop.name}
								/>
							</div>
						</div>

						<div className='flex flex-col'>
							<p className='mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#f59b24]'>
								Thương Hiệu {brandLabel}
							</p>
							<h1 className='mb-2 text-2xl font-extrabold tracking-tight text-[#151515] sm:text-3xl'>
								{laptop.name}
							</h1>

							<div className='mb-5 flex items-baseline gap-3'>
								<span className='text-2xl font-extrabold text-[#f59b24]'>
									{fmt(typeof laptop.price === 'string' ? Number(laptop.price) : laptop.price)}
								</span>
							</div>

							{/* Description */}
							{laptop.description && (
								<div className='mb-6 rounded-lg border border-[#e3e3e3] bg-white p-4'>
									<h3 className='mb-2 text-xs font-bold uppercase tracking-wider text-[#333]'>Mô Tả</h3>
									<p className='text-sm leading-relaxed text-[#666]'>
										{laptop.description}
									</p>
								</div>
							)}

							{/* Specifications */}
							<div className='mb-6 rounded-lg border border-[#e3e3e3] bg-[#fafafa] p-4'>
								<h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-[#333]'>Thông Số Kỹ Thuật</h3>
								<div className='grid grid-cols-2 gap-3 text-xs'>
									{laptop.cpu && (
										<div>
											<p className='font-semibold text-[#f59b24]'>CPU</p>
											<p className='text-[#666]'>{laptop.cpu}</p>
										</div>
									)}
									{laptop.ram && (
										<div>
											<p className='font-semibold text-[#f59b24]'>RAM</p>
											<p className='text-[#666]'>{laptop.ram}</p>
										</div>
									)}
									{laptop.storage && (
										<div>
											<p className='font-semibold text-[#f59b24]'>Bộ Nhớ</p>
											<p className='text-[#666]'>{laptop.storage}</p>
										</div>
									)}
									{laptop.gpu && (
										<div>
											<p className='font-semibold text-[#f59b24]'>GPU</p>
											<p className='text-[#666]'>{laptop.gpu}</p>
										</div>
									)}
								</div>
							</div>

							<div className='mt-auto flex flex-wrap items-center gap-3'>
								<div className='flex items-center overflow-hidden rounded-full border border-[#e0e0e0]'>
									<button
										type='button'
										onClick={() => setQty((q) => Math.max(1, q - 1))}
										className='h-10 w-10 text-sm font-bold text-[#555] transition hover:bg-[#f0f0f0]'
									>
										−
									</button>
									<span className='flex h-10 w-10 items-center justify-center text-sm font-semibold text-[#333]'>
										{qty}
									</span>
									<button
										type='button'
										onClick={() => setQty((q) => q + 1)}
										className='h-10 w-10 text-sm font-bold text-[#555] transition hover:bg-[#f0f0f0]'
									>
										+
									</button>
								</div>

								<button
									type='button'
									onClick={onAddToCart}
									className='rounded-full bg-[#f59b24] px-7 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
								>
									Thêm Vào Giỏ
								</button>

								<Link
									to='/cart'
									className='flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e0e0] text-sm text-[#999] transition hover:border-[#f59b24] hover:text-[#f59b24]'
									aria-label='Xem giỏ hàng'
								>
									🛒
								</Link>
							</div>
						</div>
					</div>
				) : (
					<div className='rounded-xl bg-white p-12 text-center text-sm text-[#999]'>Không tìm thấy laptop nào</div>
				)}
			</main>

			<MainFooter />
		</div>
	)
}

export default ProductDetailPageApi

