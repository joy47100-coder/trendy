# 키워드 소싱 방법론

## Decisions

- 카탈로그 키워드(`lib/illustration/catalog.ts`)는 제작자가 최종 결정한다.
- 후보 발굴은 `trend-keyword-research` Claude Code 스킬로 할 수 있다. 이 스킬은
  Pinterest Trends API나 네이버/구글 트렌드 API 같은 외부 API에 연동하지 않고,
  Claude Code 세션의 `WebSearch` 도구로 대체 조사한다.
- 스킬은 후보만 제시하고 `catalog.ts`를 직접 고치지 않는다. 사람이 검토 후
  직접 추가한다.

## Boundaries

- 미감 테스트 앱의 키워드 카탈로그에만 적용된다. 배포된 웹앱 자체는 여전히
  정적 카탈로그를 서빙할 뿐, 실시간 트렌드 조회 기능을 갖지 않는다.

## Why

사용자가 검토를 요청한 skill.md 2장은 Pinterest Trends API, 네이버/구글 트렌드
등 실시간 API 연동을 전제로 한 키워드 자동 추출을 제안했다. 하지만 이 프로젝트는
이미지 생성에서도 같은 이유로 외부 API 키를 피했다
([ai-image-backend 결정](ai-image-backend.md) — "별도 API 키 없이 Claude가
직접 그린다"). 키워드 리서치도 같은 원칙을 따르는 게 일관적이고, Claude Code
세션엔 이미 `WebSearch` 도구가 있어 API 키 없이도 비슷한 조사를 할 수 있다.

새 키워드 하나가 추가되면 화풍 5장을 다시 그려야 하는 비용이 있어서, 스킬이
`catalog.ts`를 자동으로 고치지 않고 후보만 제시하게 했다. 지금 스펙의 "생성
결과를 먼저 확인한 뒤" 패턴과도 일관된다.

## Reconsider when

- 키워드 추가 빈도가 늘어나서 사람이 매번 후보를 검토·추가하는 게 병목이 될 때.
- 실제 트렌드 데이터 API에 대한 접근 권한이 생겨서 WebSearch보다 정확한 조사가
  가능해질 때.

## Still-rejected alternatives

- Pinterest Trends API / 네이버·구글 트렌드 API 직접 연동 — 별도 개발자 키·계정이
  필요해 이미지 생성과 같은 이유로 기각.
- 스킬이 후보를 자동으로 `catalog.ts`에 추가 — 화풍 5장을 다시 그리는 비용이
  있는 작업을 사람 확인 없이 실행하는 건 과도하다고 판단해 기각.
