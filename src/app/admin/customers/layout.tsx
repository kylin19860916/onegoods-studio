import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";

export default async function AdminCustomersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login?next=/admin/customers");
  }

  return children;
}
