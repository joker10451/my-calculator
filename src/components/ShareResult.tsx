import { useState } from 'react';
import { Share2, Copy, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareResultProps {
  title: string;
  text: string;
  url?: string;
}

/**
 * Компонент шеринга результатов расчёта
 * Поддерживает: Web Share API, копирование, Telegram, VK
 */
export function ShareResult({ title, text, url }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const fullText = `${title}\n${text}`;

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: fullText, url: shareUrl });
    } catch {
      // Пользователь отменил
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${fullText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const handleTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(fullText)}`;
    window.open(tgUrl, '_blank', 'noopener');
  };

  const handleVK = () => {
    const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&comment=${encodeURIComponent(text)}`;
    window.open(vkUrl, '_blank', 'noopener');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {canShare && (
        <Button size="sm" variant="outline" onClick={handleNativeShare} className="gap-1.5 rounded-xl text-xs">
          <Share2 className="w-3.5 h-3.5" />
          Поделиться
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={handleTelegram} className="gap-1.5 rounded-xl text-xs">
        <MessageCircle className="w-3.5 h-3.5" />
        Telegram
      </Button>
      <Button size="sm" variant="outline" onClick={handleVK} className="gap-1.5 rounded-xl text-xs">
        VK
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCopy} className="gap-1.5 rounded-xl text-xs">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Скопировано' : 'Копировать'}
      </Button>
    </div>
  );
}
