import { requireAdmin } from "@/lib/auth";
import { getPayments, getGroups } from "@/lib/actions";
import { PaymentsClient } from "./payments-client";

export default async function PaymentsPage() {
  await requireAdmin();
  const [payments, groups] = await Promise.all([
    getPayments(),
    getGroups(),
  ]);

  return (
    <PaymentsClient
      initialStudents={JSON.parse(JSON.stringify(payments))}
      groups={JSON.parse(JSON.stringify(groups))}
    />
  );
}
