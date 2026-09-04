import { redirect } from "next/navigation";

export default function AdminInvoicePrintRedirect() {
  redirect("/admin/dashboard/projects");
}
