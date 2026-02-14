/**
 * Компонент переключения темы (светлая/темная)
 * Requirements: 12.1, 12.5, 12.6
 */

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Переключить тему</span>
      </Button>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 relative overflow-hidden"
          aria-label="Переключить тему"
        >
          <AnimatePresence mode="wait" initial={false}>
            {currentTheme === "dark" ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Переключить тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Светлая</span>
          {theme === "light" && (
            <motion.div
              layoutId="theme-indicator"
              className="ml-auto w-2 h-2 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Темная</span>
          {theme === "dark" && (
            <motion.div
              layoutId="theme-indicator"
              className="ml-auto w-2 h-2 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Системная</span>
          {theme === "system" && (
            <motion.div
              layoutId="theme-indicator"
              className="ml-auto w-2 h-2 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
