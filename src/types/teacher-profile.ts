// src/types/teacher-profile.ts
export interface TeacherProfileDetail {
  public_id: string;
  bio: string;
  qualifications: string;
  years_of_experience: number;
  subjects: string[];
  video_intro_url: string;
  youtube_url: string;
  linkedin_url: string;
  other_social_url: string;
  is_profile_visible: boolean;
  has_verification_badge: boolean;
}