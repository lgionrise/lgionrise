// src/types/test.ts
export type QuestionType = "mcq_single" | "mcq_multiple" | "numeric" | "integer" | "matrix_match";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  public_id: string;
  question_type: QuestionType;
  difficulty: "easy" | "medium" | "hard";
  chapter: string | null;
  topic: string | null;
  question_text: string;
  question_image_url: string;
  options: QuestionOption[];
  correct_answer: Record<string, unknown>;
  solution_text: string;
  default_marks: number;
  is_active: boolean;
}

export interface TestManage {
  public_id: string;
  batch: string;
  title: string;
  test_type: string;
  duration_minutes: number;
  total_marks: number;
  negative_marking_enabled: boolean;
  negative_marks_per_question: number;
  availability_start: string;
  availability_end: string;
  max_attempts_allowed: number;
  is_published: boolean;
}

export interface TestResults {
  stats: {
    avg_score: number | null;
    max_score: number | null;
    min_score: number | null;
    avg_accuracy: number | null;
    total_attempts: number;
  };
  attempts: Array<{
    public_id: string;
    attempt_number: number;
    status: string;
    total_score: number | null;
    accuracy_percent: number | null;
    submitted_at: string | null;
  }>;
}