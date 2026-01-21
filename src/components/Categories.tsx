import { categories } from "@/lib/data";
import { HoverEffect } from "./ui/card-hover-effect";

const Categories = () => {
  // Calculate total number of calculators
  const totalCalculators = categories.reduce((acc, cat) => acc + cat.calculators.length, 0);

  // Transform categories for HoverEffect
  const hoverItems = categories.map((category) => ({
    title: category.name,
    description: category.description,
    link: category.href,
    icon: category.icon,
    // Extract base colors from the data.ts string (e.g., "bg-finance/10 text-finance")
    color: category.color.split(' ').find(c => c.startsWith('text-')),
    bgColor: category.color.split(' ').find(c => c.startsWith('bg-')),
    extra: (
      <div className="flex flex-wrap gap-2">
        {category.calculators.slice(0, 3).map((calc) => (
          <span
            key={calc.name}
            className="px-2 py-1 text-[10px] font-medium bg-muted text-muted-foreground rounded-md whitespace-nowrap"
          >
            {calc.name}
          </span>
        ))}
      </div>
    ),
  }));

  return (
    <section id="categories" className="py-16 md:py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">
            Выбери категорию
          </h2>
          <p className="text-lg text-muted-foreground">
            {totalCalculators} качественных калькуляторов для жизни в России и СНГ
          </p>
        </div>

        <HoverEffect items={hoverItems} />
      </div>
    </section>
  );
};

export default Categories;
