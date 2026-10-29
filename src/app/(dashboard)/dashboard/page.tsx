import { getDashboardStats } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await getDashboardStats();

  return (
    <DashboardClient
      stats={stats}
      userName={session?.name || "Repetitor"}
    />
  );
}
