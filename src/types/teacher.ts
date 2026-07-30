// src/types/teacher.ts
export interface TeacherUser {
  public_id: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  role: string;
  profile_photo: string | null;
  is_approved: boolean;
  can_manage_teachers: boolean;
}

export interface TeacherDashboardOverview {
  total_students: number;
  total_batches: number;
  todays_classes_count: number;
  upcoming_classes_count: number;
  pending_tuition_bookings: number;
  pending_doubts: number;
  current_month_earnings: string;
}

export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}