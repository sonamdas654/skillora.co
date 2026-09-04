import { redirect } from "next/navigation";

export default function AdminLeadDetailRedirect() {
  redirect("/admin/dashboard/leads");
}
