/** supabase/schema.sql과 맞춘 최소한의 수동 타입 정의. */
export interface Database {
  public: {
    Tables: {
      votes: {
        Row: { id: number; candidate_id: string; created_at: string };
        Insert: { candidate_id: string };
        Update: Partial<{ candidate_id: string }>;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
