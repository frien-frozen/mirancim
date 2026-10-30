import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans bg-background">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/[0.04] text-muted-foreground border border-border">
            <FileQuestion className="h-6 w-6 stroke-[1.75]" />
          </div>
          <div className="space-y-1.5">
            <span className="text-4xl font-bold tracking-tight text-foreground base44-headline">
              404
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
              Sahifa topilmadi
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Siz qidirayotgan sahifa mavjud emas, nomi o&apos;zgargan yoki boshqa manzilga ko&apos;chirilgan bo&apos;lishi mumkin.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/dashboard">
            <Button className="w-full h-10 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 base44-btn">
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2]" />
              <span>Boshqaruv paneliga qaytish</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

