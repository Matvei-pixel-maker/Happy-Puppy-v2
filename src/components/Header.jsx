function Header({ lang, onChangeLang, onOpenMenu, menuOpen, onLogoClick }) {
  const LANGUAGES = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'cn', label: 'CN' },
  ]

  return (
    <header data-intro="header" className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-white/75 via-white/25 to-transparent" />

      <div className="flex items-center justify-between px-3 py-3 sm:px-6 sm:py-5 md:px-10 md:py-7">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault()
            onLogoClick?.()
          }}
          className="pointer-events-auto group flex items-center gap-2 sm:gap-3.5"
          aria-label="HAPPY PUPPY — на главную"
        >
          <img
            src="/images/logo.png"
            alt="Happy Puppy"
            className="h-9 w-9 shrink-0 object-contain transition-transform duration-500 ease-out group-hover:-rotate-12 group-hover:scale-110 sm:h-11 sm:w-11"
          />
          <span className="flex flex-col">
            <span className="whitespace-nowrap font-display text-[13px] leading-none tracking-[0.16em] text-espresso max-[380px]:text-[11px] max-[380px]:tracking-[0.1em] sm:text-[19px] sm:tracking-[0.24em]">
              HAPPY PUPPY
            </span>
            <span className="mt-1.5 hidden text-[7px] uppercase tracking-[0.42em] text-coffee/70 sm:block">
              Coffee · Bubble Tea · Bakery
            </span>
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-7">
          <span className="hidden text-[9px] uppercase tracking-[0.35em] text-coffee/70 sm:block">
            MINSK • 53.90° N
          </span>

          <div className="flex items-center gap-0.5 rounded-full border border-espresso/10 bg-white/45 px-1 py-1 shadow-[0_2px_14px_rgba(43,30,23,0.05)] backdrop-blur-md sm:gap-1.5 sm:px-1.5">
            {LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                type="button"
                onClick={() => onChangeLang(lng.code)}
                aria-pressed={lang === lng.code}
                className={`pointer-events-auto rounded-full px-1.5 py-1 text-[8px] uppercase tracking-[0.3em] transition-all duration-300 max-[380px]:px-1 sm:px-2.5 sm:tracking-[0.4em] ${
                  lang === lng.code
                    ? 'bg-white text-espresso shadow-[0_1px_6px_rgba(43,30,23,0.1)]'
                    : 'text-coffee/60 hover:bg-white/60 hover:text-espresso'
                }`}
              >
                {lng.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenMenu}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="pointer-events-auto group flex shrink-0 items-center gap-2 rounded-full border border-espresso/15 bg-white/55 py-2 pl-3 pr-1.5 shadow-[0_2px_16px_rgba(43,30,23,0.06)] backdrop-blur-md transition-all duration-500 hover:border-caramel/50 hover:bg-white/80 sm:gap-4 sm:py-2.5 sm:pl-5 sm:pr-3"
          >
            <span className="text-[9px] uppercase tracking-[0.28em] text-espresso sm:text-[10px]">
              Меню
            </span>
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-espresso/15 transition-colors duration-500 group-hover:border-caramel/40 sm:h-7 sm:w-7">
              <span className="flex flex-col gap-[5px]">
                <span className="h-px w-3 bg-espresso transition-transform duration-500 group-hover:translate-x-0.5" />
                <span className="h-px w-3 bg-espresso transition-transform duration-500 group-hover:-translate-x-0.5" />
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
