type SectionHeadingProps = {
  title: string
  subtitle?: string
}

const SectionHeading = ({ title, subtitle = 'Collection' }: SectionHeadingProps) => {
  return (
    <div className='mb-7 text-center'>
      <p className='mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f59b24]'>{subtitle}</p>
      <h2 className='text-3xl font-extrabold tracking-tight text-[#151515] sm:text-4xl'>{title}</h2>
      <span className='mx-auto mt-3 block h-[3px] w-16 rounded-full bg-[#f59b24]' aria-hidden='true' />
    </div>
  )
}

export default SectionHeading
