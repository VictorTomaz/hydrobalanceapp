import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import EmailLoginForm from "@/components/auth/EmailLoginForm";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export default function Login() {
  // No nativo, o retorno do OAuth cai em /login (única rota já publicada) com
  // ?access_token= na URL. O bootstrap do app-params.js roda antes deste efeito,
  // já persiste o token no localStorage e o remove da URL — lemos do storage
  // em vez de reler a URL, para não competir com essa remoção.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const token = localStorage.getItem("base44_access_token") || localStorage.getItem("token");
    if (token) {
      window.location.href = `com.base6a654dcc789406839dc9b542.app://auth-callback?access_token=${encodeURIComponent(token)}`;
    }
  }, []);

  const socialLoginUrl = (provider) => {
    const callbackUrl = encodeURIComponent("https://hydrobalanceapp.base44.app/login");
    return `https://hydrobalanceapp.base44.app/api/apps/auth${provider === "google" ? "" : `/${provider}`}/login?app_id=6a654dcc789406839dc9b542&from_url=${callbackUrl}`;
  };

  const handleGoogle = async () => {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: socialLoginUrl("google") });
    } else {
      base44.auth.loginWithProvider("google", "/");
    }
  };

  const handleApple = async () => {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: socialLoginUrl("apple") });
    } else {
      base44.auth.loginWithProvider("apple", "/");
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to continue"
      footer={
        <p>
          New here?{" "}
          <Link to="/register" className="font-semibold text-white hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <EmailLoginForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-3 text-muted-foreground uppercase tracking-wide">
              or
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full h-12 text-sm font-medium" onClick={handleGoogle}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full h-12 text-sm font-medium" onClick={handleApple}>
            <AppleIcon className="w-5 h-5 mr-2" />
            Continue with Apple
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
