import "server-only";

import { getSupabaseClient } from "./supabase";

/** candidateId -> 득표수. 표가 없는 후보는 키가 없다. */
export type VoteTally = Record<string, number>;

export async function getTally(): Promise<VoteTally> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("votes").select("candidate_id");

  if (error) {
    throw new Error(`득표 조회 실패: ${error.message}`);
  }

  const tally: VoteTally = {};
  for (const row of data ?? []) {
    const id = row.candidate_id;
    tally[id] = (tally[id] ?? 0) + 1;
  }
  return tally;
}

export async function recordVotes(candidateIds: string[]): Promise<void> {
  if (candidateIds.length === 0) return;

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("votes")
    .insert(candidateIds.map((candidate_id) => ({ candidate_id })));

  if (error) {
    throw new Error(`투표 저장 실패: ${error.message}`);
  }
}

export async function deleteAllVotes(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("votes").delete().neq("id", 0);

  if (error) {
    throw new Error(`투표 삭제 실패: ${error.message}`);
  }
}
