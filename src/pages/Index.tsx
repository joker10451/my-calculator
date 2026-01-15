import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import PopularCalculators from "@/components/PopularCalculators";
import BlogSection from "@/components/blog/BlogSection";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Считай.RU — Онлайн калькуляторы для России и СНГ</title>
        <meta 
          name="description" 
          content="Бесплатные онлайн калькуляторы: ипотека, кредит, зарплата, ЖКХ, налоги, здоровье. Точные расчёты по актуальным данным РФ за 10 секунд." 
        />
        <meta name="keywords" content="калькулятор онлайн, ипотека калькулятор, расчёт кредита, зарплата на руки, ЖКХ калькулятор" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <Categories />
          <PopularCalculators />
          <BlogSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
