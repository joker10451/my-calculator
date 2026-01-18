import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const categoriesList = [
    { name: "Кредиты и ипотека", href: "/category/finance" },
    { name: "Зарплата и налоги", href: "/category/salary" },
    { name: "ЖКХ и коммуналка", href: "/category/housing" },
    { name: "Авто", href: "/category/auto" },
    { name: "Здоровье", href: "/category/health" },
    { name: "Семья", href: "/category/family" },
  ];

  const popular = [
    { name: "Калькулятор ипотеки", href: "/calculator/mortgage" },
    { name: "Зарплата на руки", href: "/calculator/salary" },
    { name: "Индекс массы тела", href: "/calculator/bmi" },
    { name: "Расход топлива", href: "/calculator/fuel" },
    { name: "Расчёт ЖКХ", href: "/calculator/utilities" },
  ];

  const legal = [
    { name: "О проекте", href: "/about" },
    { name: "Политика конфиденциальности", href: "/privacy" },
    { name: "Условия использования", href: "/terms" },
    { name: "Контакты", href: "/contacts" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Бренд */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold uppercase">
                Считай.RU
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Бесплатные онлайн-калькуляторы для России и СНГ. Точные расчёты по актуальным данным.
            </p>
          </div>

          {/* Категории */}
          <div>
            <h4 className="font-semibold mb-4">Категории</h4>
            <ul className="space-y-2">
              {categoriesList.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Популярное */}
          <div>
            <h4 className="font-semibold mb-4">Популярное</h4>
            <ul className="space-y-2">
              {popular.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h4 className="font-semibold mb-4">Информация</h4>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Для связи:</p>
                <a
                  href="mailto:joker104_97@mail.ru"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  joker104_97@mail.ru
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Вопросы, предложения, сообщения об ошибках
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © 2026 Считай.ru — Все права защищены
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground max-w-md">
            Информация носит справочный характер и не является публичной офертой
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
