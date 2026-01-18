import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { BlogPost } from '@/types/blog';
import { shareTrackingService } from '@/services/shareTrackingService';

interface BlogShareProps {
  post: BlogPost;
  shareCount?: number;
}

const BlogShare = ({ post, shareCount = 0 }: BlogShareProps) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = `${window.location.origin}/blog/${post.slug}`;
  const shareTitle = post.title;
  const shareText = post.excerpt;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Ссылка скопирована в буфер обмена');

      // Track share event
      shareTrackingService.trackShare(post.id, post.slug, 'copy_link');

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const shareToVK = () => {
    const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&description=${encodeURIComponent(shareText)}`;
    window.open(vkUrl, '_blank', 'width=600,height=400');
    shareTrackingService.trackShare(post.id, post.slug, 'vk');
    setIsOpen(false);
  };

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(telegramUrl, '_blank', 'width=600,height=400');
    shareTrackingService.trackShare(post.id, post.slug, 'telegram');
    setIsOpen(false);
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'width=600,height=400');
    shareTrackingService.trackShare(post.id, post.slug, 'whatsapp');
    setIsOpen(false);
  };

  const showShareCount = shareCount >= 10;

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Поделиться
            {showShareCount && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({shareCount})
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Поделиться статьей</DialogTitle>
            <DialogDescription>
              Выберите способ, чтобы поделиться этой статьей
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={shareToVK}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.45 14.98h-1.62c-.52 0-.68-.42-1.62-1.37-.82-.79-1.18-.89-1.39-.89-.28 0-.37.09-.37.51v1.26c0 .34-.11.54-1 .54-1.51 0-3.18-.92-4.36-2.63-1.77-2.43-2.25-4.26-2.25-4.63 0-.21.09-.4.51-.4h1.62c.38 0 .53.18.67.59.73 2.11 1.95 3.96 2.45 3.96.19 0 .28-.09.28-.57v-2.22c-.06-.97-.57-1.05-.57-1.39 0-.17.14-.34.37-.34h2.54c.32 0 .44.17.44.55v2.99c0 .32.14.44.23.44.19 0 .35-.12.7-.47 1.07-1.21 1.84-3.08 1.84-3.08.1-.21.28-.4.66-.4h1.62c.48 0 .59.25.48.59-.18.82-1.91 3.65-1.91 3.65-.16.26-.22.38 0 .68.16.22.69.68 1.05 1.09.65.75 1.15 1.38 1.28 1.81.14.43-.07.65-.5.65z" />
              </svg>
              ВКонтакте
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={shareToTelegram}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              Telegram
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={shareToWhatsApp}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              {copied ? 'Ссылка скопирована!' : 'Скопировать ссылку'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogShare;