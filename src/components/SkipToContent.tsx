/**
 * Skip to Content Link
 * Позволяет пользователям клавиатуры быстро перейти к основному контенту
 */

export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:w-full focus:z-[100] focus:px-4 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:text-center focus:font-bold focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/20"
    >
      Перейти к основному содержанию
    </a>
  );
};
