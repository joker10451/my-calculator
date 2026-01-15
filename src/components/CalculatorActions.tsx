/**
 * Компонент с действиями для калькулятора
 * Экспорт, печать, расшаривание, избранное
 */

import { useState } from "react";
import { 
  Download, 
  Printer, 
  Share2, 
  Heart,
  FileSpreadsheet,
  FileJson,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  exportToCSV, 
  exportToExcel, 
  exportToJSON,
  printElement,
  generateShareableLink,
  copyToClipboard
} from "@/utils/exportUtils";
import { useFavorites } from "@/hooks/useFavorites";

interface CalculatorActionsProps {
  calculatorId: string;
  calculatorName: string;
  data?: Record<string, any>[];
  printElementId?: string;
  shareParams?: Record<string, any>;
  className?: string;
}

export function CalculatorActions({
  calculatorId,
  calculatorName,
  data,
  printElementId,
  shareParams,
  className = "",
}: CalculatorActionsProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isSharing, setIsSharing] = useState(false);
  const favorite = isFavorite(calculatorId);

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      toast.error("Нет данных для экспорта");
      return;
    }
    exportToCSV(data, `${calculatorName}_${Date.now()}`);
    toast.success("Экспорт в CSV выполнен");
  };

  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      toast.error("Нет данных для экспорта");
      return;
    }
    exportToExcel(data, `${calculatorName}_${Date.now()}`, calculatorName);
    toast.success("Экспорт в Excel выполнен");
  };

  const handleExportJSON = () => {
    if (!data || data.length === 0) {
      toast.error("Нет данных для экспорта");
      return;
    }
    exportToJSON(data, `${calculatorName}_${Date.now()}`);
    toast.success("Экспорт в JSON выполнен");
  };

  const handlePrint = () => {
    if (!printElementId) {
      toast.error("Печать недоступна");
      return;
    }
    printElement(printElementId, calculatorName);
  };

  const handleShare = async () => {
    if (!shareParams) {
      toast.error("Расшаривание недоступно");
      return;
    }

    setIsSharing(true);
    try {
      const shareUrl = generateShareableLink(calculatorId, shareParams);
      const success = await copyToClipboard(shareUrl);
      
      if (success) {
        toast.success("Ссылка скопирована в буфер обмена");
      } else {
        toast.error("Не удалось скопировать ссылку");
      }
    } catch (error) {
      toast.error("Ошибка при создании ссылки");
    } finally {
      setIsSharing(false);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(calculatorId);
    if (favorite) {
      toast.success("Удалено из избранного");
    } else {
      toast.success("Добавлено в избранное");
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Избранное */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleFavorite}
        className="h-9 w-9"
        title={favorite ? "Удалить из избранного" : "Добавить в избранное"}
      >
        <Heart 
          className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : ''}`} 
        />
      </Button>

      {/* Печать */}
      {printElementId && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrint}
          className="h-9 w-9"
          title="Печать"
        >
          <Printer className="h-5 w-5" />
        </Button>
      )}

      {/* Расшаривание */}
      {shareParams && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          disabled={isSharing}
          className="h-9 w-9"
          title="Поделиться"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      )}

      {/* Экспорт */}
      {data && data.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" title="Экспорт">
              <Download className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Экспорт данных</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span>Excel (.xls)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileText className="mr-2 h-4 w-4" />
              <span>CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON}>
              <FileJson className="mr-2 h-4 w-4" />
              <span>JSON</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
