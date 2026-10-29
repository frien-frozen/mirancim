import { getStudents, getGroups } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { StudentsClient } from "./students-client";

export default async function StudentsPage() {
  await requireAdmin();
  const [students, groups] = await Promise.all([getStudents(), getGroups()]);

  return (
    <StudentsClient
      students={JSON.parse(JSON.stringify(students))}
      groups={JSON.parse(JSON.stringify(groups))}
    />
  );
}
