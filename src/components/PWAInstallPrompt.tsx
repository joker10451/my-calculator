import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const promptEvent = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(promptEvent);
      // Show after 20 seconds on 3rd visit
      const visitCount = parseInt(localStorage.getItem('pwa_visit_count') || '0', 10);
      const isDismissed = localStorage.getItem('pwa_install_dismissed');
      
      if (!isDismissed) {
        if (visitCount >= 2) {
          setTimeout(() => setShowPrompt(true), 20000);
        } else {
          localStorage.setItem('pwa_visit_count', (visitCount + 1).toString());
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Установить Считай.RU</h3>
            <p className="text-slate-500 text-sm mb-4">
              Добавьте приложение на главный экран для быстрого доступа к калькуляторам
            </p>
            <button
              onClick={handleInstall}
              className="w-full h-11 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm"
            >
              Установить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
