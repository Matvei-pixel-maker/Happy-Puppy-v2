import { useEffect, useState } from 'react'
import { useCart } from '../context/useCart'
import { CART_UI } from '../data/cart'
import { MENU_UI } from '../data/menu'

export default function OrderDrawer({ lang }) {
  const {
    items,
    total,
    changeQty,
    removeItem,
    clear,
    isDrawerOpen,
    closeDrawer,
  } = useCart()
  const [largeMode, setLargeMode] = useState(false)

  useEffect(() => {
    if (!isDrawerOpen) return
    const onKey = (event) => {
      if (event.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isDrawerOpen, closeDrawer])

  if (!isDrawerOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[88] bg-espresso/25 backdrop-blur-sm"
        onClick={closeDrawer}
        role="presentation"
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={CART_UI.myOrder[lang]}
        className="fixed inset-x-0 bottom-0 z-[90] max-h-[85vh] overflow-y-auto rounded-t-[32px] border-t border-[#E6D8C5] bg-[#FAF3E8] px-6 pb-8 pt-6 shadow-[0_-24px_80px_rgba(43,30,23,0.2)] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none sm:px-9 sm:py-10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Happy Puppy"
              className="h-12 w-12 shrink-0 object-contain"
            />
            <div>
              <p className="font-display text-2xl text-espresso sm:text-3xl">
                {CART_UI.myOrder[lang]}
              </p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-coffee/60">
                {CART_UI.showToBarista[lang]}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label={CART_UI.close[lang]}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-espresso/15 text-sm text-coffee transition-colors hover:border-caramel/50 hover:text-espresso"
          >
            ×
          </button>
        </div>

        <div className="my-6 h-px w-full bg-[#E6D8C5]" />

        {items.length === 0 ? (
          <p className="py-10 text-center text-[12px] leading-relaxed text-coffee/70">
            {CART_UI.empty[lang]}
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.key}
                className="rounded-2xl border border-[#E6D8C5] bg-white/55 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] tracking-[0.35em] text-coffee/60">
                      {item.code} <span className="opacity-50">·</span>{' '}
                      {item.volume} {MENU_UI.ml[lang]}
                    </p>
                    <p
                      className={`mt-1 font-display leading-tight text-espresso ${
                        largeMode
                          ? 'text-2xl sm:text-3xl'
                          : 'text-xl sm:text-2xl'
                      }`}
                    >
                      {item.name[lang]}
                    </p>
                    {largeMode && (
                      <p className="mt-1 text-xl leading-tight text-caramel">
                        {item.name.cn}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] tracking-[0.08em] text-coffee/70">
                      {CART_UI.ice[lang]}:{' '}
                      {MENU_UI.iceOptions[item.iceIndex]?.[lang] || '—'}{' '}
                      <span className="opacity-40">·</span> {CART_UI.sweet[lang]}:{' '}
                      {MENU_UI.sweetOptions[item.sweetIndex]?.[lang] || '—'}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="font-display text-xl text-espresso">
                      {(item.price * item.qty).toFixed(2)}
                      <span className="ml-1 text-[9px] tracking-[0.2em] text-coffee/60">
                        BYN
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => changeQty(item.key, -1)}
                        aria-label="−"
                        className="grid h-7 w-7 place-items-center rounded-full border border-espresso/15 text-sm text-espresso transition-colors hover:border-caramel/50"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-xs text-espresso">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.key, 1)}
                        aria-label="+"
                        className="grid h-7 w-7 place-items-center rounded-full border border-espresso/15 text-sm text-espresso transition-colors hover:border-caramel/50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="text-[9px] uppercase tracking-[0.2em] text-coffee/50 transition-colors hover:text-clay"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 border-t border-[#E6D8C5] pt-6">
          <button
            type="button"
            onClick={() => setLargeMode((value) => !value)}
            className={`flex w-full items-center justify-between rounded-full border px-5 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors ${
              largeMode
                ? 'border-espresso bg-espresso text-cream'
                : 'border-espresso/15 bg-white/50 text-coffee hover:border-caramel/50'
            }`}
          >
            {CART_UI.largeMode[lang]}
            <span className="ml-3">RU / 简体中文</span>
          </button>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
                {CART_UI.total[lang]}
              </p>
              <p className="mt-1 font-display text-4xl text-espresso">
                {total.toFixed(2)}{' '}
                <span className="text-xs tracking-[0.2em] text-coffee/60">BYN</span>
              </p>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-[9px] uppercase tracking-[0.24em] text-coffee/60 transition-colors hover:text-clay"
              >
                {CART_UI.clear[lang]}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
