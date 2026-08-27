# 투표 데이터 저장소

## Decisions

- 생성된 일러스트 후보와 투표 결과는 Supabase(Postgres)에 저장한다.

## Boundaries

- 키워드 일러스트 생성기의 투표 기능에만 적용된다. 다른 데이터 저장이 필요해지면 다시 검토한다.
- 로컬에서 혼자 확인할 때는 저장소 없이도 동작해야 하지만, 실제 배포해서 여러 방문자가 투표하려면 이 저장소가 반드시 필요하다.

## Why

Vercel의 서버리스 환경에서는 파일 시스템에 직접 저장하는 방식이 요청마다 다른 인스턴스가 뜨고 배포마다 초기화되어 쓸 수 없다. Vercel KV/Upstash Redis도 대안으로 검토했으나, 사용자가 Supabase를 직접 지정했다.

## Reconsider when

- Supabase 무료 티어의 한도(요청 수, 저장 용량)를 넘어설 정도로 트래픽이 커질 때.

## Still-rejected alternatives

- Vercel KV / Upstash Redis — 투표 집계에는 충분하지만 사용자가 Supabase를 선택함.
- 파일 기반 저장 — Vercel 서버리스 환경에서 영속성이 보장되지 않아 기각.
