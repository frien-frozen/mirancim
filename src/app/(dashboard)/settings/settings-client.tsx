"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  KeyRound,
  Shield,
  Sun,
  Moon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsClientProps {
  session: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
}

export function SettingsClient({ session }: SettingsClientProps) {
  const { t, locale, setLocale, theme, toggleTheme } = useApp();
  const router = useRouter();

  const [name, setName] = useState(session.name);
  const [username, setUsername] = useState(session.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !username.trim()) {
      setError(t.settings.requiredFieldsError);
      return;
    }

    // Password validation if password field entered
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        setError(t.settings.currentPasswordError);
        return;
      }
      if (newPassword.length < 4) {
        setError(t.settings.passwordTooShortError);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t.settings.passwordMismatchError);
        return;
      }
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("username", username.trim());
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const res = await updateProfile(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl pb-12">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-[34px] font-normal tracking-tight text-foreground base44-headline">
          {t.settings.title}
        </h1>
        <p className="text-[14px] text-muted-foreground font-sans">
          {t.settings.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-500 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{t.settings.savedSuccess}</span>
          </div>
        )}

        {/* Section 1: Profile Information */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-start justify-between border-b border-border/80 pb-3.5">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground stroke-[1.75]" />
                <span>{t.settings.profileSectionTitle}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t.settings.profileSectionDesc}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="rounded-md border border-border bg-foreground/[0.05] text-foreground text-[11px] font-semibold px-2.5 py-1"
            >
              {session.role === "ADMIN" ? t.common.admin : t.common.teacher}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80 block">
                {t.settings.nameLabel}
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9.5 rounded-lg border-border bg-background text-xs sm:text-sm text-foreground"
                placeholder={t.settings.namePlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80 block">
                {t.settings.usernameLabel}
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-9.5 rounded-lg border-border bg-background text-xs sm:text-sm text-foreground"
                placeholder={t.settings.usernamePlaceholder}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Security & Password */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="border-b border-border/80 pb-3.5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground stroke-[1.75]" />
              <span>{t.settings.securitySectionTitle}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.settings.securitySectionDesc}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1 italic">
              ({t.settings.passwordSub})
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Current Password */}
            <div className="space-y-1.5 max-w-md">
              <Label className="text-xs font-semibold text-foreground/80 block">
                {t.settings.currentPasswordLabel}
              </Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9.5 rounded-lg border-border bg-background pr-10 text-xs sm:text-sm text-foreground"
                  placeholder={t.settings.currentPasswordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 stroke-[1.75]" />
                  ) : (
                    <Eye className="h-4 w-4 stroke-[1.75]" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80 block">
                  {t.settings.newPasswordLabel}
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9.5 rounded-lg border-border bg-background pr-10 text-xs sm:text-sm text-foreground"
                    placeholder={t.settings.newPasswordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 stroke-[1.75]" />
                    ) : (
                      <Eye className="h-4 w-4 stroke-[1.75]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/80 block">
                  {t.settings.confirmPasswordLabel}
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9.5 rounded-lg border-border bg-background pr-10 text-xs sm:text-sm text-foreground"
                    placeholder={t.settings.confirmPasswordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 stroke-[1.75]" />
                    ) : (
                      <Eye className="h-4 w-4 stroke-[1.75]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Preferences / System Settings */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="border-b border-border/80 pb-3.5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground stroke-[1.75]" />
              <span>{t.settings.preferencesSectionTitle}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.settings.preferencesSectionDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Language Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80 block">
                {t.common.language}
              </Label>
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setLocale("uz")}
                  className={cn(
                    "flex-1 h-8 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5",
                    locale === "uz"
                      ? "bg-foreground text-background shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>🇺🇿 O&apos;zbekcha</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("tr")}
                  className={cn(
                    "flex-1 h-8 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5",
                    locale === "tr"
                      ? "bg-foreground text-background shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>🇹🇷 Türkçe</span>
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80 block">
                {theme === "dark" ? t.common.themeDark : t.common.themeLight}
              </Label>
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => theme === "dark" && toggleTheme()}
                  className={cn(
                    "flex-1 h-8 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2",
                    theme === "light"
                      ? "bg-foreground text-background shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-500 stroke-[1.75]" />
                  <span>{t.common.themeLight}</span>
                </button>
                <button
                  type="button"
                  onClick={() => theme === "light" && toggleTheme()}
                  className={cn(
                    "flex-1 h-8 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2",
                    theme === "dark"
                      ? "bg-foreground text-background shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="h-3.5 w-3.5 text-zinc-400 stroke-[1.75]" />
                  <span>{t.common.themeDark}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 active:scale-[0.99] transition-all base44-btn shadow-xs"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
            {t.settings.saveChanges}
          </Button>
        </div>
      </form>
    </div>
  );
}

