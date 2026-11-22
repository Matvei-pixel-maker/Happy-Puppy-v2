import { CART_UI } from '../data/cart'
import { useCart } from '../context/useCart'

export default function OrderButton({ lang }) {
  const { count, total, openDrawer } = useCart()

  if (count === 0) return null

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="fixed bottom-4 right-4 z-40 rounded-full bg-espresso px-3.5 py-2.5 text-[8px] uppercase tracking-[0.12em] text-cream shadow-[0_12px_36px_rgba(43,30,23,0.28)] transition-all duration-300 hover:bg-caramel sm:bottom-6 sm:right-6 sm:px-6 sm:py-3.5 sm:text-[10px] sm:tracking-[0.18em]"
    >
      {CART_UI.myOrder[lang]} <span className="opacity-60">•</span> {count}{' '}
      <span className="opacity-60">|</span> {total.toFixed(2)} BYN
    </button>
  )
}
