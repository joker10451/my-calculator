import { useEffect, useState } from "react";
import { Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PushNotificationPrompt() {
  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null); // null: не запрашивали, true: да, false: нет

  useEffect(() => {
    // 1. Проверка на поддержку API
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.warn("Push notifications are not supported by this browser.");
      return;
    }
    setIsSupported(true);

    // 2. Проверка статуса разрешения (простейший способ, может быть неточен)
    if (Notification.permission === "granted") {
        setPermissionGranted(true);
    } else if (Notification.permission === "denied") {
        setPermissionGranted(false);
    }
  }, []);


  const requestPermission = async () => {
    if (!isSupported) return;
        
    try {
      const permissionStatus = await Notification.requestPermission();
      if (permissionStatus === 'granted') {
        console.log('Push notification permission granted.');
        setPermissionGranted(true);
        // Здесь нужно инициировать подписку на VAPID ключ в вашем бэкенде/Service Worker
        const serviceWorker = await navigator.serviceWorker.ready;
        // Пример: 发送后台消息给后端，注册推送服务 worker
        window.dispatchEvent(new CustomEvent('push_subscription_request', { detail: window.clientToken }));

      } else if (permissionStatus === 'denied') {
        setPermissionGranted(false);
      } else { // default/default state
        console.log('User dismissed permission request.');
        // Если пользователь просто закрыл диалог, сохраняем состояние "не запрошено" или дефолтное значение
         setPermissionGranted(null); 
      }
    } catch (e) {
      console.error("Error requesting push notification permission:", e);
    }
  };

  if (!isSupported) {
    return null; // Не отображать, если браузер не поддерживает
  }

  const renderButton = () => {
    // Логика: показать кнопку только если разрешение НЕ_ЗАПРОШОВАНО или запросили и получили отказ.
    if (permissionGranted === true) return <span className="text-green-600">✅ Одобрено</span>;
    if (permissionGranted === false) return <span className="text-red-600">❌ Отказано</span>;
    return (
        <Button 
            onClick={requestPermission} 
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
            🍪 Подписаться на промо-уведомления
        </Button>
    );
  };

  return (
    <div className={`p-6 rounded-xl border ${permissionGranted === false ? 'border-red-300 bg-red-50/50' : permissionGranted === true ? 'border-green-300 bg-green-50/50' : 'border-primary/30 bg-indigo-50/50'} max-w-md`}>
        <div className="flex items-center gap-3 mb-3">
            <Zap className={`w-6 h-6 ${permissionGranted === true ? 'text-green-600' : 'text-primary'}`} />
            <h3 className="text-xl font-bold text-foreground">Узнавай о скидках первым</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Разрешите браузеру отправлять уведомления, и мы пришлем вам код, как только появится крупная акция или промокод!
        </p>

        {renderButton()}
    </div>
  );
}
export default PushNotificationPrompt;