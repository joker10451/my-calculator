/** Sticky bottom CTA bar for mobile optimization. */
import { Link } from "react-router-dom";
import { Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyBottomBarProps {}

const stickyClass = "sticky top-[calc(var(--header-height))] transition-all duration-300 ease-in-out z-50 md:hidden";

export function StickyBottomBar() {
  return (
    <div className={`fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background to-transparent border-t border-border/50 shadow-2xl ${stickyClass}`}>
      <div className="container mx-auto flex items-center justify-between max-w-[90%]">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
              Сэкономьте прямо сейчас!
            </span>
            <span className="font-bold text-lg">{`🔥 Промокоды дня 🔥`}</span>
            <p className="text-sm text-muted-foreground -mt-1">
              Самые горячие скидки ждут вас на странице промокодов.
            </p>
          </div>
        </div>
        <Link to="/promocodes" onClick={() => {}}> 
          <Button variant="default" size="sm" className="gap-2 flex items-center px-4 py-2">
            Смотреть промокоды
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default StickyBottomBar;