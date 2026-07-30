// src/types/live-class.ts
export interface LiveClass {
  public_id: string;
  title: string;
  batch_title: string;
  teacher_name: string;
  scheduled_start: string;
  scheduled_end: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
}

export interface LiveClassDetail {
  public_id: string;
  title: string;
  batch: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  recording_enabled: boolean;
  chat_enabled: boolean;
  student_camera_allowed: boolean;
  student_mic_allowed: boolean;
  is_locked: boolean;
}

export interface AgoraJoinToken {
  channel_name: string;
  token: string;
  app_id: string;
  uid: number;
  role: string;
  expires_in: number;
}

export interface AttendanceRecord {
  public_id: string;
  student_name: string;
  joined_at: string;
  left_at: string | null;
  total_duration_seconds: number;
  is_late_join: boolean;
}