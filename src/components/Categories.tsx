import { Link } from "react-router-dom";
import { categories } from "@/lib/data";

const Categories = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Выбери категорию
          </h2>
          <p className="text-lg text-muted-foreground">
            5 качественных калькуляторов для жизни в России и СНГ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.href}
              className="category-card group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${category.color} transition-colors`}>
                  <category.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.calculators.slice(0, 3).map((calc) => (
                      <span
                        key={calc.name}
                        className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md"
                      >
                        {calc.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
