// src/types/batch.ts
export interface Course {
  public_id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail_url: string;
}

export interface Batch {
  public_id: string;
  title: string;
  slug: string;
  course: Course;
  primary_teacher: { public_id: string; full_name: string; profile_photo: string | null };
  thumbnail_url: string;
  language: string;
  status: "draft" | "published" | "archived";
  price: string;
  discounted_price: string | null;
  effective_price: string;
  validity_start: string;
  validity_end: string;
  is_featured: boolean;
  average_rating: number | null;
  seats_available: number | null;
  created_at: string;
}

export interface BatchScheduleSlot {
  public_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject: string;
}

export interface BatchReview {
  public_id: string;
  student_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface EnrolledStudent {
  public_id: string;
  student_public_id: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  student_photo: string | null;
  target_exam: string | null;
  current_class: string | null;
  is_active: boolean;
  enrolled_at: string;
  expires_at: string;
  amount_paid: string;
  coupon_code_used: string;
}