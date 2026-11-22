// Векторные «фотографии» напитков для витрины меню. Никаких изображений —
// всё рисуется SVG с уникальными градиентами на код позиции.
const VISUALS = {
  M01: { color: '#A78BFA', accent: '#DDD0FF', straw: '#B39DDB', foam: true, ice: true, pearls: true },
  M02: { color: '#F48FB1', accent: '#FFE0EC', straw: '#F8BBD0', foam: true, ice: true, pearls: true },
  M03: { color: '#D9B99A', accent: '#F7EFE2', straw: '#C9A88B', foam: true, ice: false, pearls: true, caramel: true },
  M04: { color: '#FBB03B', accent: '#FFE9C7', straw: '#FFB74D', foam: false, ice: true, pearls: false, lemon: true },
  M05: { color: '#9DC183', accent: '#E6F4DC', straw: '#AED581', foam: true, ice: false, pearls: false },
  M06: { color: '#F6B8C8', accent: '#FFF0F5', straw: '#F48FB1', foam: false, ice: true, pearls: false },
  M07: { color: '#9C7C6B', accent: '#DCC9B8', straw: '#8D6E63', foam: false, ice: false, pearls: true },
  M08: { color: '#F7DA73', accent: '#FFF8D8', straw: '#FBBF24', foam: false, ice: true, pearls: false, lemon: true },
  M09: { color: '#B7D5A3', accent: '#EDF6E6', straw: '#AED581', foam: true, ice: false, pearls: false },
  B01: { color: '#C68C5A', accent: '#F5E6D3', straw: null, foam: true, ice: false, pearls: false, coffee: true },
  B02: { color: '#E4D5C0', accent: '#FFFCF6', straw: null, foam: true, ice: false, pearls: false, coffee: true },
  B03: { color: '#C9A27E', accent: '#FFF8EE', straw: null, foam: true, ice: false, pearls: false, coffee: true },
  B04: { color: '#D9A566', accent: '#FFF3E0', straw: null, foam: true, ice: false, pearls: false, coffee: true },
  B05: { color: '#9DC183', accent: '#E8F5E9', straw: '#A5D6A7', foam: true, ice: true, pearls: false, coffee: true },
  B06: { color: '#C98A6B', accent: '#FFE0B2', straw: '#D7A58C', foam: false, ice: true, pearls: false, coffee: true },
  B07: { color: '#D99A5B', accent: '#FFE8CC', straw: '#E0A96D', foam: false, ice: true, pearls: false, coffee: true, lemon: true },
  B08: { color: '#8D6E63', accent: '#D7CCC8', straw: null, foam: true, ice: false, pearls: false, coffee: true },
}

const DESSERTS = {
  D01: { cake: '#F6C36B', filling: '#FF8FB1', dust: '#FFF4E2' },
  D02: { cake: '#F7D9DD', filling: '#FFF0F3', dust: '#FFFFFF' },
  D03: { cake: '#A8C68C', filling: '#5D4037', dust: '#E8F5DC' },
  D04: { cake: '#DCA96B', filling: '#F3D2A0', dust: '#FFF6E8' },
  D05: { cake: '#F7EFE2', filling: '#FFFDF8', dust: '#FFFFFF' },
}

function CupArt({ code, v }) {
  const uid = `p-${code}`
  const body = 'M50 80 L60 222 Q61 232 71 232 L129 232 Q139 232 140 222 L150 80 Z'
  const clip = `${uid}-clip`

  return (
    <svg viewBox="0 0 200 260" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-liquid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={v.accent} />
          <stop offset="55%" stopColor={v.color} />
          <stop offset="100%" stopColor={v.color} />
        </linearGradient>
        <linearGradient id={`${uid}-cup`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".62" />
          <stop offset="18%" stopColor="#FFFFFF" stopOpacity=".18" />
          <stop offset="80%" stopColor="#FFFFFF" stopOpacity=".10" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity=".5" />
        </linearGradient>
        <radialGradient id={`${uid}-shadow`}>
          <stop offset="0%" stopColor="#6E584C" stopOpacity=".28" />
          <stop offset="100%" stopColor="#6E584C" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
      </defs>

      {/* мягкая контактная тень */}
      <ellipse cx="100" cy="244" rx="56" ry="9" fill={`url(#${uid}-shadow)`} />

      {/* трубочка */}
      {v.straw && (
        <g transform="rotate(9 108 54)">
          <rect x="103" y="16" width="10" height="74" rx="5" fill={v.straw} opacity=".95" />
          <rect x="105" y="20" width="3" height="66" rx="1.5" fill="#FFFFFF" opacity=".35" />
        </g>
      )}

      {/* крышка */}
      <ellipse cx="100" cy="74" rx="57" ry="11" fill="#FFFDF8" opacity=".95" />
      <path d="M47 72 Q100 84 153 72 L150 80 Q100 90 50 80 Z" fill="#F3E7D8" opacity=".9" />
      <ellipse cx="100" cy="71" rx="48" ry="7" fill="#FFFFFF" opacity=".8" />

      {/* стенка стакана */}
      <path d={body} fill={`url(#${uid}-cup)`} stroke="#E6D8C5" strokeWidth="1.4" />

      <g clipPath={`url(#${clip})`}>
        {/* молочная база */}
        <rect x="45" y="150" width="110" height="90" fill="#FFFDF7" opacity={v.coffee ? '.75' : '.45'} />
        {/* основной напиток */}
        <rect x="45" y="92" width="110" height="146" fill={`url(#${uid}-liquid)`} opacity={v.coffee ? '.92' : '.88'} />

        {/* карамельные подтёки */}
        {v.caramel && (
          <g fill="#6B3E26" opacity=".62">
            <path d="M60 94 Q64 150 58 206 L64 206 Q70 150 66 94 Z" />
            <path d="M124 94 Q132 160 126 214 L133 214 Q139 156 130 94 Z" />
            <path d="M92 96 Q96 140 92 176 L97 176 Q101 138 98 96 Z" opacity=".7" />
          </g>
        )}

        {/* кофейный эспрессо-слой */}
        {v.coffee && (
          <rect x="45" y="96" width="110" height="30" fill="#6F4E37" opacity=".55" />
        )}

        {/* кубики льда */}
        {v.ice && (
          <g fill="#FFFFFF" opacity=".42" stroke="#FFFFFF" strokeOpacity=".6">
            <rect x="66" y="112" width="24" height="24" rx="4" transform="rotate(-14 78 124)" />
            <rect x="104" y="126" width="22" height="22" rx="4" transform="rotate(18 115 137)" />
            <rect x="78" y="152" width="20" height="20" rx="4" transform="rotate(8 88 162)" />
          </g>
        )}

        {/* долька лимона */}
        {v.lemon && (
          <g transform="translate(124 120)">
            <circle r="14" fill="#FDE68A" opacity=".9" />
            <circle r="10" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity=".8" />
            <path d="M0 -9 L0 9 M-9 0 L9 0 M-6 -6 L6 6 M-6 6 L6 -6" stroke="#FFFFFF" strokeWidth=".9" opacity=".7" />
          </g>
        )}

        {/* сырная пенка */}
        {v.foam && (
          <path
            d="M45 104 Q58 92 72 101 Q88 90 103 100 Q120 91 134 101 Q145 95 155 104 L155 82 L45 82 Z"
            fill="#FFFDF7"
            opacity=".96"
          />
        )}

        {/* жемчужины тапиоки */}
        {v.pearls && (
          <g fill="#3B2314">
            {[
              [68, 214], [88, 220], [108, 214], [128, 220],
              [78, 204], [98, 208], [118, 204], [60, 226], [140, 226],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="6.4" opacity=".94" />
            ))}
            <g fill="#FFFFFF" opacity=".18">
              <circle cx="66" cy="211" r="2" /><circle cx="106" cy="211" r="2" />
            </g>
          </g>
        )}
      </g>

      {/* блик на стенке */}
      <path d="M58 92 L66 214" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity=".35" />
      <path d="M138 96 L134 200" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity=".22" />
    </svg>
  )
}

function DessertArt({ code, v }) {
  const uid = `d-${code}`

  if (code === 'D04') {
    return (
      <svg viewBox="0 0 200 260" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-shadow`}>
            <stop offset="0%" stopColor="#6E584C" stopOpacity=".26" />
            <stop offset="100%" stopColor="#6E584C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="206" rx="64" ry="10" fill={`url(#${uid}-shadow)`} />
        <g transform="translate(0 14)">
          <path d="M40 178 Q46 132 78 116 Q66 140 74 150 Q96 122 128 128 Q112 142 116 152 Q144 142 162 178 Q100 198 40 178 Z" fill={v.cake} stroke="#C89B64" strokeWidth="1.2" />
          <path d="M62 170 Q70 146 92 138 M96 172 Q108 148 132 144 M128 174 Q140 158 152 166" fill="none" stroke={v.filling} strokeWidth="6" strokeLinecap="round" opacity=".8" />
          <path d="M48 176 Q100 194 154 176" fill="none" stroke={v.dust} strokeWidth="3" opacity=".7" />
        </g>
      </svg>
    )
  }

  if (code === 'D05') {
    return (
      <svg viewBox="0 0 200 260" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-shadow`}>
            <stop offset="0%" stopColor="#6E584C" stopOpacity=".24" />
            <stop offset="100%" stopColor="#6E584C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="216" rx="58" ry="10" fill={`url(#${uid}-shadow)`} />
        <g transform="translate(0 18)">
          <path d="M54 196 L64 132 L136 132 L146 196 Q100 208 54 196 Z" fill={v.cake} stroke="#E6D8C5" strokeWidth="1.2" />
          <path d="M64 150 L136 150" stroke={v.filling} strokeWidth="10" opacity=".85" />
          <path d="M62 132 Q100 120 138 132 Q100 142 62 132 Z" fill={v.filling} />
          <path d="M70 118 Q100 108 130 118 Q100 126 70 118 Z" fill="#FFFFFF" opacity=".9" />
          <circle cx="100" cy="110" r="7" fill="#F48FB1" opacity=".9" />
        </g>
      </svg>
    )
  }

  // Mochi — три аккуратных шарика с присыпкой
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-shadow`}>
          <stop offset="0%" stopColor="#6E584C" stopOpacity=".24" />
          <stop offset="100%" stopColor="#6E584C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-ball`} cx="35%" cy="28%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".85" />
          <stop offset="100%" stopColor={v.cake} />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="214" rx="64" ry="10" fill={`url(#${uid}-shadow)`} />
      {[[68, 170, 36], [130, 166, 34], [100, 196, 38]].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-ball)`} stroke="#E6D8C5" strokeWidth="1.2" />
          <ellipse cx={cx - r * 0.28} cy={cy - r * 0.38} rx={r * 0.3} ry={r * 0.18} fill="#FFFFFF" opacity=".55" />
          <circle cx={cx} cy={cy + r * 0.2} r={r * 0.42} fill={v.filling} opacity=".5" />
        </g>
      ))}
      <g fill={v.dust} opacity=".9">
        <circle cx="52" cy="150" r="2" /><circle cx="88" cy="142" r="1.6" />
        <circle cx="146" cy="146" r="2.2" /><circle cx="120" cy="136" r="1.4" />
        <circle cx="76" cy="212" r="1.8" />
      </g>
    </svg>
  )
}

export default function DrinkPreview({ code }) {
  const cup = VISUALS[code]
  if (cup) return <CupArt code={code} v={cup} />

  const dessert = DESSERTS[code]
  if (dessert) return <DessertArt code={code} v={dessert} />

  return null
}
