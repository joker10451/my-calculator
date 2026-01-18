import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import PopularCalculators from "@/components/PopularCalculators";
import BlogSection from "@/components/blog/BlogSection";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('home.seo.title')}</title>
        <meta
          name="description"
          content={t('home.seo.description')}
        />
        <meta name="keywords" content={t('home.seo.keywords')} />
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
