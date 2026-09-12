import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import SplashScreen from '@/components/splash/SplashScreen';
import { initTheme } from '@/lib/theme';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/layout/AppLayout';
import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import History from '@/pages/History';
import WindDown from '@/pages/WindDown';
import WindDownActivities from '@/pages/WindDownActivities';
import Settings from '@/pages/Settings';
import Privacy from '@/pages/Privacy';
import Support from '@/pages/Support';
import Subscribe from '@/pages/Subscribe';
import ThankYou from '@/pages/ThankYou';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/support" element={<Support />} />
      <Route path="/ThankYou" element={<ThankYou />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/winddown" element={<WindDown />} />
          <Route path="/winddown/customize" element={<WindDownActivities />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/subscribe" element={<Subscribe />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initTheme();
    const splashTimer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  // Trava de zoom no WKWebView. O iOS dá zoom automático ao focar um <input> com
  // fonte < 16px e não volta sozinho — no nativo o app "abre com zoom". O
  // index.html já tem maximum-scale=1, mas o zip do Base44 sobrescreve o
  // index.html a cada sync, então reforçamos a meta viewport em runtime e
  // bloqueamos os gestos de pinça/duplo-toque.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const vp = document.querySelector('meta[name="viewport"]');
    if (vp) {
      vp.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
      );
    }

    const stopGestureZoom = (e) => e.preventDefault();
    document.addEventListener('gesturestart', stopGestureZoom);
    document.addEventListener('gesturechange', stopGestureZoom);

    let lastTouch = 0;
    const stopDoubleTapZoom = (e) => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    };
    document.addEventListener('touchend', stopDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', stopGestureZoom);
      document.removeEventListener('gesturechange', stopGestureZoom);
      document.removeEventListener('touchend', stopDoubleTapZoom);
    };
  }, []);

  // Captura o retorno do login social (Google/Apple): o browser externo devolve
  // o controle ao app via com.base6a654dcc789406839dc9b542.app://auth-callback?access_token=...
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapacitorApp.addListener('appUrlOpen', async (data) => {
      if (data?.url && data.url.includes('access_token=')) {
        try {
          const urlObj = new URL(data.url);
          const token = urlObj.searchParams.get('access_token');
          if (token) {
            localStorage.setItem('base44_access_token', token);
            localStorage.setItem('token', token);
            await Browser.close();
            window.location.href = '/';
          }
        } catch (err) {
          console.error('[Capacitor DeepLink Error]', err);
        }
      }
    });

    return () => {
      listener.then((h) => h.remove());
    };
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {showSplash && <SplashScreen />}
        </AnimatePresence>
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <AuthenticatedApp />
          </ErrorBoundary>
        <Toaster />
        </Router>
        </MotionConfig>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App