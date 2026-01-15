import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Bug, Lightbulb } from "lucide-react";

const ContactsPage = () => {
  return (
    <>
      <Helmet>
        <title>Контакты — Считай.RU</title>
        <meta name="description" content="Свяжитесь с нами по вопросам работы калькуляторов, предложениям и сообщениям об ошибках. Контактная информация Считай.RU" />
        <link rel="canonical" href="https://schitay-online.ru/contacts" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Заголовок */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Контакты
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Мы всегда рады вашим вопросам, предложениям и сообщениям об ошибках. 
                Свяжитесь с нами удобным способом.
              </p>
            </div>

            {/* Контактная информация */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Основной контакт */}
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Электронная почта</h3>
                    <p className="text-muted-foreground">Основной способ связи</p>
                  </div>
                </div>
                <a 
                  href="mailto:joker104_97@mail.ru"
                  className="text-lg text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  joker104_97@mail.ru
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Отвечаем в течение 24 часов
                </p>
              </div>

              {/* Время работы */}
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Поддержка</h3>
                    <p className="text-muted-foreground">Помощь пользователям</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Мы стараемся отвечать на все обращения максимально быстро. 
                  Обычно это занимает от нескольких часов до одного дня.
                </p>
              </div>
            </div>

            {/* Типы обращений */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">
                По каким вопросам можно обращаться
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <Bug className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Сообщения об ошибках</h3>
                  <p className="text-muted-foreground text-sm">
                    Нашли ошибку в расчетах или работе сайта? Обязательно сообщите нам!
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Предложения</h3>
                  <p className="text-muted-foreground text-sm">
                    Идеи по улучшению сайта, новые калькуляторы, дополнительные функции
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Общие вопросы</h3>
                  <p className="text-muted-foreground text-sm">
                    Вопросы по использованию калькуляторов, методике расчетов
                  </p>
                </div>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">
                Считай.RU — бесплатный сервис
              </h3>
              <p className="text-muted-foreground">
                Мы создаем и поддерживаем этот сайт бесплатно для всех пользователей. 
                Ваши отзывы и предложения помогают нам становиться лучше!
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactsPage;