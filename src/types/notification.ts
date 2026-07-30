// src/types/notification.ts
export interface AppNotification {
  public_id: string;
  channel: string;
  category: string;
  title: string;
  body: string;
  deep_link: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  class_reminders_enabled: boolean;
  test_reminders_enabled: boolean;
  payment_alerts_enabled: boolean;
  content_alerts_enabled: boolean;
  doubt_alerts_enabled: boolean;
  offer_alerts_enabled: boolean;
  dnd_enabled: boolean;
  dnd_start_time: string | null;
  dnd_end_time: string | null;
}
