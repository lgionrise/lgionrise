// src/lib/current-user.ts
import { redirect } from "next/navigation";
import { djangoFetch } from "./django-api";
import { TeacherUser } from "@/types/teacher";

export async function requireTeacher(): Promise < TeacherUser > {
  const res = await djangoFetch("/auth/profile/");
  if (!res.ok) redirect("/login");
  
  const user: TeacherUser = await res.json();
  if (user.role !== "teacher") redirect("/login?error=teachers_only");
  
  return user;
}