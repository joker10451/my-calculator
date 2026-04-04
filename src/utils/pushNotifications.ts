/**
 * Push-уведомления об изменении ставок
 * Запрашивает разрешение и подписывает пользователя на уведомления
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

let pushSubscription: PushSubscription | null = null;

/**
 * Запросить разрешение на push-уведомления
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Push notifications not supported');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Подписаться на push-уведомления
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      pushSubscription = existingSubscription;
      return existingSubscription;
    }

    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) return null;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    pushSubscription = subscription;
    return subscription;
  } catch {
    return null;
  }
}

/**
 * Отписаться от push-уведомлений
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!pushSubscription) return false;

  try {
    const success = await pushSubscription.unsubscribe();
    if (success) pushSubscription = null;
    return success;
  } catch {
    return false;
  }
}

/**
 * Проверить статус подписки
 */
export async function getPushStatus(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}> {
  const supported = 'Notification' in window && 'PushManager' in window;
  const permission = 'Notification' in window ? Notification.permission : 'denied';
  let subscribed = false;

  if (supported && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      subscribed = !!existing;
    } catch {
      // ignore
    }
  }

  return { supported, permission, subscribed };
}

/**
 * Показать локальное уведомление о изменении ставки
 */
export function showRateChangeNotification(bankName: string, oldRate: number, newRate: number): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    const direction = newRate < oldRate ? '↓' : '↑';
    const diff = (newRate - oldRate).toFixed(1);
    new Notification(`Ставка ${bankName} ${direction} ${diff} п.п.`, {
      body: `${bankName}: ${oldRate}% → ${newRate}%`,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `rate-${bankName}`,
      data: { url: '/compare-banks' },
    });
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
