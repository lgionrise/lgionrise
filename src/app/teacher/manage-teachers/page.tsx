// src/app/teacher/manage-teachers/page.tsx
import { redirect } from "next/navigation";
import { requireTeacher } from "@/lib/current-user";
import { ManageTeachersClient } from "@/components/teacher/manage-teachers-client";

export default async function ManageTeachersPage() {
  const user = await requireTeacher();

  // Server-side gate — even if someone hits this URL directly without the
  // sidebar link, the page itself refuses to render for a non-admin teacher.
  if (!user.can_manage_teachers) {
    redirect("/teacher");
  }

  return <ManageTeachersClient />;
}
