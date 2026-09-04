import { redirect } from "next/navigation";

export default function AdminFollowupsRedirect() {
  redirect("/admin/dashboard/leads");
}
