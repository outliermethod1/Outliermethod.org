export interface StateOption {
  state_code: string;
  state_name: string;
  association_name: string;
  level: "high_school" | "college";
  covered?: boolean;
  chunk_count?: number;
  most_recent_effective_date?: string | null;
}
