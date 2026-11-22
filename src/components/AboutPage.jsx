import Header from './Header'
import PageBackdrop from './PageBackdrop'
import { ABOUT } from '../data/about'

function AboutPage({ lang, onChangeLang, onClose, onOpenMenu }) {
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
          {/* Главный блок: видео + история */}
          <section className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
            <div className="flex justify-center md:justify-start">
              <div className="aspect-[9/16] w-[300px] overflow-hidden rounded-3xl border border-[#E6D8C5] bg-[#F3E5D2] shadow-[0_28px_80px_rgba(43,30,23,0.16)] md:w-[340px]">
                <video
                  className="h-full w-full object-cover"
                  src="/videos/process.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo.png"
                  alt="Happy Puppy"
                  className="h-12 w-12 object-contain"
                />
                <p className="text-[9px] uppercase tracking-[0.4em] text-coffee/60">
                  {ABOUT.eyebrow[lang]}
                </p>
              </div>

              <h1 className="mt-6 whitespace-pre-line font-display text-5xl leading-[1.03] tracking-[-0.03em] text-espresso md:text-6xl">
                {ABOUT.title[lang]}
              </h1>

              <p className="mt-6 max-w-lg font-display text-xl leading-relaxed text-coffee md:text-2xl">
                {ABOUT.lead[lang]}
              </p>

              <div className="mt-8 space-y-5 border-t border-[#E6D8C5] pt-8">
                {ABOUT.paragraphs.map((text, i) => (
                  <p
                    key={i}
                    className="max-w-lg text-[12px] leading-[1.9] tracking-[0.04em] text-coffee/80"
                  >
                    {text[lang]}
                  </p>
                ))}
              </div>

              <div className="mt-10 flex items-center gap-4">
                <span className="h-px w-12 bg-caramel/60" />
                <span className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
                  {ABOUT.stamp[lang]}
                </span>
              </div>
            </div>
          </section>

          {/* Китайская почта */}
          <section className="mt-32">
            <div className="relative overflow-hidden rounded-[32px] border border-[#E6D8C5] bg-white/50 px-7 py-12 shadow-[0_18px_60px_rgba(43,30,23,0.06)] md:px-14 md:py-16">
              <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[#F7DDD0]/50 blur-3xl" />
              <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
                <div className="flex flex-col items-center gap-4 md:items-start">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[#E6D8C5] bg-[#FFFBF4] shadow-sm">
                    <img
                      src="/images/logo.png"
                      alt="Happy Puppy"
                      className="h-24 w-24 object-contain transition-transform duration-500 hover:-rotate-12"
                    />
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-coffee/60">
                    {ABOUT.postcard.tag[lang]}
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-5xl leading-tight text-espresso md:text-6xl">
                    {ABOUT.postcard.title[lang]}
                  </h2>
                  <p className="mt-2 font-display text-2xl italic text-caramel">
                    {ABOUT.postcard.subtitle[lang]}
                  </p>
                  <p className="mt-6 max-w-2xl text-[12px] leading-[1.9] tracking-[0.04em] text-coffee/80">
                    {ABOUT.postcard.body[lang]}
                  </p>

                  <div className="mt-9 grid gap-4 sm:grid-cols-3">
                    {ABOUT.postcard.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 border-t border-[#E6D8C5] pt-4"
                      >
                        <span className="font-display text-2xl text-caramel">
                          0{i + 1}
                        </span>
                        <span className="text-[11px] leading-snug tracking-[0.08em] text-coffee">
                          {step[lang]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-16 flex justify-center">
            <span className="text-[9px] uppercase tracking-[0.35em] text-coffee/50">
              {ABOUT.address[lang]}
            </span>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AboutPage
