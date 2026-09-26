import { isFuzzyMatch } from './normalizer';

export interface CategoryRule {
  categoryName: string;
  icon: string;
  keywords: string[];
  canonicalTitle: string;
}

export const DEFAULT_RULES: CategoryRule[] = [
  {
    categoryName: 'Oziq-ovqat',
    icon: '🍔',
    canonicalTitle: 'Oziq-ovqat',
    keywords: [
      'burger', 'buger', 'barger', 'burgerr', 'lavash', 'doner', 'shaurma',
      'somsa', 'non', 'osh', 'palov', 'lagmon', 'manti', 'shashlik', 'kabob',
      'pizza', 'pitsa', 'hotdog', 'kola', 'fanta', 'choy', 'kofe', 'qahva',
      'tushlik', 'kechki', 'nonushta', 'ovqat', 'restoran', 'kafe', 'choyxona',
      'go‘sht', 'gosht', 'shirinlik', 'muzqaymoq', 'suv', 'ichimlik'
    ],
  },
  {
    categoryName: 'Transport',
    icon: '🚕',
    canonicalTitle: 'Transport',
    keywords: [
      'taksi', 'taxi', 'taksiga', 'yandex', 'indriver', 'avtobus', 'metro',
      'benzin', 'yoqilgi', 'gaz', 'metan', 'propan', 'zapravka', 'moy',
      'mashina', 'remont', 'avto', 'moyka', 'poyezd', 'samolyot', 'bilet'
    ],
  },
  {
    categoryName: 'Xaridlar',
    icon: '🛒',
    canonicalTitle: 'Xaridlar',
    keywords: [
      'bozor', 'supermarket', 'korzinka', 'makro', 'havas', 'savdo',
      'xarid', 'magazin', 'dokon', 'bozordan', 'shopping', 'paket'
    ],
  },
  {
    categoryName: 'Uy',
    icon: '🏠',
    canonicalTitle: 'Uy va kommunal',
    keywords: [
      'ijara', 'arenda', 'kvartira', 'svet', 'elektr', 'gaz', 'suv',
      'kommunal', 'musor', 'chiqindi', 'remont', 'uyga', 'mebel'
    ],
  },
  {
    categoryName: 'Telefon va internet',
    icon: '📱',
    canonicalTitle: 'Telefon va aloqa',
    keywords: [
      'telefon', 'tel', 'telefonim', 'aloqa', 'internet', 'wifi', 'tarif',
      'megabayt', 'ucell', 'beeline', 'mobiuz', 'uztelecom', 'paynet', 'payme'
    ],
  },
  {
    categoryName: 'Ko‘ngilochar',
    icon: '🎮',
    canonicalTitle: 'Ko‘ngilochar',
    keywords: [
      'kino', 'film', 'teatr', 'konsert', 'playstation', 'ps5', 'gamepad',
      'oyun', 'o‘yin', 'park', 'attraksion', 'dam', 'bouling', 'bilyard'
    ],
  },
  {
    categoryName: 'Ta’lim',
    icon: '📚',
    canonicalTitle: 'Ta’lim va kitoblar',
    keywords: [
      'kurs', 'kitob', 'repetitor', 'maktab', 'universitet', 'kontrakt',
      'oqish', 'o‘qish', 'darslik', 'daftar', 'qalam', 'ruchka', 'trening'
    ],
  },
  {
    categoryName: 'Sog‘liq',
    icon: '💊',
    canonicalTitle: 'Sog‘liq va dorixona',
    keywords: [
      'dorixona', 'apteka', 'dori', 'shifokor', 'doktor', 'vrach', 'klinika',
      'kasalxona', 'analiz', 'stomatolog', 'tish', 'tabletka', 'vitamin'
    ],
  },
  {
    categoryName: 'Kiyim',
    icon: '👕',
    canonicalTitle: 'Kiyim va poyabzal',
    keywords: [
      'shim', 'koylak', 'ko‘ylak', 'oyoqkiyim', 'tufli', 'krossovka', 'kurtka',
      'futbolka', 'paypoq', 'kostyum', 'kiyim', 'bosh kiyim', 'sumka'
    ],
  },
  {
    categoryName: 'To‘lovlar',
    icon: '💳',
    canonicalTitle: 'To‘lovlar va soliq',
    keywords: [
      'kredit', 'soliq', 'jarima', 'poshlina', 'notarius', 'straxovka', 'sugurta'
    ],
  },
  {
    categoryName: 'Qarz',
    icon: '🤝',
    canonicalTitle: 'Berilgan qarz',
    keywords: [
      'qarz', 'qarzga', 'berdim', 'dostimga', 'do‘stimga', 'ogaynimga', 'qaytarish'
    ],
  },
  {
    categoryName: 'Boshqa',
    icon: '📦',
    canonicalTitle: 'Boshqa xarajat',
    keywords: ['boshqa', 'har xil', 'turli'],
  },
];

export function matchCategoryAndTitle(tokens: string[]): {
  categoryName: string;
  icon: string;
  detectedTitle: string;
} {
  // First attempt exact or fuzzy keyword search
  for (const token of tokens) {
    for (const rule of DEFAULT_RULES) {
      for (const kw of rule.keywords) {
        if (token === kw || isFuzzyMatch(token, kw, kw.length > 5 ? 2 : 1)) {
          // Capitalize token as title
          const title = kw.charAt(0).toUpperCase() + kw.slice(1);
          return {
            categoryName: rule.categoryName,
            icon: rule.icon,
            detectedTitle: title,
          };
        }
      }
    }
  }

  // Fallback to "Boshqa"
  const title = tokens.length > 0 ? tokens[0].charAt(0).toUpperCase() + tokens[0].slice(1) : 'Xarajat';
  return {
    categoryName: 'Boshqa',
    icon: '📦',
    detectedTitle: title,
  };
}
