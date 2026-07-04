import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";

export default async function AdminProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login?next=/admin/products");
  }

  return children;
}
