// src/types/tuition.ts
export interface TuitionProfile {
  public_id: string;
  subject: string;
  description: string;
  price_per_session: string;
  session_durations_minutes: number[];
  max_group_size: number;
  booking_window_days: number;
  cancellation_policy: string;
  reschedule_policy: string;
  cancellation_notice_hours: number;
  is_active: boolean;
}

export interface AvailabilitySlot {
  public_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface TuitionBooking {
  public_id: string;
  teacher_name: string;
  subject: string;
  scheduled_start: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "rejected" | "rescheduled" | "cancelled" | "completed" | "no_show";
  amount_charged: string;
  created_at: string;
}