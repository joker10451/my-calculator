import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb, TrendingUp, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackYandexGoal } from "@/hooks/useYandexMetrika";

// Структура лайфхака. Источник — blogPosts, но краткая выжимка для главной.
export interface LifehackCard {
  id: string;
  category: "Экономия" | "Лайфхак" | "Промокод" | "Кэшбэк" | "Сравнение" | "Налоги";
  title: string;
  excerpt: string; // 120-180 символов
  readTime: number; // минут
  href: string; // ссылка в блог
  ctaText?: string;
  highlight?: string; // бейдж "Экономия 15 600 ₽"
}

interface LifehacksSectionProps {
  items?: LifehackCard[];
}

// Дефолтный набор — в проде подменять на актуальные посты из Supabase
const DEFAULT_ITEMS: LifehackCard[] = [
  {
    id: "tax-deduction-2026",
    category: "Налоги",
    title: "Как вернуть до 15 600 ₽ за лечение и обучение",
    excerpt:
      "Пошаговая инструкция по социальному вычету: какие документы собрать, куда подать 3-НДФЛ и в какие сроки. Срок подачи — до 30 апреля 2026.",
    readTime: 6,
    href: "/blog/kak-vernut-nalogoviy-vychet",
    ctaText: "Забрать вычет",
    highlight: "До 15 600 ₽",
  },
  {
    id: "cashback-cards-comparison",
    category: "Кэшбэк",
    title: "Топ-5 карт с кешбэком на всё в 2026",
    excerpt:
      "Сравнили 14 банков: где кешбэк выше, какие категории реально работают, и сколько можно вернуть за год при обычных тратах.",
    readTime: 8,
    href: "/blog/luchshie-karty-s-keshbekom-2026",
    ctaText: "Сравнить карты",
    highlight: "До 50 000 ₽/год",
  },
  {
    id: "utilities-subside",
    category: "Экономия",
    title: "Субсидия на ЖКХ: кому положена и как получить",
    excerpt:
      "Если коммуналка съедает больше 22% дохода семьи — вы можете платить вдвое меньше. Проверьте за 1 минуту по нашему калькулятору.",
    readTime: 5,
    href: "/blog/subsidiya-na-zhkh",
    ctaText: "Проверить право",
    highlight: "До 50% скидки",
  },
];

const CATEGORY_STYLES: Record<LifehackCard["category"], { bg: string; text: string }> = {
  Экономия: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  Лайфхак: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  Промокод: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  Кэшбэк: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
  Сравнение: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  Налоги: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
};

export function LifehacksSection({ items = DEFAULT_ITEMS }: LifehacksSectionProps) {
  if (items.length === 0) return null;

  const handleClick = (id: string, position: number) => {
    trackYandexGoal("lifehack_card_click", { lifehack_id: id, position });
  };

  return (
    <section className="section-shell bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Лайфхаки недели
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
              Сэкономь на этой неделе
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Три проверенных способа не переплачивать. Каждый — с цифрами и калькулятором.
            </p>
          </div>
          <Link to="/blog" onClick={() => trackYandexGoal("lifehacks_see_all_click")}>
            <Button variant="outline" className="gap-2 rounded-full px-6 min-h-[44px]">
              Все лайфхаки
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((card, idx) => {
            const style = CATEGORY_STYLES[card.category] ?? CATEGORY_STYLES.Лайфхак;
            return (
              <Link
                key={card.id}
                to={card.href}
                onClick={() => handleClick(card.id, idx)}
                className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 min-h-[280px]"
              >
                {/* Highlight бейдж */}
                {card.highlight && (
                  <div className="absolute -top-3 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
                    <Tag className="w-3 h-3" />
                    {card.highlight}
                  </div>
                )}

                {/* Категория */}
                <div
                  className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-md text-xs font-semibold mb-4 ${style.bg} ${style.text}`}
                >
                  <TrendingUp className="w-3 h-3" />
                  {card.category}
                </div>

                {/* Заголовок */}
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                  {card.title}
                </h3>

                {/* Описание */}
                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                  {card.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {card.readTime} мин чтения
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:gap-2 transition-all">
                    {card.ctaText ?? "Читать"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default LifehacksSection;
