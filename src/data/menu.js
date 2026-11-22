const tr = (ru, en, cn) => ({ ru, en, cn })

// Девять главных хитов — витрина с реальными фото
export const HITS = [
  {
    code: 'M01',
    image: '/images/m01.webp',
    name: tr('Виноградный чай с мякотью', 'Grape Pulp Tea', '多肉葡萄'),
    desc: tr(
      'виноград, смузи на льду, чайное желе',
      'grape, iced smoothie, tea jelly',
      '葡萄、冰沙、茶冻',
    ),
    prices: [16.5, 20.25],
  },
  {
    code: 'M02',
    image: '/images/m02.webp',
    name: tr('Клубника Жасмин', 'Strawberry Jasmine', '草莓茉莉'),
    desc: tr(
      'жасминовый чай, мякоть клубники, чиз-шапка, рисовые шарики',
      'jasmine tea, strawberry pulp, cheese foam, mochi',
      '茉莉花茶、草莓果肉、芝士奶盖、麻薯',
    ),
    prices: [19.9, 24.3],
  },
  {
    code: 'M03',
    image: '/images/m03.webp',
    name: tr('Браун Шугар Бабл Ти', 'Brown Sugar Boba', '黑糖珍珠鲜奶'),
    desc: tr(
      'молоко, сливки, жжёный сахар, карамельная тапиока, сырная пенка',
      'milk, cream, brown sugar, caramel tapioca, cheese foam',
      '鲜牛乳、奶油、黑糖、焦糖珍珠、芝士奶盖',
    ),
    prices: [17.9, 21.6],
  },
  {
    code: 'M04',
    image: '/images/m04.webp',
    name: tr('Король-апельсин', 'King Orange Tea', '霸气橙子'),
    desc: tr(
      'жасминовый чай, апельсиновый сок, дольки апельсина и лимона',
      'jasmine tea, orange juice, orange & lemon slices',
      '茉莉花茶、鲜橙汁、橙子与柠檬片',
    ),
    prices: [15.5, 18.9],
  },
  {
    code: 'M05',
    image: '/images/m05.webp',
    name: tr('Матча с сырной пенкой', 'Cheese Foam Matcha', '芝士抹茶'),
    desc: tr(
      'японская матча, молоко, сливки, солоноватая сырная пенка',
      'Japanese matcha, milk, cream, salty cheese foam',
      '日本抹茶、牛奶、奶油、咸芝士奶盖',
    ),
    prices: [18.9, 22.95],
  },
  {
    code: 'M06',
    image: '/images/m06.webp',
    name: tr('Персиковый Улун', 'Peach Oolong Latte', '白桃乌龙'),
    desc: tr(
      'персиковый улун, молоко, лёгкие сливки',
      'peach oolong, milk, light cream',
      '白桃乌龙、牛奶、轻奶油',
    ),
    prices: [9.9, 12.15],
  },
  {
    code: 'M07',
    image: '/images/m07.webp',
    name: tr('Классический Бабл Ти', 'Classic Bubble Tea', '经典波波奶茶'),
    desc: tr(
      'чёрный молочный чай, сливочная основа, ручная тапиока',
      'black milk tea, creamy base, handmade tapioca',
      '黑奶茶、奶油基底、手工珍珠',
    ),
    prices: [14.5, 17.55],
  },
  {
    code: 'M08',
    image: '/images/m08.webp',
    name: tr('Чай с дроблёным лимоном', 'Smashed Lemon Tea', '手打柠檬茶'),
    desc: tr(
      'зелёный чай, свежий дроблёный лимон, тростниковый сироп',
      'green tea, fresh smashed lemon, cane syrup',
      '绿茶、鲜柠檬、甘蔗糖浆',
    ),
    prices: [7.9, 9.45],
  },
  {
    code: 'M09',
    image: '/images/m09.webp',
    name: tr('Черничное счастье', 'Blueberry Bliss', '蓝莓之恋'),
    desc: tr(
      'голубика, черничный смузи, молочная пена',
      'blueberry, blueberry smoothie, milk foam',
      '蓝莓、蓝莓冰沙、奶盖',
    ),
    prices: [12, 15],
  },
]

// Остальной ассортимент — раскрывается по кнопке
export const MORE_SECTIONS = [
  {
    title: tr('Фирменные чаи и новинки', 'Signature Teas & Newcomers', '招牌茶与新品'),
    items: [
      {
        code: 'A39',
        name: tr('Голубое манго', 'Blue Mango', '蓝色芒果'),
        desc: tr('манго, бабочка горошек, кокос', 'mango, butterfly pea, coconut', '芒果、蝶豆花、椰乳'),
        prices: [15, 17],
      },
      {
        code: 'A40',
        name: tr('Черничка в клубничных облаках', 'Blueberry Strawberry Clouds', '蓝莓草莓云朵'),
        desc: tr('черника, клубничная пена, молоко', 'blueberry, strawberry foam, milk', '蓝莓、草莓奶盖、牛奶'),
        prices: [15, 17],
      },
      {
        code: 'A41',
        name: tr('Клубнично-персиковый фраппе', 'Strawberry Peach Frappé', '草莓蜜桃冰沙'),
        desc: tr('клубника, персик, лёд, сливки', 'strawberry, peach, ice, cream', '草莓、蜜桃、冰块、奶油'),
        prices: [17],
      },
      {
        code: 'A42',
        name: tr('Малиновая матча и фисташка', 'Raspberry Matcha Pistachio', '树莓抹茶开心果'),
        desc: tr('матча, малина, фисташка', 'matcha, raspberry, pistachio', '抹茶、树莓、开心果'),
        prices: [17, 20],
      },
      {
        code: 'M10',
        name: tr('Молоко с фисташкой и жасмином', 'Pistachio Jasmine Milk', '开心果茉莉奶'),
        desc: tr(
          'жасминовый чай, молоко, фисташковая паста и фисташковый чиз',
          'jasmine tea, milk, pistachio paste & cheese',
          '茉莉花茶、牛奶、开心果酱与芝士',
        ),
        prices: [16.9, 20.25],
      },
      {
        code: 'A44',
        name: tr('Юдзу Матовое Облако', 'Yuzu Matte Cloud', '柚子磨砂云朵'),
        desc: tr('юдзу, матча, молочная пена', 'yuzu, matcha, milk foam', '柚子、抹茶、奶盖'),
        prices: [15],
      },
      {
        code: 'A46',
        name: tr('Черешневый поцелуй', 'Cherry Kiss', '樱桃之吻'),
        desc: tr('черешня, зелёный чай, лёд', 'cherry, green tea, ice', '樱桃、绿茶、冰块'),
        prices: [12, 15],
      },
    ],
  },
  {
    title: tr('Авторский кофе · 400 мл', 'Craft Coffee · 400 ml', '特调咖啡 · 400 毫升'),
    items: [
      {
        code: 'B01',
        name: tr('Карамельный макиато', 'Caramel Macchiato', '焦糖玛奇朵'),
        desc: tr('эспрессо, молоко, карамель', 'espresso, milk, caramel', '浓缩咖啡、牛奶、焦糖'),
        prices: [10.5],
      },
      {
        code: 'B02',
        name: tr('Кокосовый латте', 'Coconut Latte', '生椰拿铁'),
        desc: tr('эспрессо, кокосовое молоко', 'espresso, coconut milk', '浓缩咖啡、椰乳'),
        prices: [11],
      },
      {
        code: 'B03',
        name: tr('Флэт Уайт', 'Flat White', '澳白'),
        desc: tr('двойной эспрессо, микропена', 'double espresso, microfoam', '双份浓缩、微泡奶'),
        prices: [8.5],
      },
      {
        code: 'B04',
        name: tr('Медовый раф', 'Honey Raf', '蜂蜜拿铁'),
        desc: tr('эспрессо, сливки, мёд', 'espresso, cream, honey', '浓缩咖啡、奶油、蜂蜜'),
        prices: [11.5],
      },
      {
        code: 'B05',
        name: tr('Матча эспрессо-тоник', 'Matcha Espresso Tonic', '抹茶浓缩气泡'),
        desc: tr('матча, эспрессо, тоник', 'matcha, espresso, tonic', '抹茶、浓缩咖啡、汤力水'),
        prices: [12],
      },
      {
        code: 'B06',
        name: tr('Персиковый колд-брю', 'Peach Cold Brew', '蜜桃冷萃'),
        desc: tr('колд-брю, персик, лёд', 'cold brew, peach, ice', '冷萃咖啡、桃子、冰块'),
        prices: [11],
      },
      {
        code: 'B07',
        name: tr('Цитрусовый бамбл', 'Citrus Bumble', '柑橘气泡咖啡'),
        desc: tr('эспрессо, апельсин, тоник', 'espresso, orange, tonic', '浓缩咖啡、橙子、汤力水'),
        prices: [11.5],
      },
      {
        code: 'B08',
        name: tr('Сливочный американо', 'Creamy Americano', '奶油美式'),
        desc: tr('эспрессо, сливочная пенка', 'espresso, creamy foam', '浓缩咖啡、奶油泡沫'),
        prices: [7.5],
      },
    ],
  },
  {
    title: tr('Десерты и Моти', 'Desserts & Mochi', '手作甜点与麻薯'),
    items: [
      {
        code: 'D01',
        name: tr('Моти Манго-Маракуйя', 'Mango Passion Mochi', '芒果百香果麻薯'),
        desc: tr('манго, маракуйя, рисовое тесто', 'mango, passion fruit, rice dough', '芒果、百香果、糯米皮'),
        prices: [7.5],
      },
      {
        code: 'D02',
        name: tr('Моти Клубника-Сливки', 'Strawberry Cream Mochi', '草莓奶油麻薯'),
        desc: tr('клубника, сливки, рисовое тесто', 'strawberry, cream, rice dough', '草莓、奶油、糯米皮'),
        prices: [7.5],
      },
      {
        code: 'D03',
        name: tr('Моти Матча-Шоколад', 'Matcha Chocolate Mochi', '抹茶巧克力麻薯'),
        desc: tr('матча, тёмный шоколад, рисовое тесто', 'matcha, dark chocolate, rice dough', '抹茶、黑巧克力、糯米皮'),
        prices: [7.5],
      },
      {
        code: 'D04',
        name: tr('Сливочный круассан', 'Butter Croissant', '黄油可颂'),
        desc: tr('слоёное тесто, сливочное масло', 'laminated dough, butter', '酥皮、黄油'),
        prices: [6.9],
      },
      {
        code: 'D05',
        name: tr('Японский хлопковый чизкейк', 'Japanese Cotton Cheesecake', '日式轻乳酪蛋糕'),
        desc: tr('сливочный сыр, яйца, лёгкая текстура', 'cream cheese, eggs, airy texture', '奶油芝士、鸡蛋、轻盈口感'),
        prices: [9.5],
      },
    ],
  },
]

export const MENU_UI = {
  subtitle: tr(
    'Happy Puppy · Минск · с 2019 года',
    'Happy Puppy · Minsk · since 2019',
    'Happy Puppy · 明斯克 · 始于 2019',
  ),
  intro: tr(
    'Каждый напиток собран вручную — от чайного листа до последней жемчужины тапиоки.',
    'Every drink is crafted by hand — from the tea leaf to the last tapioca pearl.',
    '每一杯饮品都手工制作——从茶叶到最后一颗珍珠。',
  ),
  showMore: tr('Показать ещё напитки ↓', 'Show more drinks ↓', '查看更多饮品 ↓'),
  showLess: tr('Свернуть меню ↑', 'Show less ↑', '收起菜单 ↑'),
  ml: tr('мл', 'ml', '毫升'),
  volume: tr('Объём', 'Volume', '容量'),
  ice: tr('Лёд', 'Ice', '冰量'),
  sweetness: tr('Сладость', 'Sweetness', '甜度'),
  add: tr('В корзину', 'Add to order', '加入订单'),
  close: tr('Закрыть', 'Close', '关闭'),
  iceOptions: [
    tr('Без льда', 'No ice', '无冰'),
    tr('Мало', 'Light', '少冰'),
    tr('Стандарт', 'Regular', '标准冰'),
  ],
  sweetOptions: [tr('0%', '0%', '0%'), tr('50%', '50%', '50%'), tr('100%', '100%', '100%')],
  added: tr('Добавлено в заказ', 'Added to your order', '已加入订单'),
}
