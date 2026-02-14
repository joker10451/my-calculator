import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data";
import { Calculator, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 bg-muted/30">
        <div className="container px-4 text-center">
          <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
            <span className="text-4xl font-bold">404</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Страница не найдена
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-12">
            Возможно, она была удалена или перенесена. Но у нас есть много других полезных калькуляторов!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg">
              <Link to="/">
                Вернуться на главную
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/#categories">
                Выбрать калькулятор
              </Link>
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8">Популярные разделы</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.href}
                  className="bg-card p-6 rounded-xl border hover:border-primary/30 transition-all text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${cat.color}`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
