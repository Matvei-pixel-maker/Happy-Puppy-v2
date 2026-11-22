import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const tr = (ru, en, cn) => ({ ru, en, cn })

const LINKS = [
  { key: 'home', label: tr('Главная', 'Home', '首页'), meta: '01' },
  { key: 'menu', label: tr('Меню', 'Menu', '菜单'), meta: '02' },
  { key: 'about', label: tr('О нас', 'About', '关于我们'), meta: '03' },
  { key: 'locations', label: tr('Локации', 'Locations', '门店'), meta: '04' },
  { key: 'contacts', label: tr('Контакты', 'Contacts', '联系方式'), meta: '05' },
]

const PREVIEWS = {
  menu: {
    image: '/images/m01.webp',
    caption: tr('Свежее меню', 'Fresh menu', '新鲜菜单'),
  },
  about: {
    image: '/images/logo.png',
    caption: tr('Знакомьтесь, Happy Puppy', 'Meet Happy Puppy', '认识 Happy Puppy'),
  },
  locations: {
    image: '/images/location-2.png',
    caption: tr('Мы в Минске', 'Find us in Minsk', '我们在明斯克'),
  },
}

const META = {
  navigation: tr('Navigation', 'Navigation', '导航'),
  close: tr('Закрыть', 'Close', '关闭'),
  go: tr('Перейти', 'View', '查看'),
  address: tr('Адрес', 'Address', '地址'),
  hours: tr('Часы', 'Hours', '营业时间'),
  contact: tr('Связь', 'Contact', '联系'),
  addressValue: tr(
    'Минск, ул. Янки Купалы, 19',
    'Minsk, 19 Yanka Kupala St.',
    '明斯克，扬卡·库帕拉街19号',
  ),
  hoursValue: tr('Ежедневно • 11:00 – 22:00', 'Daily • 11:00 – 22:00', '每天 • 11:00 – 22:00'),
  contactValue: tr(
    'Instagram · Telegram · +375 33 358-74-21',
    'Instagram · Telegram · +375 33 358-74-21',
    'Instagram · Telegram · +375 33 358-74-21',
  ),
}

function MenuOverlay({ open, onClose, onNavigateHome, onNavigateMenu, onNavigateAbout, onNavigateLocations, onNavigateContacts, lang }) {
  const overlayRef = useRef(null)
  const closeButtonRef = useRef(null)
  const timelineRef = useRef(null)
  const watermarkRef = useRef(null)
  const [hovered, setHovered] = useState(null)

  // Лёгкий параллакс водяного знака при движении курсора
  useEffect(() => {
    if (!open) return

    const handleMove = (event) => {
      const el = watermarkRef.current
      if (!el) return
      const dx = (event.clientX / window.innerWidth - 0.5) * 26
      const dy = (event.clientY / window.innerHeight - 0.5) * 26
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [open])

  const returnFocusToTrigger = useCallback(() => {
    document.querySelector('[aria-controls="site-menu"]')?.focus()
  }, [])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const links = overlay.querySelectorAll('[data-menu-link]')
    const meta = overlay.querySelectorAll('[data-menu-meta]')

    gsap.set(overlay, { autoAlpha: 0 })
    gsap.set(links, { yPercent: 120, opacity: 0 })
    gsap.set(meta, { y: 16, opacity: 0 })

    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const links = overlay.querySelectorAll('[data-menu-link]')
    const meta = overlay.querySelectorAll('[data-menu-meta]')

    timelineRef.current?.kill()

    if (open) {
      overlay.style.pointerEvents = 'auto'

      const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } })
      timeline
        .set(overlay, { autoAlpha: 1 })
        .to(overlay, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.95,
          ease: 'expo.inOut',
        })
        .fromTo(
          links,
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.07,
            ease: 'power4.out',
          },
          '-=0.5',
        )
        .to(
          meta,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: 'power3.out',
          },
          '-=0.55',
        )

      timelineRef.current = timeline

      const focusTimer = window.setTimeout(
        () => closeButtonRef.current?.focus(),
        350,
      )
      return () => window.clearTimeout(focusTimer)
    }

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        overlay.style.pointerEvents = 'none'
        gsap.set(overlay, { autoAlpha: 0 })
      },
    })

    if (overlay.contains(document.activeElement)) {
      returnFocusToTrigger()
    }

    timeline
      .to(links, {
        yPercent: -70,
        opacity: 0,
        duration: 0.32,
        stagger: 0.03,
      })
      .to(meta, { y: -10, opacity: 0, duration: 0.3 }, '-=0.35')
      .to(
        overlay,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.65,
          ease: 'expo.inOut',
        },
        '-=0.1',
      )

    timelineRef.current = timeline
  }, [open, returnFocusToTrigger])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        returnFocusToTrigger()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, returnFocusToTrigger])

  const handleSelect = (key) => {
    returnFocusToTrigger()
    if (key === 'menu') onNavigateMenu()
    else if (key === 'about') onNavigateAbout()
    else if (key === 'locations') onNavigateLocations()
    else if (key === 'contacts') onNavigateContacts()
    else if (key === 'home') onNavigateHome()
    else onClose()
  }

  return (
    <div
      id="site-menu"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Меню"
      inert={!open}
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#FDF8F1] text-espresso"
      style={{ visibility: 'hidden', clipPath: 'inset(0% 0% 100% 0%)' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_38%,#FFFFFF_0%,#FDF8F1_55%,#F6E9DE_100%)]" />
      <div className="grain pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative flex min-h-full flex-col px-6 py-5 md:px-10 md:py-7">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleSelect('home')}
            className="pointer-events-auto flex items-center gap-2.5"
          >
            <img
              src="/images/logo.png"
              alt="Happy Puppy"
              className="h-9 w-9 object-contain transition-transform duration-500 hover:-rotate-12 sm:h-10 sm:w-10"
            />
            <span className="font-display text-[19px] tracking-[0.24em]">
              HAPPY PUPPY
            </span>
          </button>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => {
              returnFocusToTrigger()
              onClose()
            }}
            className="group flex items-center gap-3 rounded-full border border-espresso/15 bg-white/50 px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] text-espresso transition-colors duration-500 hover:border-caramel/60 hover:bg-white/80"
          >
            {META.close[lang]}
            <span className="relative grid h-5 w-5 place-items-center">
              <span className="absolute h-px w-3 rotate-45 bg-espresso transition-transform duration-500 group-hover:rotate-[135deg]" />
              <span className="absolute h-px w-3 -rotate-45 bg-espresso transition-transform duration-500 group-hover:rotate-[45deg]" />
            </span>
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8 md:py-10">
          <p
            data-menu-meta
            className="mb-6 text-[9px] uppercase tracking-[0.4em] text-coffee/70 md:mb-8"
          >
            {META.navigation[lang]}
          </p>

          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[minmax(0,1fr)_320px]">
          <nav aria-label="Основная навигация">
            <ul className="flex flex-col">
              {LINKS.map((link) => (
                <li key={link.key} className="border-b border-espresso/10">
                  <div className="overflow-hidden">
                    <button
                      data-menu-link
                      type="button"
                      onClick={() => handleSelect(link.key)}
                      onMouseEnter={() => setHovered(link.key)}
                      onMouseLeave={() => setHovered(null)}
                      className="group flex w-full items-baseline justify-between gap-6 py-2 md:py-3"
                    >
                      <span className="flex items-baseline gap-4 md:gap-8">
                        <span className="text-[9px] tracking-[0.3em] text-coffee/70">
                          {link.meta}
                        </span>
                        <span className="font-display text-[12vw] leading-[0.95] tracking-[-0.02em] transition-colors duration-500 group-hover:text-caramel md:text-[5.6vw]">
                          {link.label[lang]}
                        </span>
                      </span>
                      <span className="hidden text-[10px] uppercase tracking-[0.3em] text-coffee/50 transition-all duration-500 group-hover:translate-x-2 group-hover:text-espresso md:block">
                        {META.go[lang]} →
                      </span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          {/* Правая колонка: водяной знак + превью разделов */}
          <div className="pointer-events-none relative hidden items-center justify-center md:flex">
            <div
              ref={watermarkRef}
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            >
              <img
                src="/images/logo.png"
                alt=""
                className="h-[480px] w-[480px] object-contain opacity-[0.07]"
              />
            </div>

            {Object.entries(PREVIEWS).map(([key, preview]) => (
              <div
                key={key}
                className={`absolute transition-all duration-500 ease-out ${
                  hovered === key ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
              >
                <div className="rotate-2 rounded-3xl bg-white/70 p-3 shadow-[0_20px_60px_rgba(43,30,23,0.16)] backdrop-blur-md">
                  <img
                    src={preview.image}
                    alt=""
                    className="h-40 w-40 rounded-2xl object-cover"
                  />
                  <p className="px-1 pb-1 pt-3 text-center text-[10px] tracking-[0.12em] text-coffee">
                    {preview.caption[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="grid gap-6 border-t border-espresso/10 pt-5 md:grid-cols-3 md:gap-8 md:pt-6">
          <div data-menu-meta>
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Happy Puppy"
                className="h-10 w-10 shrink-0 object-contain"
              />
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
                  {META.address[lang]}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-espresso/80">
                  {META.addressValue[lang]}
                </p>
              </div>
            </div>
          </div>
          <div data-menu-meta>
            <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
              {META.hours[lang]}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-espresso/80">
              {META.hoursValue[lang]}
            </p>
          </div>
          <div data-menu-meta>
            <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
              {META.contact[lang]}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-espresso/80">
              {META.contactValue[lang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuOverlay
