-- Supabase 프로젝트의 SQL Editor에서 이 파일 내용을 그대로 실행하세요.

create table if not exists votes (
  id bigserial primary key,
  candidate_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists votes_candidate_id_idx on votes (candidate_id);
