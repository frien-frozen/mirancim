"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckSquare,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronsUpDown,
  PanelLeft,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/app-context";

interface SidebarProps {
  userName: string;
  userRole: string;
  username?: string;
}

export function Sidebar({ userName, userRole, username = "admin" }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { t, locale, setLocale, theme, toggleTheme } = useApp();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/groups", label: t.nav.groups, icon: BookOpen },
    ...(userRole === "ADMIN"
      ? [{ href: "/students", label: t.nav.students, icon: Users }]
      : []),
    { href: "/attendance", label: t.nav.attendance, icon: CheckSquare },
    ...(userRole === "ADMIN"
      ? [{ href: "/payments", label: t.nav.payments, icon: CreditCard }]
      : []),
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top App Bar (Sleek native-feeling header for phones) */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-2xs hover:bg-foreground/[0.04] transition-colors"
          aria-label="Menyu"
        >
          <Menu className="h-4.5 w-4.5 stroke-[1.75]" />
        </button>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 select-none"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5c16] text-[11px] font-bold text-white shadow-2xs font-inter leading-none">
            M
          </div>
          <span className="text-[16px] font-bold tracking-tight text-foreground font-sans">
            Mirancim
          </span>
        </Link>

        {/* Mobile Settings Link */}
        <Link
          href="/settings"
          className="flex h-8.5 w-8.5 items-center justify-center rounded-md border border-border bg-card text-xs font-bold text-foreground shadow-2xs hover:ring-2 hover:ring-foreground/20 transition-all"
          title={userName}
        >
          {userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </Link>
      </div>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar with Lucide Icons and WixMadeforText Typography */}
      <aside
        className={cn(
          "shrink-0 z-40 flex flex-col border-r border-border bg-sidebar transition-all duration-200 select-none font-sans",
          collapsed ? "lg:w-16" : "lg:w-[260px]",
          mobileOpen
            ? "fixed inset-y-0 left-0 w-[270px] max-w-[85vw] translate-x-0 shadow-2xl"
            : "fixed inset-y-0 left-0 -translate-x-full lg:static lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex h-13 items-center border-b border-border transition-all",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {/* Brand Headline with Small Round Orange M Icon & Mirancim */}
          {!collapsed ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 overflow-hidden"
              title="Mirancim"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[#ff5c16] text-[10.5px] font-bold text-white shadow-2xs font-inter leading-none">
                M
              </div>
              <span className="text-[16px] font-bold tracking-tight text-foreground truncate font-sans">
                Mirancim
              </span>
            </Link>
          ) : null}

          {/* Collapse Controls */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Kengaytirish" : "Kichraytirish"}
              className={cn(
                "hidden lg:flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors",
                collapsed ? "h-9 w-9" : "p-1.5"
              )}
            >
              <PanelLeft className="h-4.5 w-4.5 stroke-[1.75]" />
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav
          className={cn(
            "flex-1 space-y-1 py-3 transition-all",
            collapsed ? "px-2" : "px-3"
          )}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-md text-[13px] font-medium transition-colors group relative base44-btn",
                  collapsed
                    ? "h-9 w-9 mx-auto justify-center"
                    : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-foreground/[0.08] dark:bg-[#262626] text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-foreground/[0.04] dark:hover:bg-[#1f1f1f] hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "shrink-0 h-4.5 w-4.5 stroke-[1.75]",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Floating tooltip */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full ml-2.5 hidden rounded-md bg-popover px-2.5 py-1 text-xs font-semibold text-popover-foreground shadow-lg border border-border whitespace-nowrap group-hover:block z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card & Dropdown Popover */}
        <div
          ref={dropdownRef}
          className={cn(
            "border-t border-border relative transition-all",
            collapsed ? "p-2 flex justify-center" : "p-3"
          )}
        >
          {/* Spacious Dropdown Popover */}
          {profileDropdownOpen && (
            <div
              className={cn(
                "absolute bottom-[calc(100%+8px)] rounded-xl border border-border bg-card p-3 shadow-2xl z-50 space-y-2.5 text-foreground font-sans",
                collapsed ? "left-2 w-64" : "left-2.5 right-2.5"
              )}
            >
              {/* User details header */}
              <div className="pb-2 border-b border-border/80 px-2 pt-0.5">
                <p className="text-[13px] font-bold text-foreground truncate">{userName}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  @{username} • {userRole === "ADMIN" ? t.common.admin : t.common.teacher}
                </p>
              </div>

              {/* Settings Option (Clean neutral icon, navigates to /settings section) */}
              <Link
                href="/settings"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-semibold text-foreground rounded-md hover:bg-foreground/[0.05] transition-colors"
              >
                <Settings className="h-4 w-4 stroke-[1.75] text-muted-foreground" />
                <span>{t.nav.settings}</span>
              </Link>

              {/* Language Switch */}
              <div className="flex items-center justify-between px-2 py-1.5 text-xs">
                <span className="text-muted-foreground font-medium leading-none">{t.common.language}</span>
                <div className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5">
                  <button
                    onClick={() => setLocale("uz")}
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors leading-none",
                      locale === "uz"
                        ? "bg-foreground text-background shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    O&apos;Z
                  </button>
                  <button
                    onClick={() => setLocale("tr")}
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors leading-none",
                      locale === "tr"
                        ? "bg-foreground text-background shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    TR
                  </button>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between py-1.5 px-2 text-xs rounded-md hover:bg-foreground/[0.05] transition-colors"
              >
                <span className="text-muted-foreground font-medium">
                  {theme === "dark" ? t.common.themeLight : t.common.themeDark}
                </span>
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-400 stroke-[1.75]" />
                ) : (
                  <Moon className="h-4 w-4 text-zinc-600 stroke-[1.75]" />
                )}
              </button>

              {/* Sign out */}
              <div className="border-t border-border/80 pt-2">
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-semibold text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 stroke-[1.75]" />
                    {t.common.signOut}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Profile Trigger Button (Base44 style with ChevronsUpDown) */}
          {collapsed ? (
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              title={userName}
              className="relative flex h-9 w-9 items-center justify-center rounded-md bg-foreground/[0.08] dark:bg-[#262626] text-[11px] font-bold text-foreground border border-border hover:ring-2 hover:ring-foreground/20 transition-all"
            >
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </button>
          ) : (
            <div
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center justify-between rounded-md p-1.5 cursor-pointer hover:bg-foreground/[0.05] dark:hover:bg-[#202020] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-md bg-foreground/[0.08] dark:bg-[#262626] text-[11px] font-bold text-foreground border border-border">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-foreground leading-tight base44-btn">
                    {userName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    @{username} • {userRole === "ADMIN" ? t.common.admin : t.common.teacher}
                  </p>
                </div>
              </div>

              {/* Vertical double arrows (ChevronsUpDown) */}
              <div className="flex items-center shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1">
                <ChevronsUpDown className="h-4 w-4 stroke-[1.75]" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
