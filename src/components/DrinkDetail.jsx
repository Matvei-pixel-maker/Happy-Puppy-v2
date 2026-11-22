import { useEffect, useState } from 'react'
import { DETAIL_DRINKS, DETAIL_UI } from '../data/drinks'

function DrinkDetail({ index, lang, onClose, onFullMenu }) {
  const [entered, setEntered] = useState(false)
  const drink = DETAIL_DRINKS[index]

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!drink) return null

  return (
    <>
      {/* Клик мимо карточки закрывает просмотр */}
      <div
        className="fixed inset-0 z-[55]"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[56] flex justify-center px-3 pb-3 sm:px-6 sm:pb-6">
        <aside
          className={`pointer-events-auto w-full max-w-2xl rounded-[28px] border border-[#E6D8C5] bg-[#FFFBF4]/92 px-7 py-5 shadow-[0_-24px_70px_rgba(43,30,23,0.16)] backdrop-blur-md transition-all duration-700 ease-out sm:px-10 sm:py-6 ${
            entered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="text-[10px] uppercase tracking-[0.3em] text-coffee/70 transition-colors hover:text-espresso"
            >
              {DETAIL_UI.back[lang]}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={DETAIL_UI.close[lang]}
              className="grid h-8 w-8 place-items-center rounded-full border border-espresso/15 text-xs text-coffee transition-colors hover:border-caramel/50 hover:text-espresso"
            >
              ×
            </button>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <span className="h-px w-8 bg-caramel/60" />
            <span className="text-[10px] tracking-[0.4em] text-coffee/70">
              {drink.code}
            </span>
          </div>

          <h2 className="mt-2 font-display text-3xl leading-[1.05] tracking-[-0.02em] text-espresso sm:text-4xl">
            {drink.name[lang]}
          </h2>

          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-coffee/70">
            {drink.composition[lang]}
          </p>

          <div className="my-4 h-px w-full bg-[#E6D8C5]" />

          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <p className="max-w-md text-[11px] leading-[1.7] tracking-[0.04em] text-coffee/80">
              {drink.description[lang]}
            </p>

            <div className="flex flex-wrap gap-8">
              {drink.prices.map((price, i) => (
                <div key={i}>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-coffee/60">
                    {[400, 600][i]} {DETAIL_UI.ml[lang]}
                  </p>
                  <p className="mt-1 font-display text-3xl text-espresso">
                    {price.toFixed(2)}
                    <span className="ml-1 text-[10px] tracking-[0.2em] text-coffee/60">BYN</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onFullMenu}
            className="mt-5 rounded-full bg-espresso px-8 py-3 text-[10px] uppercase tracking-[0.24em] text-cream transition-colors duration-300 hover:bg-caramel"
          >
            {DETAIL_UI.fullMenu[lang]}
          </button>
        </aside>
      </div>
    </>
  )
}

export default DrinkDetail
