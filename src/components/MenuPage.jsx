import { useEffect, useState } from 'react'
import Header from './Header'
import PageBackdrop from './PageBackdrop'
import { HITS, MENU_UI, MORE_SECTIONS } from '../data/menu'

const formatPrice = (value) => value.toFixed(2)

function PriceLine({ item, lang, className = '' }) {
  return (
    <span className={`flex flex-wrap items-center justify-center gap-x-2 ${className}`}>
      <span className="text-coffee/45">{item.code}</span>
      {item.prices.map((price, index) => (
        <span key={index} className="whitespace-nowrap">
          {item.prices.length === 2 && (
            <span className="mr-0.5 text-coffee/45">
              {[400, 600][index]} {MENU_UI.ml[lang]}{' '}
            </span>
          )}
          {formatPrice(price)}
          {index < item.prices.length - 1 && ' —'}
        </span>
      ))}
      <span className="text-coffee/45">BYN</span>
    </span>
  )
}

function OptionRow({ label, options, value, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index)}
            aria-pressed={value === index}
            className={`rounded-full border px-4 py-2 text-[10px] tracking-[0.12em] transition-all duration-300 ${
              value === index
                ? 'border-espresso bg-espresso text-cream'
                : 'border-espresso/15 bg-white/60 text-coffee hover:border-caramel/50 hover:text-espresso'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function ItemModal({ item, lang, onClose }) {
  const [volumeIndex, setVolumeIndex] = useState(0)
  const [iceIndex, setIceIndex] = useState(2)
  const [sweetIndex, setSweetIndex] = useState(2)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const volumes = item.prices.length === 2 ? [400, 600] : [400]
  const price = item.prices[Math.min(volumeIndex, item.prices.length - 1)]

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-espresso/25 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.name[lang]}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-[28px] border border-[#E6D8C5] bg-[#FFFBF4] p-7 shadow-[0_24px_80px_rgba(43,30,23,0.16)] sm:p-9"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-[10px] uppercase tracking-[0.28em] text-coffee/60 transition-colors hover:text-espresso"
        >
          ✕ {MENU_UI.close[lang]}
        </button>

        <div className="flex items-start gap-5">
          {item.image && (
            <img
              src={item.image}
              alt=""
              className="h-24 w-20 shrink-0 object-contain"
              style={{ filter: 'drop-shadow(0 8px 12px rgba(43,30,23,0.14))' }}
            />
          )}
          <div className="min-w-0">
            <p className="text-[9px] tracking-[0.4em] text-coffee/60">{item.code}</p>
            <h3 className="mt-2 font-display text-3xl leading-tight text-espresso sm:text-4xl">
              {item.name[lang]}
            </h3>
          </div>
        </div>
        <p className="mt-4 max-w-sm text-[11px] leading-relaxed tracking-[0.08em] text-coffee/70">
          {item.desc[lang]}
        </p>

        <div className="my-7 h-px w-full bg-[#E6D8C5]" />

        <div className="space-y-7">
          {item.prices.length === 2 && (
            <OptionRow
              label={`${MENU_UI.volume[lang]} · ${MENU_UI.ml[lang]}`}
              options={volumes.map((v) => `${v} ${MENU_UI.ml[lang]}`)}
              value={volumeIndex}
              onChange={setVolumeIndex}
            />
          )}
          <OptionRow
            label={MENU_UI.ice[lang]}
            options={MENU_UI.iceOptions.map((option) => option[lang])}
            value={iceIndex}
            onChange={setIceIndex}
          />
          <OptionRow
            label={MENU_UI.sweetness[lang]}
            options={MENU_UI.sweetOptions.map((option) => option[lang])}
            value={sweetIndex}
            onChange={setSweetIndex}
          />
        </div>

        <div className="mt-9 flex items-end justify-between gap-4 border-t border-[#E6D8C5] pt-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
              {volumes[Math.min(volumeIndex, volumes.length - 1)]} {MENU_UI.ml[lang]}
            </p>
            <p className="mt-1 font-display text-4xl text-espresso">
              {formatPrice(price)} <span className="text-xs tracking-[0.2em] text-coffee/60">BYN</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdded(true)}
            className="rounded-full bg-espresso px-7 py-3.5 text-[10px] uppercase tracking-[0.24em] text-cream transition-colors duration-300 hover:bg-caramel"
          >
            {added ? MENU_UI.added[lang] : MENU_UI.add[lang]}
          </button>
        </div>
      </div>
    </div>
  )
}

function MenuPage({ lang, onChangeLang, onClose, onOpenMenu }) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#FAF3E8] text-espresso">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#FFFDF8_0%,#FAF3E8_55%,#F3E5D2_100%)]" />
      <PageBackdrop />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-[#FAF3E8]" />

      <div className="relative min-h-full">
        <Header
          lang={lang}
          onChangeLang={onChangeLang}
          onOpenMenu={onOpenMenu}
          onLogoClick={onClose}
          menuOpen={false}
        />

        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-44 md:px-10 md:pt-56">
          <header className="max-w-2xl">
            <img
              src="/images/logo.png"
              alt="Happy Puppy"
              className="h-16 w-16 object-contain transition-transform duration-500 hover:-rotate-12"
            />
            <p className="mt-5 text-[9px] uppercase tracking-[0.45em] text-coffee/60">
              {MENU_UI.subtitle[lang]}
            </p>
            <h1 className="mt-4 font-display text-6xl leading-none tracking-[-0.03em] md:text-8xl">
              {lang === 'ru' ? 'Хиты меню' : lang === 'en' ? 'Signature Picks' : '招牌精选'}
            </h1>
            <p className="mt-5 max-w-lg text-[11px] leading-relaxed tracking-[0.08em] text-coffee/70">
              {MENU_UI.intro[lang]}
            </p>
          </header>

          {/* Витрина из девяти хитов с реальными фото */}
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {HITS.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setSelected(item)}
                className="group flex flex-col items-center text-center focus:outline-none"
              >
                <div className="transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.04]">
                  <img
                    src={item.image}
                    alt={item.name[lang]}
                    loading="lazy"
                    className="h-52 w-full object-contain md:h-56"
                    style={{
                      filter: 'drop-shadow(0 18px 24px rgba(43, 30, 23, 0.14))',
                      mixBlendMode: 'multiply',
                      // В m06.webp стакан занимает лишь нижнюю часть кадра с
                      // большими пустыми полями. Приближаем и центрируем
                      // именно его, чтобы размер совпадал с соседними стаканами.
                      ...(item.code === 'M06'
                        ? { transform: 'translate(114px, -129%) scale(3.77)' }
                        : {}),
                    }}
                  />
                </div>
                <div className="mt-3 flex w-full flex-col items-center">
                  <h2 className="font-display text-[19px] leading-snug text-espresso transition-colors duration-300 group-hover:text-caramel">
                    {item.name[lang]}
                  </h2>
                  <p className="mt-2 line-clamp-2 max-w-[26ch] text-[10px] leading-relaxed tracking-[0.06em] text-coffee">
                    {item.desc[lang]}
                  </p>
                  <PriceLine item={item} lang={lang} className="mt-3 text-[10px] tracking-[0.14em] text-coffee/70" />
                </div>
              </button>
            ))}
          </div>

          {/* Кнопка раскрытия остального меню */}
          <div className="mt-20 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="rounded-full border border-espresso/25 bg-white/50 px-9 py-4 text-[10px] uppercase tracking-[0.28em] text-espresso transition-all duration-300 hover:border-caramel/60 hover:bg-white/90"
            >
              {expanded ? MENU_UI.showLess[lang] : MENU_UI.showMore[lang]}
            </button>
          </div>

          {/* Остальной ассортимент — чистый двухколоночный лист */}
          <div
            className="grid transition-all duration-700 ease-in-out"
            style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="mx-auto mt-14 max-w-4xl space-y-14">
                {MORE_SECTIONS.map((section) => (
                  <section key={section.title.ru}>
                    <h3 className="border-b border-[#E6D8C5] pb-4 font-display text-3xl text-espresso md:text-4xl">
                      {section.title[lang]}
                    </h3>
                    <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-0 md:grid-cols-2">
                      {section.items.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => setSelected(item)}
                          className="group flex items-baseline justify-between gap-4 border-b border-[#E6D8C5]/70 py-4 text-left transition-colors duration-300 hover:text-caramel"
                        >
                          <span className="min-w-0">
                            <span className="mr-3 text-[9px] tracking-[0.3em] text-coffee/45">
                              {item.code}
                            </span>
                            <span className="font-display text-lg text-espresso group-hover:text-caramel">
                              {item.name[lang]}
                            </span>
                            <span className="mt-1 block text-[10px] leading-relaxed tracking-[0.05em] text-coffee/70">
                              {item.desc[lang]}
                            </span>
                          </span>
                          <span className="shrink-0 whitespace-nowrap text-[11px] tracking-[0.1em] text-coffee">
                            {item.prices.map((p) => formatPrice(p)).join(' — ')} BYN
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {selected && (
        <ItemModal item={selected} lang={lang} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

export default MenuPage
