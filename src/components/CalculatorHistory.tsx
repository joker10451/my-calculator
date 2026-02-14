/**
 * Компонент истории расчетов
 */

import { useState } from "react";
import { History, Trash2, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalculatorHistory, CalculationHistoryItem } from "@/hooks/useCalculatorHistory";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface CalculatorHistoryProps {
  calculatorType?: string;
  onLoadCalculation?: (item: CalculationHistoryItem) => void;
}

export function CalculatorHistory({ 
  calculatorType,
  onLoadCalculation 
}: CalculatorHistoryProps) {
  const { history, getHistoryByType, removeCalculation, clearHistory, clearHistoryByType } = useCalculatorHistory();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [open, setOpen] = useState(false);

  const displayHistory = calculatorType 
    ? getHistoryByType(calculatorType)
    : history;

  const handleRemove = (id: string) => {
    removeCalculation(id);
    toast.success("Расчет удален из истории");
  };

  const handleClearAll = () => {
    if (calculatorType) {
      clearHistoryByType(calculatorType);
      toast.success("История калькулятора очищена");
    } else {
      clearHistory();
      toast.success("Вся история очищена");
    }
    setShowClearDialog(false);
  };

  const handleLoad = (item: CalculationHistoryItem) => {
    if (onLoadCalculation) {
      onLoadCalculation(item);
      setOpen(false);
      toast.success("Расчет загружен");
    }
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "d MMMM yyyy, HH:mm", { locale: ru });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9" title="История расчетов">
            <History className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>История расчетов</SheetTitle>
            <SheetDescription>
              {calculatorType 
                ? "История расчетов для этого калькулятора"
                : "Все ваши расчеты"}
            </SheetDescription>
          </SheetHeader>

          {displayHistory.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить историю
              </Button>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-200px)] mt-4">
            {displayHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  История расчетов пуста
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ваши расчеты будут сохраняться автоматически
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayHistory.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {item.calculatorName}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemove(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-1 text-sm">
                      {Object.entries(item.results).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>

                    {onLoadCalculation && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleLoad(item)}
                      >
                        Загрузить расчет
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить историю?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Вся история расчетов будет удалена.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>
              Очистить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
