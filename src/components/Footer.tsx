import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const links = [
    { name: "Ипотека", href: "/calculator/mortgage" },
    { name: "Зарплата", href: "/calculator/salary" },
    { name: "Кредит", href: "/calculator/credit" },
    { name: "Вклады", href: "/calculator/deposit" },
    { name: "Госпошлина", href: "/calculator/court-fee" },
    { name: "ОСАГО", href: "/calculator/osago" },
    { name: "ИМТ", href: "/calculator/bmi" },
    { name: "Все калькуляторы", href: "/all" },
  ];

  const pages = [
    { name: "Блог", href: "/blog" },
    { name: "Банки", href: "/banks" },
    { name: "Мои финансы", href: "/my-finances" },
    { name: "О проекте", href: "/about" },
    { name: "Контакты", href: "/contacts" },
    { name: "Конфиденциальность", href: "/privacy" },
  ];

  return (
    <footer className="border-t border-border bg-muted/30" aria-label="Подвал сайта">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Бренд */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Calculator className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Считай.RU</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Бесплатные финансовые калькуляторы с актуальными данными 2026 года. Без регистрации.
            </p>
            <a
              href="mailto:joker104_97@mail.ru"
              className="inline-block mt-4 text-sm text-primary hover:underline"
            >
              joker104_97@mail.ru
            </a>
          </div>

          {/* Калькуляторы */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Калькуляторы</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {links.map(item => (
                <li key={item.name}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Страницы */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Информация</h3>
            <ul className="space-y-2">
              {pages.map(item => (
                <li key={item.name}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2026 Считай.RU
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Информация справочного характера</span>
            <span className="hidden sm:inline">·</span>
            <a href="https://www.consultant.ru/document/cons_doc_LAW_19671/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">НК РФ</a>
            <span className="hidden sm:inline">·</span>
            <a href="https://cbr.ru/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">ЦБ РФ</a>
            <span className="hidden sm:inline">·</span>
            <a href="https://sfr.gov.ru/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">СФР</a>
          </div>
        </div>
      </div>

      {/* SEO-ссылки для ботов */}
      <nav className="sr-only" aria-label="Все калькуляторы">
        <ul>
          <li><a href="/calculator/mortgage/">Ипотечный калькулятор</a></li>
          <li><a href="/calculator/salary/">Калькулятор зарплаты</a></li>
          <li><a href="/calculator/credit/">Кредитный калькулятор</a></li>
          <li><a href="/calculator/bmi/">Калькулятор ИМТ</a></li>
          <li><a href="/calculator/fuel/">Калькулятор топлива</a></li>
          <li><a href="/calculator/utilities/">Калькулятор ЖКХ</a></li>
          <li><a href="/calculator/deposit/">Депозитный калькулятор</a></li>
          <li><a href="/calculator/currency/">Конвертер валют</a></li>
          <li><a href="/calculator/court-fee/">Калькулятор госпошлины</a></li>
          <li><a href="/calculator/alimony/">Калькулятор алиментов</a></li>
          <li><a href="/calculator/maternity-capital/">Материнский капитал</a></li>
          <li><a href="/calculator/compound-interest/">Сложный процент</a></li>
          <li><a href="/calculator/rent-vs-buy/">Аренда или покупка</a></li>
          <li><a href="/calculator/budget/">Бюджет 50/30/20</a></li>
          <li><a href="/blog/">Блог</a></li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
