import { Link } from 'react-router-dom'

type ItemCardProps = {
  image: string
  fallbackImage?: string
  name: string
  subtext?: string
  price?: string
  href?: string
  objectFit?: 'cover' | 'contain'
}

const ItemCard = ({ image, fallbackImage, name, subtext, price, href, objectFit = 'cover' }: ItemCardProps) => {
  const content = (
    <>
      <img
        className={`h-[130px] w-full rounded-lg ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`}
        src={image}
        alt={name}
        onError={(event) => {
          if (!fallbackImage) return
          const target = event.currentTarget
          if (target.dataset.fallbackApplied === 'true') return
          target.dataset.fallbackApplied = 'true'
          target.src = fallbackImage
        }}
      />
      <h3 className='mb-[3px] mt-[10px] text-sm font-semibold text-[#212121]'>{name}</h3>
      {subtext ? <p className='m-0 text-[11px] text-[#8b8b8b]'>{subtext}</p> : null}
      {price ? <p className='m-0 text-[13px] font-bold text-[#f59b24]'>{price}</p> : null}
    </>
  )

  const className = 'block rounded-[10px] bg-white p-[10px] text-center transition-transform duration-200 hover:-translate-y-0.5'

  if (href) {
    return <Link to={href} className={className}>{content}</Link>
  }

  return <article className={className}>{content}</article>
}

export default ItemCard
