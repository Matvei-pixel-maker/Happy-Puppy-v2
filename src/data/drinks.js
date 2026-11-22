const tr = (ru, en, cn) => ({ ru, en, cn })

// Позиции идут в том же порядке, что и слайды главной сцены ( cupIndex 0..5 ).
export const DETAIL_DRINKS = [
  {
    code: 'M01',
    name: tr('Виноградный чай', 'Grape Pulp Tea', '多肉葡萄'),
    composition: tr(
      'Виноград · жасмин · чайное желе',
      'Grape · jasmine · tea jelly',
      '葡萄 · 茉莉 · 茶冻',
    ),
    description: tr(
      'Спелая мякоть винограда, ледяной смузи и нежное чайное желе. Плотный, свежий и по-настоящему фруктовый.',
      'Ripe grape pulp, an iced smoothie and delicate tea jelly. Full-bodied, fresh and truly fruit-forward.',
      '饱满葡萄果肉、冰沙与柔滑茶冻。浓郁清新，果香十足。',
    ),
    prices: [16.5, 20.25],
  },
  {
    code: 'M02',
    name: tr('Клубника Жасмин', 'Strawberry Jasmine', '草莓茉莉'),
    composition: tr(
      'Клубника · молочная шапка · моти',
      'Strawberry · milk foam · mochi',
      '草莓 · 奶盖 · 麻薯',
    ),
    description: tr(
      'Ароматный жасминовый чай с мякотью клубники под сливочной шапкой и нежными рисовыми шариками.',
      'Fragrant jasmine tea with strawberry pulp under a silky milk cap and soft rice mochi.',
      '清香茉莉茶配草莓果肉，顶部是丝滑奶盖与软糯麻薯。',
    ),
    prices: [19.9, 24.3],
  },
  {
    code: 'M03',
    name: tr('Браун Шугар Бабл Ти', 'Brown Sugar Boba', '黑糖珍珠鲜奶'),
    composition: tr(
      'Молоко · коричневый сахар · тапиока',
      'Milk · brown sugar · tapioca',
      '鲜奶 · 黑糖 · 珍珠',
    ),
    description: tr(
      'Молоко и сливки с карамельным жжёным сахаром, ручная тапиока и сырная пенка. Тёплый, глубокий сладкий вкус.',
      'Milk and cream with caramelized brown sugar, handmade tapioca and cheese foam. Warm, deep and sweet.',
      '鲜奶与奶油遇上焦香黑糖，配手工珍珠和芝士奶盖。温暖醇厚，甜而不腻。',
    ),
    prices: [17.9, 21.6],
  },
  {
    code: 'M04',
    name: tr('Король-апельсин', 'King Orange Tea', '霸气橙子'),
    composition: tr(
      'Жасминовый чай · апельсин · лимон',
      'Jasmine tea · orange · lemon',
      '茉莉茶 · 橙子 · 柠檬',
    ),
    description: tr(
      'Жасминовый чай, свежий апельсиновый сок и дольки апельсина с лимоном. Яркий и освежающий цитрус.',
      'Jasmine tea, fresh orange juice and slices of orange and lemon. A bright, refreshing citrus hit.',
      '茉莉茶配鲜榨橙汁与橙片柠檬，明亮清新的柑橘滋味。',
    ),
    prices: [15.5, 18.9],
  },
  {
    code: 'M05',
    name: tr('Матча Чиз', 'Cheese Foam Matcha', '芝士抹茶'),
    composition: tr(
      'Японская матча · сливки · сырная пена',
      'Japanese matcha · cream · cheese foam',
      '抹茶 · 奶油 · 芝士奶盖',
    ),
    description: tr(
      'Настоящая японская матча на молоке со сливками и солоноватой сырной пенкой. Землистая, сливочная, сбалансированная.',
      'Real Japanese matcha with milk, cream and a lightly salty cheese foam. Earthy, creamy and perfectly balanced.',
      '日本抹茶配牛奶、奶油与微咸芝士奶盖。茶香醇厚，绵密平衡。',
    ),
    prices: [18.9, 22.95],
  },
  {
    code: 'M06',
    name: tr('Персиковый Улун', 'Peach Oolong Latte', '白桃乌龙'),
    composition: tr(
      'Улун · персик · сливки',
      'Oolong · peach · cream',
      '乌龙 · 蜜桃 · 奶油',
    ),
    description: tr(
      'Нежный персиковый улун с молоком и лёгкими сливками. Мягкий, цветочный, с длинным персиковым послевкусием.',
      'Smooth peach oolong with milk and light cream. Soft, floral and with a long peachy finish.',
      '柔顺白桃乌龙配牛奶与轻奶油。花香细腻，回甘悠长。',
    ),
    prices: [9.9, 12.15],
  },
]

export const DETAIL_UI = {
  back: tr('← Назад', '← Back', '← 返回'),
  fullMenu: tr('Открыть полное меню →', 'Full Menu →', '查看完整菜单 →'),
  ml: tr('мл', 'ml', '毫升'),
  close: tr('Закрыть', 'Close', '关闭'),
}
