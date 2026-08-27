---
name: trend-keyword-research
description: Research upcoming stock-illustration keyword trends (MiriCanvas, Canva, Adobe Stock, Pinterest, Naver/Google trends) 1-2 months ahead of season, and propose candidate keywords for the 미감 테스트 catalog. Use when the user wants to find what keyword to draw next.
---

# 트렌드 키워드 리서치

`lib/illustration/catalog.ts`에 다음으로 추가할 키워드 후보를 실시간 트렌드
조사로 찾는다. 이 스킬은 **후보를 제안만** 하고, `catalog.ts`를 직접 고치지
않는다 — 새 키워드 하나를 추가하면 화풍 5장을 다시 그려야 하는 비용이 있어서,
사람이 검토한 뒤 직접 추가하게 한다.

## 왜 API 연동이 아니라 이 스킬인가

Pinterest Trends API, 네이버/구글 트렌드 API는 별도 개발자 키·계정이 필요하다.
이 프로젝트는 이미지 생성([ai-image-backend 결정](../../../docs/decisions/ai-image-backend.md))에서도
"별도 API 키 없이 Claude가 직접 한다"는 원칙을 택했다. 키워드 리서치도 같은
원칙을 따라, Claude Code 세션의 `WebSearch` 도구로 대체 조사한다.
근거는 [keyword-sourcing 결정](../../../docs/decisions/keyword-sourcing.md) 참고.

## 절차

### 1. 대상 시즌 계산

오늘 날짜 기준 1~2개월 뒤 월/시즌을 계산한다 (예: 오늘이 8월이면 9~10월 —
할로윈, 가을 시즌 등). 스톡 디자인 소재는 시즌 소재를 미리 준비해두는 편이라
"지금 인기"가 아니라 "1~2개월 뒤에 팔릴" 키워드를 찾는 게 목적이다.

### 2. WebSearch로 아래 소스를 조사한다

각 소스마다 최소 1회 검색한다.

- **미리캔버스 디자인허브**: 공지사항·인기 태그·트렌드 관련 포스트
  - 쿼리 예: `미리캔버스 디자인허브 인기 검색어 트렌드 [대상월]`
- **Canva Design Trends**: 공식 트렌드 리포트
  - 쿼리 예: `Canva Design Trends [대상월/시즌] [연도]`
- **Adobe Stock Contributor Insights**: 기여자용 트렌드/수요 인사이트
  - 쿼리 예: `Adobe Stock Contributor Insights trending illustration [대상월]`
- **Pinterest 트렌드**: Pinterest Predicts 또는 트렌드 검색어
  - 쿼리 예: `Pinterest Trends [대상월/시즌] design illustration`
- **네이버/구글 트렌드**: 계절 급상승 디자인/일러스트 키워드
  - 쿼리 예: `[대상월] 시즌 인기 검색어 디자인 일러스트`

동적 쿼리 템플릿(원본 skill.md 2.2절 기준, `[...]`는 대상월/연도로 치환):
- `"[대상월] 디자인 요소 인기 검색어 트렌드"`
- `"Stock contributor trending illustration keywords [대상월/시즌]"`
- `"MiriCanvas Canva popular search elements [연도]"`

### 3. 필터링 (원본 skill.md 2.3절 기준)

검색 결과에서 나온 키워드 후보를 아래 기준으로 추린다.

- **오브젝트 중심성**: 배경 전체가 아니라 단독 요소(오브젝트/아이콘)로 분리
  가능한 명사만 남긴다. (지금 카탈로그의 맥주·커피·자전거·고양이·케이크와
  같은 성격.)
- **시즌 선행성**: 1단계에서 계산한 시즌에 맞는 키워드에 가중치를 둔다.
- **제외**: 특정 브랜드 로고, 상표권 침해 소지가 있는 캐릭터, 인물 고유명사는
  뺀다. `lib/illustration/catalog.ts`에 이미 있는 키워드와 겹치면 뺀다.

### 4. 결과 보고

`catalog.ts`를 고치지 않고, 아래 형식으로 후보를 사용자에게 제시한다.

```markdown
### 트렌드 키워드 후보: [키워드]
- 데이터 출처: [예: Adobe Stock Contributor Insights / 미리캔버스 인기 태그]
- 선정 근거: [대상 시즌 기준 선행 수요 분석 요약, 검색에서 실제로 확인된 내용]
```

후보는 최소 2~3개 이상 제시해서 사용자가 고를 수 있게 한다. 사용자가 키워드를
확정하면, `lib/illustration/catalog.ts`의 `CATALOG` 배열에 `{ slug, label }`을
추가하고 5개 화풍으로 그리는 건 별도 작업(이 스킬의 범위 밖)이다.
