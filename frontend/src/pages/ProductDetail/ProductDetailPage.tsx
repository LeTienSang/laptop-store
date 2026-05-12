import { useState } from 'react'
import { Link } from 'react-router-dom'
import MainHeader from '../../components/layouts/MainHeader'
import MainFooter from '../../components/layouts/MainFooter'

const product = {
	id: 5,
	name: 'MacBook Pro 14"',
	brand: 'Apple',
	price: '$1,890',
	oldPrice: '$2,199',
	rating: 4.8,
	reviews: 124,
	sku: 'MBP14-M3-2026',
	description:
		'The MacBook Pro 14-inch with M3 Pro chip delivers exceptional performance for demanding workflows. With a stunning Liquid Retina XDR display, up to 18 hours of battery life, and a sleek all-aluminum design, this is the ultimate laptop for professionals.',
	stock: 12,
	specs: [
		{ label: 'Processor', value: 'Apple M3 Pro (12-core CPU, 18-core GPU)' },
		{ label: 'Memory', value: '18 GB Unified Memory' },
		{ label: 'Storage', value: '512 GB SSD' },
		{ label: 'GPU', value: 'Integrated 18-core GPU' },
		{ label: 'Display', value: '14.2" Liquid Retina XDR, 3024×1964' },
		{ label: 'Battery', value: 'Up to 18 hours' },
		{ label: 'Weight', value: '1.60 kg' },
		{ label: 'OS', value: 'macOS Sequoia' },
	],
	images: [
		'/pictures/laptops/laptop2.jpg',
		'/pictures/laptops/laptop3.jpg',
		'/pictures/laptops/laptop5.jpg',
		'/pictures/laptops/laptop6.jpg',
	],
}

const relatedProducts = [
	{ id: 1, name: 'Dell XPS 13', price: '$950', image: '/pictures/laptops/laptop1.png' },
	{ id: 3, name: 'MacBook Air M2', price: '$1,090', image: '/pictures/laptops/laptop3.jpg' },
	{ id: 6, name: 'Asus Zenbook 14', price: '$990', image: '/pictures/laptops/laptop6.jpg' },
	{ id: 8, name: 'Asus ROG Zephyrus', price: '$1,650', image: '/pictures/laptops/laptop4.jpg' },
]

type Tab = 'description' | 'specs' | 'reviews'

const ProductDetail = () => {
	const [selectedImage, setSelectedImage] = useState(0)
	const [activeTab, setActiveTab] = useState<Tab>('description')
	const [qty, setQty] = useState(1)

	return (
		<div className='min-h-screen bg-[#f4f4f4]'>
			{/* Header */}
			<div className='mx-auto w-full max-w-[1220px] px-4 pt-7 sm:px-9'>
				<MainHeader />
			</div>

			{/* Breadcrumb */}
			<div className='mx-auto w-full max-w-[1220px] px-4 sm:px-9'>
				<nav className='flex items-center gap-1.5 text-xs text-[#999]'>
					<Link to='/' className='transition-colors hover:text-[#f59b24]'>Home</Link>
					<span>/</span>
					<Link to='/laptops' className='transition-colors hover:text-[#f59b24]'>Laptops</Link>
					<span>/</span>
					<span className='text-[#555]'>{product.name}</span>
				</nav>
			</div>

			{/* Product Section */}
			<main className='mx-auto w-full max-w-[1220px] px-4 pb-6 pt-7 sm:px-9'>
				<div className='grid grid-cols-1 gap-8 rounded-xl bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2'>
					{/* Image Gallery */}
					<div>
						<div className='overflow-hidden rounded-lg bg-[#f0f0f0]'>
							<img
								className='mx-auto h-[320px] w-full object-cover sm:h-[400px]'
								src={product.images[selectedImage]}
								alt={product.name}
							/>
						</div>
						<div className='mt-3 flex gap-2.5'>
							{product.images.map((img, i) => (
								<button
									key={i}
									type='button'
									onClick={() => setSelectedImage(i)}
									className={`h-[68px] w-[68px] overflow-hidden rounded-md border-2 transition ${i === selectedImage ? 'border-[#f59b24]' : 'border-transparent'}`}
								>
									<img className='h-full w-full object-cover' src={img} alt={`thumb ${i + 1}`} />
								</button>
							))}
						</div>
					</div>

					{/* Product Info */}
					<div className='flex flex-col'>
						<p className='mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#f59b24]'>
							{product.brand}
						</p>
						<h1 className='mb-2 text-2xl font-extrabold tracking-tight text-[#151515] sm:text-3xl'>
							{product.name}
						</h1>

						{/* Rating */}
						<div className='mb-4 flex items-center gap-2'>
							<div className='flex gap-0.5 text-sm text-[#f59b24]'>
								{'★★★★★'.split('').map((s, i) => (
									<span key={i} className={i < Math.round(product.rating) ? '' : 'text-[#ddd]'}>{s}</span>
								))}
							</div>
							<span className='text-xs text-[#999]'>
								{product.rating} ({product.reviews} reviews)
							</span>
						</div>

						{/* Price */}
						<div className='mb-5 flex items-baseline gap-3'>
							<span className='text-2xl font-extrabold text-[#f59b24]'>{product.price}</span>
							<span className='text-sm text-[#bbb] line-through'>{product.oldPrice}</span>
						</div>

						<p className='mb-5 text-sm leading-relaxed text-[#666]'>{product.description}</p>

						<p className='mb-5 text-xs text-[#aaa]'>
							SKU: <span className='text-[#666]'>{product.sku}</span>
						</p>

						{/* Stock Status */}
						<p className='mb-5 text-xs font-semibold'>
							{product.stock > 0 ? (
								<span className='text-green-600'>● In Stock ({product.stock} available)</span>
							) : (
								<span className='text-red-500'>● Out of Stock</span>
							)}
						</p>
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
								className='rounded-full bg-[#f59b24] px-7 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-[#e08b15]'
							>
								Add to Cart
							</button>
							<button
								type='button'
								className='flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e0e0] text-sm text-[#999] transition hover:border-[#f59b24] hover:text-[#f59b24]'
								aria-label='Add to wishlist'
							>
								♡
							</button>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className='mt-8 rounded-xl bg-white p-5 shadow-sm sm:p-8'>
					<div className='mb-6 flex border-b border-[#eee]'>
						{(['description', 'specs', 'reviews'] as Tab[]).map((tab) => (
							<button
								key={tab}
								type='button'
								onClick={() => setActiveTab(tab)}
								className={`px-5 pb-3 text-xs font-semibold uppercase tracking-wide transition ${
									activeTab === tab
										? 'border-b-2 border-[#f59b24] text-[#f59b24]'
										: 'text-[#999] hover:text-[#666]'
								}`}
							>
								{tab === 'specs' ? 'Specifications' : tab}
							</button>
						))}
					</div>

					{activeTab === 'description' && (
						<p className='max-w-3xl text-sm leading-relaxed text-[#666]'>{product.description}</p>
					)}

					{activeTab === 'specs' && (
						<table className='w-full max-w-2xl text-sm'>
							<tbody>
								{product.specs.map((spec, i) => (
									<tr key={spec.label} className={i % 2 === 0 ? 'bg-[#fafafa]' : ''}>
										<td className='px-4 py-2.5 font-semibold text-[#333]'>{spec.label}</td>
										<td className='px-4 py-2.5 text-[#666]'>{spec.value}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}

					{activeTab === 'reviews' && (
						<div className='space-y-4'>
							{[
								{ user: 'Minh T.', text: 'Máy chạy cực mượt, pin trâu, rất hài lòng!', stars: 5 },
								{ user: 'Hoa N.', text: 'Thiết kế đẹp, màn hình sắc nét. Giá hơi cao nhưng xứng đáng.', stars: 4 },
								{ user: 'Alex P.', text: 'Great build quality, fast performance for coding.', stars: 5 },
							].map((review) => (
								<div key={review.user} className='rounded-lg bg-[#fafafa] p-4'>
									<div className='mb-1 flex items-center gap-2'>
										<span className='text-sm font-semibold text-[#333]'>{review.user}</span>
										<span className='text-xs text-[#f59b24]'>{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</span>
									</div>
									<p className='text-sm text-[#666]'>{review.text}</p>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Related Products */}
				<section className='mt-8'>
					<div className='mb-5 text-center'>
						<p className='mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f59b24]'>
							You may also like
						</p>
						<h2 className='text-2xl font-extrabold tracking-tight text-[#151515] sm:text-3xl'>
							Related Products
						</h2>
						<span className='mx-auto mt-3 block h-[3px] w-16 rounded-full bg-[#f59b24]' aria-hidden='true' />
					</div>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						{relatedProducts.map((p) => (
							<Link
								key={p.id}
								to={`/laptops/${p.id}`}
								className='rounded-[10px] bg-white p-3 text-center shadow-sm transition-transform hover:-translate-y-0.5'
							>
								<img className='h-[140px] w-full rounded-md object-cover' src={p.image} alt={p.name} />
								<h3 className='mb-1 mt-3 text-sm font-semibold text-[#212121]'>{p.name}</h3>
								<p className='m-0 text-[13px] font-bold text-[#f59b24]'>{p.price}</p>
							</Link>
						))}
					</div>
				</section>
			</main>

			<MainFooter />
		</div>
	)
}

export default ProductDetail