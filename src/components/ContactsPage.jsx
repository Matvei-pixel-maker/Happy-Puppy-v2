import Header from './Header'
import PageBackdrop from './PageBackdrop'

const tr = (ru, en, cn) => ({ ru, en, cn })

const CONTENT = {
  eyebrow: tr('давайте общаться', 'let’s talk', '联系我们'),
  title: tr('На связи', 'Get in touch', '保持联系'),
  lead: tr(
    'Напишите нам — ответим на вопросы о напитках, заказе или открытках из «Китайской почты».',
    'Write to us — we will answer questions about drinks, orders or our Chinese Post postcards.',
    '给我们留言——我们会回答关于饮品、订单或“中国邮政”明信片的问题。',
  ),
  address: tr('Адрес', 'Address', '地址'),
  addressValue: tr('Минск, ул. Янки Купалы, 19', 'Minsk, 19 Yanka Kupala St.', '明斯克，扬卡·库帕拉街19号'),
  hours: tr('Часы работы', 'Hours', '营业时间'),
  hoursValue: tr('Ежедневно • 11:00 – 22:00', 'Daily • 11:00 – 22:00', '每天 • 11:00 – 22:00'),
  social: tr('Соцсети', 'Social', '社交平台'),
  phone: tr('Телефон', 'Phone', '电话'),
}

const CHANNELS = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Telegram', href: 'https://t.me/' },
]

function ContactsPage({ lang, onChangeLang, onClose, onOpenMenu }) {
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

        <main className="relative z-10 mx-auto max-w-4xl px-6 pb-32 pt-44 md:px-10 md:pt-56">
          <img
            src="/images/logo.png"
            alt="Happy Puppy"
            className="h-16 w-16 object-contain transition-transform duration-500 hover:-rotate-12"
          />
          <p className="mt-5 text-[9px] uppercase tracking-[0.45em] text-coffee/60">
            {CONTENT.eyebrow[lang]}
          </p>
          <h1 className="mt-4 font-display text-6xl leading-none tracking-[-0.03em] md:text-8xl">
            {CONTENT.title[lang]}
          </h1>
          <p className="mt-5 max-w-lg font-display text-xl leading-relaxed text-coffee md:text-2xl">
            {CONTENT.lead[lang]}
          </p>

          <div className="mt-14 grid gap-x-12 gap-y-8 border-t border-[#E6D8C5] pt-10 md:grid-cols-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
                {CONTENT.address[lang]}
              </p>
              <p className="mt-2 font-display text-2xl text-espresso">
                {CONTENT.addressValue[lang]}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
                {CONTENT.hours[lang]}
              </p>
              <p className="mt-2 font-display text-2xl text-espresso">
                {CONTENT.hoursValue[lang]}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
                {CONTENT.social[lang]}
              </p>
              <div className="mt-2 flex flex-wrap gap-5">
                {CHANNELS.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-2xl text-espresso transition-colors hover:text-caramel"
                  >
                    {channel.label} →
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-coffee/60">
                {CONTENT.phone[lang]}
              </p>
              <a
                href="tel:+375333587421"
                className="mt-2 block font-display text-2xl text-espresso transition-colors hover:text-caramel"
              >
                +375 33 358-74-21
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ContactsPage
