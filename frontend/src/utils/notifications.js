import { apiFetch } from './api';

function b64ToUint8Array(base64) {
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function ensurePushSubscription(token) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const reg = await navigator.serviceWorker.register('/sw.js');
  const { publicKey } = await apiFetch('/api/notifications/vapid-public', { token });

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: b64ToUint8Array(publicKey)
  });

  await apiFetch('/api/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify(sub),
    token
  });
}
