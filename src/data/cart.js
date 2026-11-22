const tr = (ru, en, cn) => ({ ru, en, cn })

export const CART_UI = {
  myOrder: tr('Мой заказ', 'My Order', '我的点单'),
  showToBarista: tr(
    'Покажите экран бариста',
    'Show to Barista',
    '请向店员出示',
  ),
  empty: tr(
    'Пока здесь пусто — добавьте напиток из меню.',
    'Nothing here yet — add a drink from the menu.',
    '这里还是空的——从菜单添加饮品吧。',
  ),
  clear: tr('Очистить заказ', 'Clear order', '清空点单'),
  largeMode: tr(
    'Крупный режим для кассы',
    'Large mode for the counter',
    '收银台大字模式',
  ),
  addToOrder: tr('Добавить в заказ', 'Add to Order', '加入清单'),
  added: tr('Добавлено в заказ', 'Added to order', '已加入清单'),
  addToMyOrder: tr('+ В мой заказ', '+ Add to Order', '+ 加入点单'),
  total: tr('Итого', 'Total', '合计'),
  close: tr('Закрыть', 'Close', '关闭'),
  ice: tr('Лёд', 'Ice', '冰量'),
  sweet: tr('Сладость', 'Sweetness', '甜度'),
}
