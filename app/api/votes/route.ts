import { NextResponse } from "next/server";

import { getTally, recordVotes, deleteAllVotes } from "@/lib/illustration/votes";
import { hasSupabaseConfigured } from "@/lib/illustration/supabase";

const NOT_CONFIGURED =
  "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. .env.local에 추가한 뒤 다시 시도해주세요.";

export async function GET() {
  if (!hasSupabaseConfigured()) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 500 });
  }

  try {
    return NextResponse.json({ tally: await getTally() });
  } catch (err) {
    return NextResponse.json({ error: describe(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseConfigured()) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const candidateIds = normalizeCandidateIds(body);
  if (candidateIds.length === 0) {
    return NextResponse.json({ error: "선택한 후보가 없습니다." }, { status: 400 });
  }

  try {
    await recordVotes(candidateIds);
    return NextResponse.json({ tally: await getTally() });
  } catch (err) {
    return NextResponse.json({ error: describe(err) }, { status: 500 });
  }
}

export async function DELETE() {
  if (!hasSupabaseConfigured()) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 500 });
  }

  try {
    await deleteAllVotes();
    return NextResponse.json({ message: "모든 투표가 삭제되었습니다." });
  } catch (err) {
    return NextResponse.json({ error: describe(err) }, { status: 500 });
  }
}

function normalizeCandidateIds(body: unknown): string[] {
  if (!body || typeof body !== "object" || !("candidateIds" in body)) return [];
  const raw = (body as { candidateIds: unknown }).candidateIds;
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string" && id.length > 0);
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : "처리 중 오류가 발생했습니다.";
}
