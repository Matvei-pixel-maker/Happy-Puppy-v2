const tr = (ru, en, cn) => ({ ru, en, cn })

export const LOCATIONS = {
  eyebrow: tr('найдите нас', 'find us', '找到我们'),
  title: tr('Наш дом\nв Минске', 'Our home\nin Minsk', '我们在明斯克的家'),
  lead: tr(
    'Одна кофейня, маленькая и уютная — сюда приходят за бабл-ти, остаются за открыткой и возвращаются за щенком.',
    'One coffee house, small and cozy — people come for bubble tea, stay for a postcard and return for the puppy.',
    '一家小而温馨的咖啡馆——人们为珍珠奶茶而来，为明信片而留，为小狗狗而回。',
  ),
  logoCaption: tr(
    'Наш щенок — лицо Happy Puppy',
    'Our puppy — the face of Happy Puppy',
    '我们的小狗 —— Happy Puppy 的形象',
  ),
  photoCaption2: tr(
    'Дверь, где начинается Happy Puppy',
    'The door where Happy Puppy begins',
    'Happy Puppy 从这里开始',
  ),
  addressLabel: tr('Адрес', 'Address', '地址'),
  address: tr('ул. Янки Купалы, 19', '19 Yanka Kupala Street', '扬卡·库帕拉街19号'),
  landmark: tr('напротив Белгосцирка', 'opposite the Belarus State Circus', '白俄罗斯国家马戏团对面'),
  hoursLabel: tr('Часы работы', 'Opening hours', '营业时间'),
  hours: tr('Ежедневно • 11:00 – 22:00', 'Daily • 11:00 – 22:00', '每天 • 11:00 – 22:00'),
  metroLabel: tr('Как добраться', 'Getting here', '交通指南'),
  metro: tr(
    'м. Октябрьская / Купаловская — 3 мин пешком',
    'Oktyabrskaya / Kupala metro — 3 min walk',
    '十月站 / 库帕拉站 —— 步行3分钟',
  ),
  badges: [
    tr('Pet-friendly • Можно со щенками', 'Pet-friendly • Bring your puppy', '宠物友好 • 可带狗狗'),
    tr('Китайская почта внутри', 'Chinese Post inside', '店内有中国邮政'),
  ],
  mapLabel: tr('Мы на карте', 'Find us on the map', '我们在地图上'),
  yandex: tr('Открыть в Яндекс Картах', 'Open in Yandex Maps', '在 Yandex 地图打开'),
  google: tr('Построить маршрут в Google Maps', 'Get directions in Google Maps', '在 Google Maps 规划路线'),
}
