export const CATEGORIES = [
  "transfer_residence",
  "age",
  "participation_limits",
  "academic_eligibility",
  "amateurism_awards",
  "undue_influence",
  "foreign_exchange",
  "enrollment_homeschool",
  "sportsmanship_conduct",
  "classification_scheduling",
  "officials",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface StateConfig {
  state_code: string;
  state_name: string;
  association_name: string;
  eligibility_contact_name: string | null;
  eligibility_contact_phone: string | null;
  eligibility_contact_email: string | null;
}

export interface BylawChunk {
  id: string;
  state_code: string;
  document_id: string | null;
  bylaw_id: string;
  title: string;
  body: string;
  effective_date: string;
  superseded_by: string | null;
  source_doc: string;
  source_page: number | null;
  category: Category;
}

export interface WatchedUrl {
  id: string;
  state_code: string;
  url: string;
  label: string;
  last_checked_at: string | null;
  last_changed_at: string | null;
  last_status: string | null;
  consecutive_failures: number;
  consecutive_unchanged_checks: number;
  content_hash: string | null;
}

export interface ReviewQueueItem {
  id: string;
  state_code: string;
  watched_url_id: string | null;
  blob_path: string;
  content_hash: string;
  diff_summary: string | null;
  status: "pending" | "approved" | "rejected";
  detected_at: string;
  reviewed_at: string | null;
  effective_date: string | null;
}

export interface Conversation {
  id: string;
  state_code: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  mode: "A" | "B" | "mixed" | null;
  created_at: string;
}
