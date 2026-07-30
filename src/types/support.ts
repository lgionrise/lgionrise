// src/types/support.ts
export interface HelpArticle {
  public_id: string;
  title: string;
  category: string;
  content: string;
}

export interface SupportTicket {
  public_id: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  created_at: string;
}

export interface TicketMessage {
  public_id: string;
  sender: string;
  sender_name: string;
  content: string;
  is_internal_note: boolean;
  created_at: string;
}
