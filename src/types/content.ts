// src/types/content.ts
export interface ContentItem {
  public_id: string;
  title: string;
  content_type: string;
  chapter_title: string | null;
  uploaded_by_name: string;
  file_size_bytes: number;
  page_count: number | null;
  allow_download: boolean;
  download_count: number;
  created_at: string;
}

export const CONTENT_TYPES = [
  { value: "notes", label: "Notes" },
  { value: "dpp", label: "DPP" },
  { value: "assignment", label: "Assignment" },
  { value: "worksheet", label: "Worksheet" },
  { value: "solution_sheet", label: "Solution Sheet" },
  { value: "formula_sheet", label: "Formula Sheet" },
  { value: "mind_map", label: "Mind Map" },
  { value: "cheat_sheet", label: "Cheat Sheet" },
  { value: "pyq", label: "Previous Year Question" },
  { value: "sample_paper", label: "Sample Paper" },
] as const;