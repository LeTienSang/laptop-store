const footerLinks = ['Chính sách bảo mật', 'Điều khoản', 'Hỗ trợ']

const MainFooter = () => {
  return (
    <footer className='mt-14 border-t border-[#e7e7e7] bg-white/70'>
      <div className='mx-auto flex w-full max-w-[1220px] flex-col gap-3 px-4 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:text-left'>
        <p className='m-0 text-sm text-[#595959]'>© 2026 Cửa hàng Laptop. Bảo lưu mọi quyền.</p>
        <nav className='flex items-center justify-center gap-5 text-xs font-semibold uppercase tracking-[0.06em] text-[#5f5f5f]'>
          {footerLinks.map((item) => (
            <a key={item} href='#' className='transition-colors hover:text-[#f59b24]'>
              {item}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default MainFooter