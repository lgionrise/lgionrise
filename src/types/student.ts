// src/types/student.ts
export interface EnrolledBatch {
  public_id: string;
  batch: {
    public_id: string;
    title: string;
    slug: string;
    course: { public_id: string; title: string; category: string; thumbnail_url: string };
    thumbnail_url: string;
  };
  is_active: boolean;
  enrolled_at: string;
  expires_at: string;
  amount_paid: string;
}

export interface StudentLiveClass {
  public_id: string;
  title: string;
  batch_title: string;
  teacher_name: string;
  scheduled_start: string;
  scheduled_end: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
}
