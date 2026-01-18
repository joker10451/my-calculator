import { useTranslation } from "react-i18next";
import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();

  const categoriesList = [
    { name: t("common.categories.finance.name"), href: "/category/finance" },
    { name: t("common.categories.salary.name"), href: "/category/salary" },
    { name: t("common.categories.housing.name"), href: "/category/housing" },
    { name: t("common.categories.auto.name"), href: "/category/auto" },
    { name: t("common.categories.health.name"), href: "/category/health" },
    { name: t("common.categories.family.name"), href: "/category/family" },
  ];

  const popular = [
    { name: t("common.popular_calculators.items.mortgage.name"), href: "/calculator/mortgage" },
    { name: t("common.popular_calculators.items.salary.name"), href: "/calculator/salary" },
    { name: t("common.popular_calculators.items.bmi.name"), href: "/calculator/bmi" },
    { name: t("common.popular_calculators.items.fuel.name"), href: "/calculator/fuel" },
    { name: t("common.popular_calculators.items.utilities.name"), href: "/calculator/utilities" },
  ];

  const legal = [
    { name: t("common.header.about"), href: "/about" },
    { name: t("common.footer.privacy"), href: "/privacy" },
    { name: t("common.footer.terms"), href: "/terms" },
    { name: t("common.footer.contact"), href: "/contacts" },
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
                {t('common.title')}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('common.description')}
            </p>
          </div>

          {/* Категории */}
          <div>
            <h4 className="font-semibold mb-4">{t('common.footer.categories')}</h4>
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
            <h4 className="font-semibold mb-4">{t('common.footer.popular')}</h4>
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
            <h4 className="font-semibold mb-4">{t('common.footer.info')}</h4>
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
            <h4 className="font-semibold mb-4">{t('common.footer.contacts')}</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('common.footer.contact_us')}</p>
                <a
                  href="mailto:joker104_97@mail.ru"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  joker104_97@mail.ru
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('common.footer.contact_hint')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            {t('common.footer.copyright')}
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground max-w-md">
            {t('common.footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
