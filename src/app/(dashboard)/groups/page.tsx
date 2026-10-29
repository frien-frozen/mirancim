import { getGroups } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { GroupsClient } from "./groups-client";

export default async function GroupsPage() {
  const session = await getSession();
  const groups = await getGroups();

  return (
    <GroupsClient
      groups={JSON.parse(JSON.stringify(groups))}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
