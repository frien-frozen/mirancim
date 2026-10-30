"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/auth";
import { Sun, Moon, Loader2, Eye, EyeOff } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const { t, locale, setLocale, theme, toggleTheme } = useApp();
  const [showPassword, setShowPassword] = useState(false);

  const isTr = locale === "tr";

  return (
    <div className="flex min-h-screen bg-background font-sans overflow-x-hidden selection:bg-[#ff5c16]/20 selection:text-[#ff5c16]">
      {/* LEFT COLUMN: Clean Authentication Panel */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Top Bar: Language & Theme Switcher (NO logo in top left, as requested) */}
        <div className="flex items-center justify-end w-full">
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setLocale("uz")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  locale === "uz"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                O&apos;Z
              </button>
              <button
                type="button"
                onClick={() => setLocale("tr")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  locale === "tr"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                TR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? t.common.themeLight : t.common.themeDark}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400 stroke-[1.75]" />
              ) : (
                <Moon className="h-4 w-4 text-zinc-700 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        {/* Center: Login Form */}
        <div className="flex-1 flex flex-col justify-center max-w-[380px] w-full mx-auto py-8">
          {/* Header */}
          <div className="mb-8 space-y-2">
            <h1 className="text-[30px] sm:text-[34px] font-bold tracking-tight text-foreground font-sans leading-tight">
              {isTr ? "Mirancim'e hoş geldiniz" : "Mirancim'ga xush kelibsiz"}
            </h1>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              {isTr
                ? "Hesabınıza erişmek için e-posta ve şifrenizi girin."
                : "Tizimga kirish uchun login va parolingizni kiriting."}
            </p>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-500 font-medium animate-in fade-in-50">
                {state.error}
              </div>
            )}

            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-semibold text-foreground/80 block"
              >
                {isTr ? "E-posta veya Kullanıcı Adı" : "Email yoki foydalanuvchi nomi"}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                maxLength={50}
                spellCheck={false}
                autoComplete="username"
                className="w-full h-11 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 shadow-2xs"
                placeholder={isTr ? "admin veya ornek@mirancim.com" : "admin yoki ism@mirancim.uz"}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-foreground/80 block"
              >
                {t.login.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  maxLength={128}
                  autoComplete="current-password"
                  className="w-full h-11 rounded-xl border border-border bg-card px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 shadow-2xs"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 stroke-[1.75]" />
                  ) : (
                    <Eye className="h-4 w-4 stroke-[1.75]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs base44-btn disabled:opacity-50 mt-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin stroke-[2]" />}
              <span>{isTr ? "Giriş Yap" : "Tizimga kirish"}</span>
            </button>
          </form>
        </div>

        {/* Footer: centralized developed by baxtiyorov.uz with line equal in length to text */}
        <div className="pt-6 flex flex-col items-center justify-center">
          <div className="inline-flex flex-col items-center">
            <div className="w-full h-px bg-border/60 mb-3" />
            <p className="text-xs text-muted-foreground text-center">
              developed by{" "}
              <a
                href="https://baxtiyorov.uz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-semibold hover:text-[#ff5c16] transition-colors underline underline-offset-4 decoration-border/60 hover:decoration-[#ff5c16]"
              >
                baxtiyorov.uz
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Minimalist Ambient Canvas with Centralized Mirancim */}
      <div className="hidden lg:flex flex-1 p-4 lg:p-6 xl:p-8">
        <div className="relative w-full h-full rounded-[32px] overflow-hidden border border-border/70 bg-zinc-100/50 dark:bg-zinc-950/60 flex items-center justify-center shadow-2xs backdrop-blur-xs">
          {/* Big, soft, less intense orange ambient glow */}
          <div className="pointer-events-none absolute h-[560px] w-[560px] xl:h-[720px] xl:w-[720px] rounded-full bg-[#ff5c16]/[0.07] dark:bg-[#ff5c16]/[0.055] blur-[150px] xl:blur-[190px] transform-gpu" />

          {/* Centralized Mirancim in the display serif font */}
          <div className="relative z-10 text-center select-none">
            <h2 className="text-[52px] xl:text-[68px] font-normal tracking-tight text-foreground base44-headline">
              Mirancim
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
