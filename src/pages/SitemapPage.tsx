import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categories } from "@/lib/data";

const SitemapPage = () => {
  const calculators = categories.flatMap(cat => 
    cat.calculators.map(calc => ({
      ...calc,
      category: cat.name
    }))
  );

  const pages = [
    { name: "Главная", href: "/" },
    { name: "Все калькуляторы", href: "/all" },
    { name: "Блог", href: "/blog" },
    { name: "О проекте", href: "/about" },
    { name: "Контакты", href: "/contacts" },
    { name: "Политика конфиденциальности", href: "/privacy" },
    { name: "Условия использования", href: "/terms" },
  ];

  return (
    <>
      <Helmet>
        <title>Карта сайта — Все калькуляторы | Считай.RU</title>
        <meta name="description" content="Полный список всех калькуляторов и страниц сайта Считай.RU. Ипотека, кредит, зарплата, налоги, ЖКХ и другие." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://schitay-online.ru/sitemap" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8 pt-24">
          <h1 className="text-3xl font-bold mb-8 text-center">Карта сайта</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Страницы */}
            <Card>
              <CardHeader>
                <CardTitle>Основные страницы</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pages.map(page => (
                    <li key={page.href}>
                      <Link 
                        to={page.href}
                        className="text-primary hover:underline"
                      >
                        {page.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Калькуляторы по категориям */}
            {categories.map(category => (
              <Card key={category.slug}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.calculators.map(calc => (
                      <li key={calc.href}>
                        <Link 
                          to={calc.href}
                          className="text-primary hover:underline"
                        >
                          {calc.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SEO текст */}
          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Все калькуляторы онлайн</h2>
            <p className="text-muted-foreground mb-4">
              На сайте Считай.RU представлены бесплатные онлайн-калькуляторы для различных сфер жизни:
              финансовые расчеты (ипотека, кредит, зарплата, налоги), бытовые расчеты (ЖКХ, топливо, калории) 
              и юридические расчеты (госпошлина, алименты).
            </p>
            <p className="text-muted-foreground">
              Все калькуляторы работают на основе актуальных данных 2026 года и используют официальные формулы расчета.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SitemapPage;
