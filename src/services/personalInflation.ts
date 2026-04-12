export interface CPICategory {
  id: string;
  name: string;
  emoji: string;
  weight: number;
  rateYoY: number;
  description: string;
}

export const CPI_CATEGORIES: CPICategory[] = [
  { id: 'food', name: 'Продукты питания', emoji: '🥖', weight: 35, rateYoY: 10.2, description: 'Хлеб, молоко, мясо, овощи, фрукты' },
  { id: 'housing', name: 'ЖКХ и жильё', emoji: '🏠', weight: 20, rateYoY: 8.5, description: 'Квартплата, электричество, газ, вода' },
  { id: 'transport', name: 'Транспорт', emoji: '🚗', weight: 12, rateYoY: 7.8, description: 'Бензин, проезд, такси, ТО' },
  { id: 'clothing', name: 'Одежда и обувь', emoji: '👕', weight: 8, rateYoY: 6.2, description: 'Верхняя одежда, обувь, бельё' },
  { id: 'health', name: 'Здоровье', emoji: '💊', weight: 7, rateYoY: 9.1, description: 'Лекарства, врачи, страховка' },
  { id: 'education', name: 'Образование', emoji: '📚', weight: 5, rateYoY: 6.8, description: 'Курсы, репетиторы, книги' },
  { id: 'entertainment', name: 'Развлечения', emoji: '🎬', weight: 5, rateYoY: 5.5, description: 'Кино, подписки, кафе, отдых' },
  { id: 'other', name: 'Прочее', emoji: '📦', weight: 8, rateYoY: 7.0, description: 'Связь, бытовая химия, товары дома' },
];

export function calculatePersonalInflation(weights: Record<string, number>): number {
  let totalRate = 0;
  let totalWeight = 0;

  for (const cat of CPI_CATEGORIES) {
    const w = weights[cat.id] ?? cat.weight;
    totalRate += w * cat.rateYoY;
    totalWeight += w;
  }

  return totalWeight > 0 ? Math.round((totalRate / totalWeight) * 100) / 100 : 8.2;
}

export function getDefaultWeights(): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const cat of CPI_CATEGORIES) {
    weights[cat.id] = cat.weight;
  }
  return weights;
}
