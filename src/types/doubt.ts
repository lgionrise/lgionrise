// src/types/doubt.ts
export interface DoubtListItem {
  public_id: string;
  student_name: string;
  source_type: string;
  text_content: string;
  priority: "normal" | "urgent";
  status: "open" | "answered" | "resolved" | "reopened";
  reply_count: number;
  created_at: string;
}

export interface DoubtReply {
  public_id: string;
  sender: string;
  sender_name: string;
  text_content: string;
  image_url: string;
  video_url: string;
  is_from_teacher: boolean;
  created_at: string;
}

export interface DoubtDetail {
  public_id: string;
  source_type: string;
  text_content: string;
  image_url: string;
  priority: string;
  status: string;
  replies: DoubtReply[];
}