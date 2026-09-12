import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { Capacitor } from '@capacitor/core';

const { appId, token, functionsVersion } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: 'https://hydrobalanceapp.base44.app',
  appBaseUrl: 'https://hydrobalanceapp.base44.app',
  requiresAuth: false
});

// O SDK do Base44 sempre navega a WebView inteira pra fora do app no logout
// (`window.location.href = "${appBaseUrl}/api/apps/auth/logout?..."`), inclusive em
// chamadas internas do próprio SDK (ex: um 401 num login por senha errada dispara
// `this.logout()` sozinho, por dentro do módulo — nenhum patch feito nas telas
// intercepta isso). Sobrescrever aqui, uma vez, cobre TODOS os pontos de entrada,
// inclusive os que a gente nem sabe que existem.
if (Capacitor.isNativePlatform()) {
  base44.auth.logout = () => {
    try {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
    } catch (e) {
      console.error('[base44Client] falha ao limpar localStorage no logout', e);
    }
    window.location.href = '/login';
  };
}
