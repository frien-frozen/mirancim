"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-2xl space-y-6">
        {/* Brand Icon & Alert */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-xs">
            <AlertCircle className="h-6 w-6 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground base44-headline">
              Xatolik yuz berdi
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kutilmagan server xatoligi yuz berdi. Sahifani qayta yuklash orqali urinib ko&apos;rishingiz mumkin.
            </p>
          </div>
        </div>

        {/* Error Digest (if any) */}
        {error?.digest && (
          <div className="rounded-lg bg-foreground/[0.03] border border-border p-2 text-[11px] font-mono text-muted-foreground/70">
            Xato kodi: {error.digest}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:flex-1 h-10 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 base44-btn"
          >
            <RotateCcw className="h-3.5 w-3.5 stroke-[2]" />
            <span>Qayta urinish</span>
          </Button>

          <Link href="/dashboard" className="w-full sm:flex-1">
            <Button
              variant="outline"
              className="w-full h-10 rounded-xl border-border bg-background text-foreground font-semibold text-xs hover:bg-foreground/[0.04] transition-all flex items-center justify-center gap-2 base44-btn"
            >
              <Home className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>Bosh sahifa</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

