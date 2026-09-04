import { redirect } from "next/navigation";

export default function AdminInvoicesRedirect() {
  redirect("/admin/dashboard/projects");
}
