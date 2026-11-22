import { useState } from 'react'
import Header from './Header'
import PageBackdrop from './PageBackdrop'
import { LOCATIONS } from '../data/locations'

const YANDEX_URL = 'https://yandex.by/maps/org/kheppi_pappi/83308128091/'
const GOOGLE_URL =
  'https://www.google.com/maps/search/?api=1&query=Happy+Puppy+Minsk+Yanka+Kupala+19'

const MAP_EMBED =
  'https://yandex.by/map-widget/v1/?ll=27.5615%2C53.9035&z=16&pt=27.5615%2C53.9035%2Cpm2rdm'

function InfoRow({ label, value, extra }) {
  return (
    <div className="border-t border-[#E6D8C5] py-5 first:border-t-0">
      <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">{label}</p>
      <p className="mt-2 font-display text-2xl leading-snug text-espresso">{value}</p>
      {extra && <p className="mt-1 text-[11px] tracking-[0.06em] text-coffee/70">{extra}</p>}
    </div>
  )
}

function LocationsPage({ lang, onChangeLang, onClose, onOpenMenu }) {
  const [activePhoto, setActivePhoto] = useState(0)

  const photos = [
    { src: '/images/logo.png', caption: LOCATIONS.logoCaption[lang], logo: true },
    { src: '/images/location-2.png', caption: LOCATIONS.photoCaption2[lang] },
  ]

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
            <p className="text-[9px] uppercase tracking-[0.45em] text-coffee/60">
              {LOCATIONS.eyebrow[lang]}
            </p>
            <h1 className="mt-4 whitespace-pre-line font-display text-6xl leading-[1.02] tracking-[-0.03em] md:text-8xl">
              {LOCATIONS.title[lang]}
            </h1>
            <p className="mt-5 max-w-lg font-display text-xl leading-relaxed text-coffee md:text-2xl">
              {LOCATIONS.lead[lang]}
            </p>
          </header>

          <section className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Фото входа */}
            <div>
              <div className={`relative aspect-[3/4] overflow-hidden rounded-3xl border border-[#E6D8C5] shadow-[0_24px_70px_rgba(43,30,23,0.12)] ${
                photos[activePhoto].logo ? 'bg-transparent' : 'bg-white/40'
              }`}>
                {photos.map((photo, i) => (
                  <img
                    key={photo.src}
                    src={photo.src}
                    alt={photo.caption}
                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
                      photo.logo ? 'scale-[0.85]' : ''
                    } ${activePhoto === i ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-[11px] tracking-[0.08em] text-coffee">
                  {photos[activePhoto].caption}
                </p>
                <div className="flex gap-2">
                  {photos.map((photo, i) => (
                    <button
                      key={photo.src}
                      type="button"
                      onClick={() => setActivePhoto(i)}
                      aria-label={`${i + 1}`}
                      aria-pressed={activePhoto === i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activePhoto === i ? 'w-8 bg-espresso' : 'w-2 bg-coffee/30 hover:bg-coffee/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {photos.map((photo, i) => (
                  <button
                    key={photo.src}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      activePhoto === i
                        ? 'border-caramel/60 shadow-md'
                        : 'border-[#E6D8C5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.src}
                      alt=""
                      className={`h-28 w-full ${photo.logo ? 'object-contain py-2' : 'object-cover'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Детали */}
            <div className="flex flex-col justify-center">
              <InfoRow label={LOCATIONS.addressLabel[lang]} value={LOCATIONS.address[lang]} extra={LOCATIONS.landmark[lang]} />
              <InfoRow label={LOCATIONS.hoursLabel[lang]} value={LOCATIONS.hours[lang]} />
              <InfoRow label={LOCATIONS.metroLabel[lang]} value={LOCATIONS.metro[lang]} />

              <div className="mt-7 flex flex-wrap gap-3">
                {LOCATIONS.badges.map((badge) => (
                  <span
                    key={badge.ru}
                    className="rounded-full border border-[#E6D8C5] bg-white/60 px-5 py-2.5 text-[10px] tracking-[0.1em] text-coffee"
                  >
                    {badge[lang]}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Карта и кнопки маршрута */}
          <section className="mt-28">
            <h2 className="font-display text-4xl text-espresso md:text-5xl">
              {LOCATIONS.mapLabel[lang]}
            </h2>
            <div className="mt-7 overflow-hidden rounded-2xl border border-[#E6D8C5] bg-white/40 shadow-[0_18px_60px_rgba(43,30,23,0.08)]">
              <iframe
                title="Happy Puppy on Yandex Maps"
                src={MAP_EMBED}
                className="h-[420px] w-full md:h-[520px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <a
                href={YANDEX_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-espresso px-8 py-4 text-[10px] uppercase tracking-[0.22em] text-cream transition-colors duration-300 hover:bg-caramel"
              >
                {LOCATIONS.yandex[lang]}
              </a>
              <a
                href={GOOGLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-espresso/25 bg-white/50 px-8 py-4 text-[10px] uppercase tracking-[0.22em] text-espresso transition-all duration-300 hover:border-caramel/60 hover:bg-white/90"
              >
                {LOCATIONS.google[lang]}
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default LocationsPage
