import { requireAuth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userName={session.name} userRole={session.role} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1360px] px-8 py-7">{children}</div>
      </main>
    </div>
  );
}
