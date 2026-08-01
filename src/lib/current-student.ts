// src/lib/current-student.ts
import { redirect } from "next/navigation";
import { djangoFetch } from "./django-api";

export interface StudentUser {
  public_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export async function requireStudent(): Promise<StudentUser> {
  const res = await djangoFetch("/auth/profile/");
  if (!res.ok) redirect("/login");

  const user: StudentUser = await res.json();
  if (user.role !== "student") redirect("/login?error=students_only");

  return user;
}
