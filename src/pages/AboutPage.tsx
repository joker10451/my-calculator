import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calculator, Shield, Zap, Users, Award, TrendingUp, BookOpen, Scale } from "lucide-react";

const AboutPage = () => {
  const stats = [
    { value: "20+", label: "калькуляторов", icon: Calculator },
    { value: "50K+", label: "расчётов в месяц", icon: TrendingUp },
    { value: "30+", label: "статей в блоге", icon: BookOpen },
    { value: "2026", label: "актуальные данные", icon: Award },
  ];

  const principles = [
    {
      icon: Shield,
      title: "Точность и актуальность",
      description: "Все формулы проходят двойную проверку на соответствие Налоговому кодексу РФ, Гражданскому кодексу РФ и актуальным ставкам Центробанка. Мы обновляем данные при каждом изменении законодательства."
    },
    {
      icon: Zap,
      title: "Мгновенный результат",
      description: "Никакой регистрации, никаких SMS. Введите данные — получите точный расчёт за 10 секунд. Все вычисления происходят прямо в вашем браузере."
    },
    {
      icon: Users,
      title: "Конфиденциальность",
      description: "Мы не собираем и не храним ваши персональные данные. Расчёты выполняются локально на вашем устройстве и не передаются на сервер."
    },
    {
      icon: Scale,
      title: "Независимость",
      description: "Наши калькуляторы дают объективный результат. Мы не привязаны к конкретному банку или страховой компании — показываем реальные цифры."
    },
  ];

  const sources = [
    { name: "Налоговый кодекс РФ", url: "https://www.consultant.ru/document/cons_doc_LAW_19671/" },
    { name: "Центральный банк РФ", url: "https://cbr.ru/" },
    { name: "Федеральная служба статистики", url: "https://rosstat.gov.ru/" },
    { name: "Пенсионный фонд РФ (СФР)", url: "https://sfr.gov.ru/" },
    { name: "Министерство труда", url: "https://mintrud.gov.ru/" },
  ];

  const team = [
    {
      name: "Дмитрий Козлов",
      role: "Эксперт по ипотеке и недвижимости",
      bio: "Сертифицированный аналитик рынка недвижимости с 10-летним стажем. Специализируется на ипотечных программах.",
      avatar: "/authors/dmitry-kozlov.png"
    },
    {
      name: "Елена Иванова",
      role: "Специалист по ЖКХ и льготам",
      bio: "15 лет опыта в сфере жилищно-коммунального хозяйства. Автор методических пособий по оптимизации расходов.",
      avatar: "/authors/elena-ivanova.png"
    },
    {
      name: "Александр Смирнов",
      role: "Финансовый аналитик",
      bio: "Эксперт в области налогообложения и личных финансов. Помогает разобраться в тонкостях законодательства.",
      avatar: "/authors/alexander-smirnov.png"
    },
    {
      name: "Анна Петрова",
      role: "Юрист по семейному праву",
      bio: "Практикующий адвокат, специалист в области семейного и гражданского права.",
      avatar: "/authors/anna-petrova.png"
    },
  ];

  return (
    <>
      <Helmet>
        <title>О проекте Считай.RU — бесплатные калькуляторы для России</title>
        <meta name="description" content="Считай.RU — бесплатный сервис онлайн-калькуляторов для России и СНГ. 20+ калькуляторов по ипотеке, налогам, ЖКХ, здоровью. Точные расчёты по актуальным данным 2026 года." />
        <link rel="canonical" href="https://schitay-online.ru/about/" />
        <meta property="og:title" content="О проекте Считай.RU — бесплатные калькуляторы" />
        <meta property="og:description" content="Бесплатный сервис онлайн-калькуляторов для России. Точные расчёты по актуальным данным." />
        <meta property="og:url" content="https://schitay-online.ru/about/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://schitay-online.ru/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="О проекте Считай.RU — бесплатные калькуляторы для России" />
        <meta name="twitter:description" content="Бесплатный сервис онлайн-калькуляторов для России. Точные расчёты по актуальным данным." />
        <meta name="twitter:image" content="https://schitay-online.ru/og-image.png" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main>
          {/* Hero */}
          <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium border rounded-full bg-primary/10 border-primary/20 text-primary">
                <Calculator className="w-4 h-4" />
                <span>О проекте</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
                Считай.RU — ваш финансовый
                <span className="text-primary"> помощник</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Современная платформа бесплатных онлайн-калькуляторов, созданная специально для жителей России и СНГ.
                Мы верим, что сложные финансовые формулы должны быть доступны каждому в один клик.
              </p>
            </div>
          </section>

          {/* Статистика */}
          <section className="py-12 border-y bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Наша миссия */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Наша миссия</h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12 text-lg">
                Помогать людям принимать взвешенные финансовые решения на основе точных расчётов
                и актуального законодательства.
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {principles.map((p, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 border hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <p.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Команда экспертов */}
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Наши эксперты</h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
                Статьи и методики проверяются квалифицированными специалистами в каждой области.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {team.map((member, i) => (
                  <div key={i} className="bg-card rounded-xl p-5 border text-center hover:shadow-lg transition-all">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-primary">${member.name.split(' ').map(n => n[0]).join('')}</span>`;
                        }}
                      />
                    </div>
                    <h3 className="font-semibold mb-1">{member.name}</h3>
                    <p className="text-xs text-primary font-medium mb-2">{member.role}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Источники данных */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Источники данных</h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
                Все расчёты основаны на официальных источниках и актуальном законодательстве.
              </p>

              <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-card border rounded-lg text-sm hover:border-primary/30 hover:text-primary transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {src.name}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Методология */}
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Как мы обеспечиваем точность</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Анализ законодательства</h3>
                    <p className="text-sm text-muted-foreground">Изучаем актуальные нормативные акты, ставки ЦБ РФ, прожиточный минимум и региональные коэффициенты.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Разработка алгоритмов</h3>
                    <p className="text-sm text-muted-foreground">Переводим формулы из НК РФ и ГК РФ в программный код с учётом граничных случаев и округлений.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Тестирование</h3>
                    <p className="text-sm text-muted-foreground">Автоматические и ручные тесты с контрольными примерами из официальных источников и реальных банковских расчётов.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Экспертная проверка</h3>
                    <p className="text-sm text-muted-foreground">Каждый калькулятор проходит ревью профильного специалиста перед публикацией.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Дисклеймер */}
          <section className="py-8 border-t">
            <div className="container mx-auto px-4 max-w-3xl">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Информация на сайте Считай.RU носит справочный характер и не является публичной офертой.
                Результаты расчётов предоставлены в ознакомительных целях. Для принятия важных финансовых
                решений рекомендуем обращаться к квалифицированным специалистам.
                Сайт не является финансовой организацией и не оказывает финансовых услуг.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
