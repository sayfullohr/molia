import { prisma } from '../config/prisma';

export async function seedDefaults(): Promise<void> {
  // 1. Seed Achievements
  const achievements = [
    {
      code: 'FIRST_TRANSACTION',
      name: 'Birinchi Tranzaksiya',
      description: 'Birinchi xarajat yoki daromadni muvaffaqiyatli qayd etdingiz.',
      icon: '🏆',
      requirement: 'Kamida 1 ta tranzaksiya qo‘shish',
      xpReward: 50,
    },
    {
      code: 'STREAK_7',
      name: '7 Kunlik Streak',
      description: 'Platformada 7 kun ketma-ket faol bo‘ldingiz.',
      icon: '🔥',
      requirement: '7 kunlik faollik zanjirini hosil qilish',
      xpReward: 100,
    },
    {
      code: 'FIRST_GAME_WIN',
      name: 'Birinchi G‘alaba',
      description: 'Platformadagi o‘yinlardan birida ilk g‘alabani qo‘lga kiritdingiz.',
      icon: '🎮',
      requirement: 'O‘yinda kamida 1 marta g‘olib bo‘lish',
      xpReward: 75,
    },
    {
      code: 'SAVER',
      name: 'Tejamkor Ustoz',
      description: 'Oylik byudjetdan oshmasdan xarajatlarni boshqardingiz.',
      icon: '💰',
      requirement: 'Oylik byudjet limitiga rioya qilish',
      xpReward: 150,
    },
    {
      code: 'FIRST_FRIEND',
      name: 'Ijtimoiy Do‘st',
      description: 'Platformada birinchi do‘stingizni qo‘shdingiz.',
      icon: '👥',
      requirement: '1 ta do‘st orttirish',
      xpReward: 50,
    },
    {
      code: 'LEVEL_5',
      name: 'Tajribali Foydalanuvchi',
      description: '5-darajaga (Level 5) ko‘tarildingiz.',
      icon: '⭐',
      requirement: 'Level 5 ga erishish',
      xpReward: 200,
    },
    {
      code: 'QUIZ_MASTER',
      name: 'Zukko Bilimdon',
      description: 'Quiz intellektual o‘yinida g‘olib chiqdingiz.',
      icon: '🧠',
      requirement: 'Quiz bellashuvida g‘alaba qozonish',
      xpReward: 80,
    },
  ];

  for (const ach of achievements) {
    const existing = await prisma.achievement.findUnique({
      where: { code: ach.code },
    });
    if (!existing) {
      await prisma.achievement.create({ data: ach });
    }
  }

  // 2. Default System Categories (userId = null)
  const defaultCategories = [
    { name: 'Oziq-ovqat', icon: '🍔', type: 'EXPENSE' },
    { name: 'Transport', icon: '🚕', type: 'EXPENSE' },
    { name: 'Xaridlar', icon: '🛒', type: 'EXPENSE' },
    { name: 'Uy va kommunal', icon: '🏠', type: 'EXPENSE' },
    { name: 'Telefon va internet', icon: '📱', type: 'EXPENSE' },
    { name: 'Ko‘ngilochar', icon: '🎮', type: 'EXPENSE' },
    { name: 'Ta’lim', icon: '📚', type: 'EXPENSE' },
    { name: 'Sog‘liq', icon: '💊', type: 'EXPENSE' },
    { name: 'Kiyim', icon: '👕', type: 'EXPENSE' },
    { name: 'To‘lovlar', icon: '💳', type: 'EXPENSE' },
    { name: 'Qarz', icon: '🤝', type: 'EXPENSE' },
    { name: 'Boshqa', icon: '📦', type: 'EXPENSE' },
    { name: 'Oylik maosh', icon: '💵', type: 'INCOME' },
    { name: 'Qo‘shimcha daromad', icon: '📈', type: 'INCOME' },
    { name: 'Sovg‘a / Mukofot', icon: '🎁', type: 'INCOME' },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          type: cat.type,
          userId: null,
        },
      });
    }
  }

  console.log('[Seed]: Standart yutuqlar va kategoriyalar muvaffaqiyatli yuklandi.');
}

if (require.main === module) {
  seedDefaults()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
