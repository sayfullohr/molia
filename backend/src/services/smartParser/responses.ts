export const SMART_RESPONSES: Record<string, string[]> = {
  'Oziq-ovqat': [
    '😄 Och qolibsiz shekilli. Yoqimli ishtaha!',
    '🍔 Yoqimli ishtaha! Kuch-quvvat bo‘lsin.',
    '🍲 Mazali taom — a’lo kayfiyat garovi!',
  ],
  Transport: [
    '🚕 Yo‘lingiz bexatar bo‘lsin!',
    '🚖 Manzilingizga eson-omon yetib oling!',
  ],
  'Ko‘ngilochar': [
    '🎉 Maroqli hordiq tilaymiz!',
    '🎮 Dam olish va hordiq ham juda muhim!',
  ],
  'Ta’lim': [
    '📚 Ilm va kitobga kiritilgan investitsiya — eng yaxshisi!',
    '💡 Yangi bilimlar xayrli bo‘lsin!',
  ],
  Qarz: [
    '🤝 Yaxshilik va saxovat albatta qaytadi.',
    '🤲 Do‘stlik va omonat barakali bo‘lsin.',
  ],
  Xaridlar: [
    '🛍️ Xaridlaringiz barakali bo‘lsin!',
  ],
  'Telefon va internet': [
    '📱 Aloqangiz doimo uzilmasin!',
  ],
  'Sog‘liq': [
    '💊 Salomatlik eng bebaho boylik! Shifo tilaymiz.',
  ],
};

export function getRandomSmartResponse(categoryName: string): string | null {
  // Return response only ~40% of the time to avoid being annoying
  if (Math.random() > 0.45) {
    return null;
  }

  const responses = SMART_RESPONSES[categoryName];
  if (!responses || responses.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * responses.length);
  return responses[index];
}
