import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import EmailRegisterForm from "@/components/auth/EmailRegisterForm";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export default function Register() {
  // O retorno do OAuth sempre cai em /login (rota já publicada), independente
  // de ter partido do Login ou do Register — o useEffect de lá cobre os dois.
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
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
    >
      <div className="space-y-6">
        <EmailRegisterForm />

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