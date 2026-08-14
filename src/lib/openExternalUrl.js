import { Browser } from '@capacitor/browser';

export async function openExternalUrl(url) {
  if (!url) return;
  try {
    await Browser.open({ url });
  } catch (err) {
    console.warn('[openExternalUrl] Fallback to window.open', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
