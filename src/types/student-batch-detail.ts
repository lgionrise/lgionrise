// src/types/student-batch-detail.ts
export interface BatchDetail {
  public_id: string;
  title: string;
  slug: string;
  course: { public_id: string; title: string; category: string; thumbnail_url: string };
  primary_teacher: { public_id: string; full_name: string; profile_photo: string | null };
  description: string;
  thumbnail_url: string;
  language: string;
  status: string;
  price: string;
  discounted_price: string | null;
  effective_price: string;
  validity_start: string;
  validity_end: string;
  is_featured: boolean;
  allow_downloads: boolean;
  demo_lecture_url: string;
  max_students: number | null;
  seats_available: number | null;
  schedules: Array<{ public_id: string; day_of_week: number; start_time: string; end_time: string; subject: string }>;
  is_wishlisted: boolean;
  is_enrolled: boolean;
}
