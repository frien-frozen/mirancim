import { requireAuth } from "@/lib/auth";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await requireAuth();

  return (
    <SettingsClient
      session={{
        id: session.id,
        name: session.name,
        username: session.username,
        role: session.role,
      }}
    />
  );
}

