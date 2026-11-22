// Единый фирменный фон внутренних страниц: водяной знак щенка,
// мягкие пастельные пятна и тонкая журнальная сетка.
function PageBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Водяной знак в правом нижнем углу */}
      <img
        src="/images/logo.png"
        alt=""
        className="absolute -bottom-16 -right-14 h-[450px] w-[450px] -rotate-12 object-contain opacity-[0.05]"
      />

      {/* Размытые световые пятна по диагонали */}
      <div className="absolute -left-24 top-1/4 h-[440px] w-[440px] rounded-full bg-[#F7DDD0] opacity-40 blur-3xl" />
      <div className="absolute -top-28 right-1/4 h-[420px] w-[420px] rounded-full bg-[#E8D9F8] opacity-40 blur-3xl" />

      {/*Едва заметная вертикальная сетка из трёх направляющих */}
      <div className="absolute inset-0 mx-auto flex h-full w-full max-w-6xl justify-between px-6 md:px-10">
        <span className="h-full w-px border-l border-[#2B1E17]/[0.04]" />
        <span className="h-full w-px border-l border-[#2B1E17]/[0.04]" />
        <span className="h-full w-px border-l border-[#2B1E17]/[0.04]" />
      </div>
    </div>
  )
}

export default PageBackdrop
