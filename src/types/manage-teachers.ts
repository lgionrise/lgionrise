// src/types/manage-teachers.ts
export interface TeacherListItem {
  public_id: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  is_approved: boolean;
  is_suspended: boolean;
  can_manage_teachers: boolean;
  date_joined: string;
}
