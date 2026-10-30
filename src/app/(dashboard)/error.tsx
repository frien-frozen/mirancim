"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center font-sans shadow-2xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 mb-4">
        <AlertCircle className="h-6 w-6 stroke-[1.75]" />
      </div>
      <h2 className="text-xl font-bold text-foreground">
        Ma&apos;lumotlarni yuklashda xatolik
      </h2>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-sm">
        Sahifa ma&apos;lumotlarini olishda kutilmagan server xatoligi yuz berdi.
      </p>

      {error?.digest && (
        <span className="mt-2 text-[11px] font-mono text-muted-foreground/60">
          Xato ID: {error.digest}
        </span>
      )}

      <Button
        onClick={() => reset()}
        className="mt-5 h-9 px-5 gap-2 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 base44-btn"
      >
        <RotateCcw className="h-3.5 w-3.5 stroke-[2]" />
        <span>Qayta urinish</span>
      </Button>
    </div>
  );
}
