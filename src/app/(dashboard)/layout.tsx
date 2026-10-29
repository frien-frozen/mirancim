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
      <Sidebar
        userName={session.name}
        userRole={session.role}
        username={session.username}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1360px] px-3.5 sm:px-6 lg:px-8 pt-18 pb-6 sm:py-6 lg:py-7">
          {children}
        </div>
      </main>
    </div>
  );
}
