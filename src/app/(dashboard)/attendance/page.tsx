import { getGroups } from "@/lib/actions";
import { AttendanceClient } from "./attendance-client";

export default async function AttendancePage() {
  const groups = await getGroups();

  return (
    <AttendanceClient groups={JSON.parse(JSON.stringify(groups))} />
  );
}
