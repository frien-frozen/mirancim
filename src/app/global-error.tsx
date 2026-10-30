"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Fatal Error:", error);
  }, [error]);

  return (
    <html lang="uz" className="dark">
      <body className="min-h-screen bg-[#141414] text-white flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full rounded-2xl border border-[#262626] bg-[#181818] p-8 sm:p-10 shadow-2xl text-center space-y-6">
          {/* Logo Badge */}
          <div className="flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff5c16] text-white font-bold text-sm shadow-md">
              M
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Tizim xatoligi</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Sahifani yuklab bo&apos;lmadi
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kutilmagan server xatoligi yuz berdi. Sahifani yangilab qaytadan urinib ko&apos;ring.
            </p>
          </div>

          {error?.digest && (
            <div className="rounded-lg bg-white/[0.04] border border-[#262626] p-2 text-[11px] font-mono text-zinc-500">
              ID: {error.digest}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={() => reset()}
              className="w-full sm:flex-1 h-10 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5 stroke-[2]" />
              <span>Qayta urinish</span>
            </button>
            <a
              href="/login"
              className="w-full sm:flex-1 h-10 rounded-xl border border-[#262626] bg-[#202020] text-white font-semibold text-xs hover:bg-[#262626] transition-all flex items-center justify-center"
            >
              Kirish sahifasi
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

