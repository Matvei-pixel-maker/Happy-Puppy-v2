import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AboutPage from './components/AboutPage'
import ContactsPage from './components/ContactsPage'
import DrinkDetail from './components/DrinkDetail'
import Header from './components/Header'
import LocationsPage from './components/LocationsPage'
import MenuOverlay from './components/MenuOverlay'
import MenuPage from './components/MenuPage'
import Scene from './components/Scene'
import './App.css'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const WHEEL_MULTIPLIER = 1.25

// Тёплые пастельные фоны под каждый напиток. Слои плавно
// переcross-fade'ятся с переходом 0.8s ease.
const PALETTES = [
  { base: '#F4EEFA', glow: '#E8D9F8' }, // 01 Виноградный чай
  { base: '#FDF0F3', glow: '#F9DCE4' }, // 02 Клубника Жасмин
  { base: '#FDF4E7', glow: '#FBE4C2' }, // 03 Манго Чиз
  { base: '#FDF8E8', glow: '#F8ECC2' }, // 04 Король-апельсин
  { base: '#EFF6ED', glow: '#DCECD7' }, // 05 Матча Чиз
  { base: '#FCF1EB', glow: '#F7DDD0' }, // 06 Персиковый Улун
]

// Мультиязычные тексты для 6 слайдов
const TEXTS = {
  ru: [
    {
      id: '01',
      category: 'Signature — 01',
      name: 'Виноградный чай',
      note: 'Виноград · жасмин · чайное желе',
    },
    {
      id: '02',
      category: 'Signature — 02',
      name: 'Клубника Жасмин',
      note: 'Клубника · молочная шапка · моти',
    },
    {
      id: '03',
      category: 'Signature — 03',
      name: 'Браун Шугар Бабл Ти',
      note: 'МОЛОКО • КОРИЧНЕВЫЙ САХАР • РУЧНАЯ ТАПИОКА',
    },
    {
      id: '04',
      category: 'Signature — 04',
      name: 'Король-апельсин',
      note: 'Жасминовый чай · свежий апельсин · лимон',
    },
    {
      id: '05',
      category: 'Signature — 05',
      name: 'Матча Чиз',
      note: 'Японская матча · сливки · сырная пена',
    },
    {
      id: '06',
      category: 'Signature — 06',
      name: 'Персиковый Улун',
      note: 'Улун · спелый персик · сливки',
    },
  ],
  en: [
    {
      id: '01',
      category: 'Signature — 01',
      name: 'Grape Pulp Tea',
      note: 'Grape · jasmine · tea jelly',
    },
    {
      id: '02',
      category: 'Signature — 02',
      name: 'Strawberry Jasmine',
      note: 'Strawberry · milk foam · mochi',
    },
    {
      id: '03',
      category: 'Signature — 03',
      name: 'Brown Sugar Boba',
      note: 'FRESH MILK • BROWN SUGAR • HANDCRAFTED TAPIOCA',
    },
    {
      id: '04',
      category: 'Signature — 04',
      name: 'King Orange Tea',
      note: 'Jasmine tea · fresh orange · lemon',
    },
    {
      id: '05',
      category: 'Signature — 05',
      name: 'Cheese Foam Matcha',
      note: 'Japanese matcha · cream · cheese foam',
    },
    {
      id: '06',
      category: 'Signature — 06',
      name: 'Peach Oolong Latte',
      note: 'Oolong · ripe peach · cream',
    },
  ],
  cn: [
    {
      id: '01',
      category: '招牌 — 01',
      name: '多肉葡萄',
      note: '葡萄 · 茉莉花茶 · 茶冻',
    },
    {
      id: '02',
      category: '招牌 — 02',
      name: '草莓茉莉',
      note: '草莓 · 奶盖 · 麻薯',
    },
    {
      id: '03',
      category: '招牌 — 03',
      name: '黑糖珍珠鲜奶',
      note: '鲜牛乳 • 古法黑糖 • 手作珍珠',
    },
    {
      id: '04',
      category: '招牌 — 04',
      name: '霸气橙子',
      note: '茉莉花茶 · 新鲜橙子 · 柠檬',
    },
    {
      id: '05',
      category: '招牌 — 05',
      name: '芝士抹茶',
      note: '日本抹茶 · 奶油 · 奶酪奶盖',
    },
    {
      id: '06',
      category: '招牌 — 06',
      name: '白桃乌龙',
      note: '乌龙茶 · 熟桃子 · 奶油',
    },
  ],
}

const SCROLL_HINTS = {
  ru: 'КРУТИТЕ КОЛЕСО МЫШИ',
  en: 'SCROLL TO EXPLORE',
  cn: '滑动滚轮浏览',
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Единственный источник правды о текущей странице: 'home' | 'menu' | 'about' | 'locations' | 'contacts'
  const [activePage, setActivePage] = useState('home')
  const activePageRef = useRef('home')
  const [selectedDrink, setSelectedDrink] = useState(null)
  const selectedDrinkRef = useRef(null)
  const [lang, setLang] = useState('ru')
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)
  const menuOpenRef = useRef(false)
  const rootRef = useRef(null)
  const sceneRef = useRef(null)
  const scrollerRef = useRef(null)
  const trackRef = useRef(null)
  const progressRef = useRef(0)
  const scrollTargetOverrideRef = useRef(null)
  const progressBarRef = useRef(null)
  const counterRef = useRef(null)
  // DOM-узлы текстовых блоков. Ими управляет тот же useFrame, что двигает
  // 3D-стаканы — поэтому текст и модель идут с одинаковой инерцией.
  const textRefs = useRef([])

  const currentTexts = TEXTS[lang]

  const openMenu = useCallback(() => {
    menuOpenRef.current = true
    setMenuOpen(true)
  }, [])
  const closeMenu = useCallback(() => {
    menuOpenRef.current = false
    setMenuOpen(false)
  }, [])

  useEffect(() => {
    menuOpenRef.current = menuOpen
  }, [menuOpen])

  useEffect(() => {
    activePageRef.current = activePage
  }, [activePage])

  useEffect(() => {
    selectedDrinkRef.current = selectedDrink
  }, [selectedDrink])

  // Единая точка перехода: всегда закрываем меню и безусловно ставим целевую страницу.
  const navigateToPage = useCallback((page) => {
    menuOpenRef.current = false
    setMenuOpen(false)
    selectedDrinkRef.current = null
    setSelectedDrink(null)
    activePageRef.current = page
    setActivePage(page)
  }, [])

  const navigateToMenuPage = useCallback(() => navigateToPage('menu'), [navigateToPage])
  const navigateToAboutPage = useCallback(() => navigateToPage('about'), [navigateToPage])
  const navigateToLocationsPage = useCallback(() => navigateToPage('locations'), [navigateToPage])
  const navigateToContactsPage = useCallback(() => navigateToPage('contacts'), [navigateToPage])

  const navigateHome = useCallback(() => {
    menuOpenRef.current = false
    setMenuOpen(false)
    activePageRef.current = 'home'
    setActivePage('home')

    // Закрываем карточку детального просмотра, если она была открыта.
    selectedDrinkRef.current = null
    setSelectedDrink(null)

    // Плавно возвращаем карусель к первому напитку через тот же damp в useFrame.
    scrollTargetOverrideRef.current = 0
    progressRef.current = 0

    const scroller = scrollerRef.current
    if (scroller) {
      gsap.to(scroller, {
        scrollLeft: 0,
        duration: 0.9,
        ease: 'power3.inOut',
        overwrite: true,
        onComplete: () => {
          scrollTargetOverrideRef.current = null
          progressRef.current = 0
          if (counterRef.current) counterRef.current.textContent = '01'
          if (progressBarRef.current) gsap.set(progressBarRef.current, { scaleX: 0 })
        },
      })
    } else {
      scrollTargetOverrideRef.current = null
      if (counterRef.current) counterRef.current.textContent = '01'
    }
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    const track = trackRef.current
    if (!scroller || !track) return

    const context = gsap.context(() => {
      ScrollTrigger.create({
        scroller,
        horizontal: true,
        trigger: track,
        start: 'left left',
        end: 'right right',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress

          gsap.set(progressBarRef.current, { scaleX: self.progress })

          const active = Math.round(self.progress * (currentTexts.length - 1))
          if (active !== activeIndexRef.current) {
            activeIndexRef.current = active
            setActiveIndex(active)
          }

          if (counterRef.current) {
            const index = active + 1
            counterRef.current.textContent = String(index).padStart(2, '0')
          }
          // Текст обновляется не здесь, а в useFrame — от сглаженного прогресса,
          // общего с 3D-стаканами.
        },
      })
    }, rootRef)

    const handleWheel = (event) => {
      if (
        menuOpenRef.current ||
        activePageRef.current !== 'home' ||
        selectedDrinkRef.current !== null
      ) return

      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? scroller.clientWidth
            : 1
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY

      if (!delta) return

      event.preventDefault()
      scroller.scrollLeft += delta * unit * WHEEL_MULTIPLIER
    }

    // Свайпы пальцем листают карусель так же, как колесо. Короткий тап
    // (<8px) не предотвращается — тогда клик по стакану работает как обычно.
    let touchStartX = 0
    let touchStartY = 0
    let touchLastX = 0
    let touchLastY = 0
    let swiping = false

    const canScroll = () =>
      !menuOpenRef.current &&
      activePageRef.current === 'home' &&
      selectedDrinkRef.current === null

    const handleTouchStart = (event) => {
      if (!canScroll()) return
      const touch = event.touches[0]
      if (!touch) return
      touchStartX = touchLastX = touch.clientX
      touchStartY = touchLastY = touch.clientY
      swiping = false
    }

    const handleTouchMove = (event) => {
      if (!canScroll()) return
      const touch = event.touches[0]
      if (!touch) return

      const totalX = touch.clientX - touchStartX
      const totalY = touch.clientY - touchStartY

      // Пока смещение меньше 8px — это тап, даём событиям клика пройти.
      if (!swiping && Math.hypot(totalX, totalY) < 8) return

      swiping = true
      event.preventDefault()

      const dx = touchLastX - touch.clientX
      const dy = touchLastY - touch.clientY
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy

      touchLastX = touch.clientX
      touchLastY = touch.clientY
      scroller.scrollLeft += delta * WHEEL_MULTIPLIER * 1.6
    }

    const handleKeyDown = (event) => {
      if (
        menuOpenRef.current ||
        activePageRef.current !== 'home' ||
        selectedDrinkRef.current !== null
      ) return

      const step = scroller.clientWidth

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        scroller.scrollBy({ left: step, behavior: 'smooth' })
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        scroller.scrollBy({ left: -step, behavior: 'smooth' })
      } else if (event.key === 'Home') {
        event.preventDefault()
        scroller.scrollTo({ left: 0, behavior: 'smooth' })
      } else if (event.key === 'End') {
        event.preventDefault()
        scroller.scrollTo({ left: scroller.scrollWidth, behavior: 'smooth' })
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    const scene = sceneRef.current
    if (scene) {
      scene.addEventListener('touchstart', handleTouchStart, { passive: false })
      scene.addEventListener('touchmove', handleTouchMove, { passive: false })
    }

    ScrollTrigger.refresh()

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      if (scene) {
        scene.removeEventListener('touchstart', handleTouchStart)
        scene.removeEventListener('touchmove', handleTouchMove)
      }
      context.revert()
    }
  }, [lang, currentTexts])

  useEffect(() => {
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .fromTo(
          '[data-intro="header"]',
          { y: -20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.1, delay: 0.15 },
        )
        .fromTo(
          '[data-intro="hud"]',
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1 },
          '-=0.7',
        )
        .fromTo(
          '[data-intro="copy"]',
          { y: 36, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.06 },
          '-=0.9',
        )
    }, rootRef)

    return () => context.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#F4EEFA]"
    >
      <h1 className="sr-only">HAPPY PUPPY — coffee and bubble tea</h1>

      {/* Реактивный тёплый пастельный фон: слои плавно сменяются при скролле */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {PALETTES.map((palette, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backgroundColor: palette.base,
              backgroundImage: `radial-gradient(115% 85% at 50% 38%, ${palette.glow} 0%, ${palette.base} 72%)`,
              opacity: i === activeIndex ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}
          />
        ))}
      </div>

      <div ref={sceneRef} className="fixed inset-0 z-[1]" aria-hidden="true">
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0.32, 5.9] }}
        >
          <Scene
            progressRef={progressRef}
            textRefs={textRefs}
            selectedDrink={selectedDrink}
            onSelectDrink={setSelectedDrink}
            scrollTargetOverrideRef={scrollTargetOverrideRef}
          />
        </Canvas>
      </div>

      {/* Невидимый горизонтальный трек — источник прогресса для ScrollTrigger */}
      <div
        ref={scrollerRef}
        className="no-scrollbar pointer-events-none fixed inset-0 z-10 overflow-x-auto overflow-y-hidden overscroll-none"
        aria-hidden="true"
      >
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${currentTexts.length * 100}vw` }}
        >
          {currentTexts.map((item) => (
            <section key={item.id} className="h-full w-screen shrink-0" />
          ))}
        </div>
      </div>

      {/* Текст живёт отдельным слоем и управляется из useFrame вместе с 3D */}
      <div className="pointer-events-none fixed inset-0 z-[15] overflow-hidden">
        {currentTexts.map((item, i) => (
          <div
            key={item.id}
            className="absolute inset-x-0 bottom-20 flex justify-center md:bottom-24"
          >
            <div
              ref={(node) => {
                textRefs.current[i] = node
              }}
              className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 will-change-[transform,opacity]"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <div
                aria-hidden="true"
                className="text-outline pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[42vw] leading-none md:text-[26vw]"
              >
                {item.id}
              </div>

              <h2
                data-intro="copy"
                className="font-display text-center text-[clamp(2.2rem,5.2vw,4.5rem)] leading-[0.95] tracking-[-0.03em] text-espresso"
              >
                {item.name}
              </h2>

              <p
                data-intro="copy"
                className="mt-5 max-w-[30ch] text-[10px] uppercase leading-relaxed tracking-[0.22em] text-coffee/80 text-center"
              >
                {item.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none fixed inset-0 z-20 vignette" />
      <div className="grain pointer-events-none fixed inset-0 z-20" />

      <Header lang={lang} onChangeLang={setLang} onOpenMenu={openMenu} menuOpen={menuOpen} />

      <div
        data-intro="hud"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between md:px-10 md:pb-8"
      >
        <div className="flex items-center gap-4">
          <span className="scroll-line h-9 w-px bg-coffee/20" />
          <div>
            <p className="hidden text-[9px] uppercase tracking-[0.4em] text-coffee/70 sm:block">
              {SCROLL_HINTS[lang]}
            </p>
            <p className="mt-1.5 hidden text-[10px] uppercase tracking-[0.22em] text-coffee sm:block">
              Вертикальный скролл · горизонтальная карусель
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-4 sm:w-[38vw] sm:max-w-[320px]">
          <span
            ref={counterRef}
            className="w-6 text-right font-display text-lg leading-none text-espresso"
          >
            01
          </span>
          <div className="relative h-px flex-1 bg-coffee/20">
            <div
              ref={progressBarRef}
              className="absolute inset-0 origin-left bg-caramel"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-coffee/60">
            {String(currentTexts.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      <MenuOverlay
        open={menuOpen}
        onClose={closeMenu}
        onNavigateHome={navigateHome}
        onNavigateMenu={navigateToMenuPage}
        onNavigateAbout={navigateToAboutPage}
        onNavigateLocations={navigateToLocationsPage}
        onNavigateContacts={navigateToContactsPage}
        lang={lang}
      />

      {/* Вложенные страницы — строго одна активная в каждый момент */}
      {activePage === 'menu' && (
        <MenuPage
          lang={lang}
          onChangeLang={setLang}
          onClose={navigateHome}
          onOpenMenu={openMenu}
        />
      )}

      {activePage === 'about' && (
        <AboutPage
          lang={lang}
          onChangeLang={setLang}
          onClose={navigateHome}
          onOpenMenu={openMenu}
        />
      )}

      {activePage === 'locations' && (
        <LocationsPage
          lang={lang}
          onChangeLang={setLang}
          onClose={navigateHome}
          onOpenMenu={openMenu}
        />
      )}

      {activePage === 'contacts' && (
        <ContactsPage
          lang={lang}
          onChangeLang={setLang}
          onClose={navigateHome}
          onOpenMenu={openMenu}
        />
      )}

      {selectedDrink !== null && (
        <DrinkDetail
          index={selectedDrink}
          lang={lang}
          onClose={() => setSelectedDrink(null)}
          onFullMenu={navigateToMenuPage}
        />
      )}
    </div>
  )
}

export default App
